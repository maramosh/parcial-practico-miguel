import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class TiendaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(3)
  ciudad: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;
}
