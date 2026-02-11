import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class GenerateSongDto {
  @IsNumber()
  @IsNotEmpty()
  seed!: number;

  @IsNumber()
  @IsNotEmpty()
  page!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(10)
  likes!: number;

  @IsString()
  @IsNotEmpty()
  localization!: string;
}
