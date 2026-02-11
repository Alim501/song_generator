import { AppService } from './app.service';
import { GenerateSongDto } from './dto/GenerateSongDto.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getSongs(dto: GenerateSongDto): any;
}
