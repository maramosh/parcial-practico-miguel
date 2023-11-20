import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors.interceptor';
import { plainToInstance } from 'class-transformer';
import { TiendaDto } from './tienda.dto';
import { TiendaEntity } from './tienda.entity';
import { TiendaService } from './tienda.service';

@Controller('stores')
@UseInterceptors(BusinessErrorsInterceptor)
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  @Get()
  async findAll() {
    return await this.tiendaService.findAll();
  }

  @Get(':storeId')
  async findOne(@Param('storeId') storeId: string) {
    return await this.tiendaService.findOne(storeId);
  }

  @Post()
  async create(@Body() tiendaDto: TiendaDto) {
    const producto: TiendaEntity = plainToInstance(TiendaEntity, tiendaDto);
    return await this.tiendaService.create(producto);
  }

  @Put(':storeId')
  async update(
    @Param('storeId') storeId: string,
    @Body() tiendaDto: TiendaDto,
  ) {
    const producto: TiendaEntity = plainToInstance(TiendaEntity, tiendaDto);
    return await this.tiendaService.update(storeId, producto);
  }

  @Delete(':storeId')
  @HttpCode(204)
  async delete(@Param('storeId') storeId: string) {
    return await this.tiendaService.delete(storeId);
  }
}
