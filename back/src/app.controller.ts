import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { GenerateSongDto } from './dto/GenerateSongDto.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getSongs(@Query() dto: GenerateSongDto): any {
    return this.appService.getSongs(dto);
  }
}
