import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthLogsService } from './health-logs.service';
import { CreateHealthLogDto } from './dto/create-health-log.dto';
import { UpdateHealthLogDto } from './dto/update-health-log.dto';

@Controller('health-logs')
export class HealthLogsController {
  constructor(private readonly healthLogsService: HealthLogsService) {}

  @Post()
  create(@Body() createHealthLogDto: CreateHealthLogDto) {
    return this.healthLogsService.create(createHealthLogDto);
  }

  @Get()
  findAll() {
    return this.healthLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHealthLogDto: UpdateHealthLogDto) {
    return this.healthLogsService.update(+id, updateHealthLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthLogsService.remove(+id);
  }
}
