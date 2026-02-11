import { GenerateSongDto } from './dto/GenerateSongDto.dto';
import { SongResponseDto } from './dto/SongResponseDto.dto';
export declare class AppService {
    getSongs(dto: GenerateSongDto): SongResponseDto[];
    private generateLikes;
    private generateSong;
    private getGenreParams;
    private generateMelody;
    private romanToChord;
    private parseDuration;
    private generateCover;
    private generateReview;
}
