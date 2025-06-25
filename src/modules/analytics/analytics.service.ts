import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Analytics, UserDashboardSettings, AnalyticsType, PeriodType } from './entities/analytics.entity';
import { CreateAnalyticsDto, UpdateAnalyticsDto, CreateDashboardSettingsDto } from './dto/analytics.dto';
import { UsersService } from '../users/users.service';
import { HealthLogsService } from '../health-logs/health-logs.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
    @InjectRepository(UserDashboardSettings)
    private readonly dashboardSettingsRepository: Repository<UserDashboardSettings>,
    private readonly usersService: UsersService,
    private readonly healthLogsService: HealthLogsService,
  ) {}

  async create(createAnalyticsDto: CreateAnalyticsDto): Promise<Analytics> {
    // Validate user exists
    await this.usersService.findOne(createAnalyticsDto.user_id);

    const analytics = this.analyticsRepository.create(createAnalyticsDto);
    return await this.analyticsRepository.save(analytics);
  }

  async findUserAnalytics(
    userId: string,
    type?: AnalyticsType,
    periodType?: PeriodType,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ analytics: Analytics[]; total: number; page: number; limit: number; total_pages: number }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;
    const whereCondition: any = { user_id: userId };

    if (type) whereCondition.type = type;
    if (periodType) whereCondition.period_type = periodType;
    if (startDate && endDate) {
      whereCondition.period_start = Between(startDate, endDate);
    } else if (startDate) {
      whereCondition.period_start = MoreThanOrEqual(startDate);
    } else if (endDate) {
      whereCondition.period_start = LessThanOrEqual(endDate);
    }

    const [analytics, total] = await this.analyticsRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        }
      },
      order: { period_start: 'DESC' },
      take: limit,
      skip,
    });

    return {
      analytics,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async getDashboardSummary(userId: string, period: PeriodType = PeriodType.WEEKLY): Promise<{
    overview: Record<string, any>;
    charts: Record<string, any>;
    goals: Record<string, any>;
    insights: string[];
    achievements: string[];
  }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const endDate = new Date();
    const startDate = this.calculatePeriodStart(endDate, period);

    // Get analytics for the period
    const analytics = await this.analyticsRepository.find({
      where: {
        user_id: userId,
        period_start: Between(startDate, endDate),
      },
      order: { period_start: 'DESC' },
    });

    // Calculate overview metrics
    const overview = await this.calculateOverviewMetrics(userId, analytics);
    
    // Prepare chart data
    const charts = await this.prepareChartData(userId, analytics, period);
    
    // Calculate goals progress
    const goals = await this.calculateGoalsProgress(userId, analytics);
    
    // Collect insights and achievements
    const insights = this.collectInsights(analytics);
    const achievements = this.collectAchievements(analytics);

    return {
      overview,
      charts,
      goals,
      insights,
      achievements,
    };
  }

  async generateWeightAnalytics(userId: string): Promise<Analytics> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Get health logs for weight tracking
    const healthLogs = await this.healthLogsService.findByUser(userId, 1, 100);
    const weightLogs = healthLogs.health_logs.filter(log => 
      log.additional_metrics && 
      log.additional_metrics.weight && 
      new Date(log.date) >= startDate
    );

    if (weightLogs.length === 0) {
      throw new NotFoundException('No weight data found for analytics generation');
    }

    const weights = weightLogs.map(log => parseFloat(log.additional_metrics.weight));
    const averageWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const weightChange = weights.length > 1 ? weights[weights.length - 1] - weights[0] : 0;
    
    const metrics = {
      average_weight: Math.round(averageWeight * 10) / 10,
      weight_change: Math.round(weightChange * 10) / 10,
      measurements_count: weights.length,
      trend: weightChange > 0 ? 'increasing' : weightChange < 0 ? 'decreasing' : 'stable',
      min_weight: Math.min(...weights),
      max_weight: Math.max(...weights),
    };

    const insights = {
      summary: this.generateWeightInsightSummary(metrics),
      recommendations: this.generateWeightRecommendations(metrics),
      achievements: this.generateWeightAchievements(metrics),
    };

    const score = this.calculateWeightScore(metrics);

    const createDto: CreateAnalyticsDto = {
      type: AnalyticsType.WEIGHT_TRACKING,
      period_type: PeriodType.WEEKLY,
      period_start: startDate,
      period_end: endDate,
      metrics,
      insights,
      score,
      user_id: userId,
    };

    return await this.create(createDto);
  }

  async findOne(id: string): Promise<Analytics> {
    const analytics = await this.analyticsRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          profile_image: true,
        }
      }
    });

    if (!analytics) {
      throw new NotFoundException(`Analytics with ID ${id} not found`);
    }

    return analytics;
  }

  async update(id: string, updateAnalyticsDto: UpdateAnalyticsDto): Promise<Analytics> {
    const analytics = await this.findOne(id);
    Object.assign(analytics, updateAnalyticsDto);
    return await this.analyticsRepository.save(analytics);
  }

  async remove(id: string): Promise<void> {
    const analytics = await this.findOne(id);
    await this.analyticsRepository.remove(analytics);
  }

  // Dashboard Settings Methods
  async createDashboardSettings(createDto: CreateDashboardSettingsDto): Promise<UserDashboardSettings> {
    await this.usersService.findOne(createDto.user_id);

    // Check if settings already exist
    const existing = await this.dashboardSettingsRepository.findOne({
      where: { user_id: createDto.user_id },
    });

    if (existing) {
      // Update existing settings
      Object.assign(existing, createDto);
      return await this.dashboardSettingsRepository.save(existing);
    }

    const settings = this.dashboardSettingsRepository.create(createDto);
    return await this.dashboardSettingsRepository.save(settings);
  }

  async getUserDashboardSettings(userId: string): Promise<UserDashboardSettings> {
    await this.usersService.findOne(userId);

    const settings = await this.dashboardSettingsRepository.findOne({
      where: { user_id: userId },
    });

    if (!settings) {
      // Create default settings
      const defaultSettings: CreateDashboardSettingsDto = {
        widget_preferences: {
          weight_chart: { enabled: true, position: 1 },
          workout_summary: { enabled: true, position: 2 },
          goals_progress: { enabled: true, position: 3 },
          recent_activities: { enabled: true, position: 4 },
        },
        chart_preferences: {
          weight_chart_type: 'line',
          workout_chart_type: 'bar',
          show_trends: true,
          show_goals: true,
        },
        notification_preferences: {
          weekly_summary: true,
          goal_achievements: true,
          milestone_alerts: true,
          trend_insights: true,
        },
        theme: 'light',
        units_preference: 'metric',
        user_id: userId,
      };

      return await this.createDashboardSettings(defaultSettings);
    }

    return settings;
  }

  // Private helper methods
  private calculatePeriodStart(endDate: Date, period: PeriodType): Date {
    const start = new Date(endDate);
    
    switch (period) {
      case PeriodType.DAILY:
        start.setDate(start.getDate() - 1);
        break;
      case PeriodType.WEEKLY:
        start.setDate(start.getDate() - 7);
        break;
      case PeriodType.MONTHLY:
        start.setMonth(start.getMonth() - 1);
        break;
      case PeriodType.YEARLY:
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return start;
  }

  private async calculateOverviewMetrics(userId: string, analytics: Analytics[]): Promise<Record<string, any>> {
    const weightAnalytics = analytics.filter(a => a.type === AnalyticsType.WEIGHT_TRACKING);
    const workoutAnalytics = analytics.filter(a => a.type === AnalyticsType.WORKOUT_SUMMARY);
    
    return {
      total_analytics: analytics.length,
      average_score: analytics.length > 0 
        ? Math.round(analytics.reduce((sum, a) => sum + (a.score || 0), 0) / analytics.length * 10) / 10
        : 0,
      weight_trend: weightAnalytics.length > 0 ? weightAnalytics[0].metrics.trend : 'no_data',
      workouts_completed: workoutAnalytics.reduce((sum, a) => sum + (a.metrics.workouts_count || 0), 0),
    };
  }

  private async prepareChartData(userId: string, analytics: Analytics[], period: PeriodType): Promise<Record<string, any>> {
    return {
      weight_chart: this.prepareWeightChartData(analytics),
      workout_chart: this.prepareWorkoutChartData(analytics),
      score_trend: this.prepareScoreTrendData(analytics),
    };
  }

  private prepareWeightChartData(analytics: Analytics[]): any[] {
    return analytics
      .filter(a => a.type === AnalyticsType.WEIGHT_TRACKING)
      .map(a => ({
        date: a.period_start,
        weight: a.metrics.average_weight,
        change: a.metrics.weight_change,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private prepareWorkoutChartData(analytics: Analytics[]): any[] {
    return analytics
      .filter(a => a.type === AnalyticsType.WORKOUT_SUMMARY)
      .map(a => ({
        date: a.period_start,
        workouts: a.metrics.workouts_count || 0,
        duration: a.metrics.total_duration || 0,
        calories: a.metrics.calories_burned || 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private prepareScoreTrendData(analytics: Analytics[]): any[] {
    return analytics
      .map(a => ({
        date: a.period_start,
        score: a.score || 0,
        type: a.type,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private async calculateGoalsProgress(userId: string, analytics: Analytics[]): Promise<Record<string, any>> {
    // This would integrate with user goals when we implement that feature
    return {
      weight_loss: { target: 5, achieved: 1.2, percentage: 24 },
      workout_frequency: { target: 5, achieved: 4, percentage: 80 },
      sleep_hours: { target: 8, achieved: 7.5, percentage: 94 },
    };
  }

  private collectInsights(analytics: Analytics[]): string[] {
    const insights: string[] = [];
    
    analytics.forEach(a => {
      if (a.insights && a.insights.summary) {
        insights.push(a.insights.summary);
      }
    });
    
    return insights.slice(0, 5); // Limit to 5 most recent insights
  }

  private collectAchievements(analytics: Analytics[]): string[] {
    const achievements: string[] = [];
    
    analytics.forEach(a => {
      if (a.insights && a.insights.achievements) {
        achievements.push(...a.insights.achievements);
      }
    });
    
    return [...new Set(achievements)].slice(0, 10); // Remove duplicates, limit to 10
  }

  private generateWeightInsightSummary(metrics: any): string {
    const { weight_change, trend, measurements_count } = metrics;
    
    if (measurements_count < 2) {
      return 'Not enough data for trend analysis. Keep tracking your weight consistently.';
    }
    
    if (trend === 'decreasing') {
      return `Great progress! You lost ${Math.abs(weight_change)}kg this week. Keep up the good work!`;
    } else if (trend === 'increasing') {
      return `You gained ${weight_change}kg this week. Consider reviewing your diet and exercise routine.`;
    } else {
      return `Your weight remained stable this week. Consistency is key for your health journey.`;
    }
  }

  private generateWeightRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];
    const { trend, measurements_count } = metrics;
    
    if (measurements_count < 7) {
      recommendations.push('Track your weight daily for better insights');
    }
    
    if (trend === 'increasing') {
      recommendations.push('Consider reducing calorie intake');
      recommendations.push('Increase physical activity');
      recommendations.push('Monitor portion sizes');
    } else if (trend === 'decreasing') {
      recommendations.push('Continue current nutrition plan');
      recommendations.push('Maintain exercise routine');
      recommendations.push('Stay hydrated');
    }
    
    return recommendations;
  }

  private generateWeightAchievements(metrics: any): string[] {
    const achievements: string[] = [];
    const { measurements_count, trend } = metrics;
    
    if (measurements_count >= 7) {
      achievements.push('7-day tracking streak achieved!');
    }
    
    if (trend === 'decreasing') {
      achievements.push('Weekly weight loss goal achieved');
    }
    
    return achievements;
  }

  private calculateWeightScore(metrics: any): number {
    let score = 50; // Base score
    
    // Award points for consistent tracking
    score += Math.min(metrics.measurements_count * 5, 30);
    
    // Award points for positive trend (weight loss)
    if (metrics.trend === 'decreasing') {
      score += 20;
    } else if (metrics.trend === 'stable') {
      score += 10;
    }
    
    return Math.min(Math.max(score, 0), 100);
  }
}