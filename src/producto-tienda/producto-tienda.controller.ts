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
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ProductoEntity } from '../producto/producto.entity';
import { plainToInstance } from 'class-transformer';
import { ProductoDto } from '../producto/producto.dto';
import { ProductoTiendaService } from './producto-tienda.service';
import { TiendaDto } from 'src/tienda/tienda.dto';
import { TiendaEntity } from 'src/tienda/tienda.entity';

@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductoTiendaController {
  constructor(private readonly productoTiendaService: ProductoTiendaService) {}

  @Post(':productoId/stores/:storeId')
  async addTiendaToProducto(
    @Param('productoId') productoId: string,
    @Param('storeId') storeId: string,
  ) {
    return await this.productoTiendaService.addTiendaToProducto(
      productoId,
      storeId,
    );
  }

  @Get(':productoId/stores/:storeId')
  async findProductoByRecetaIdProductoId(
    @Param('productoId') productoId: string,
    @Param('storeId') storeId: string,
  ) {
    return await this.productoTiendaService.findTiendaByProductoIdTiendaId(
      productoId,
      storeId,
    );
  }

  @Get(':productoId/stores')
  async findProductosByRecetaId(@Param('productoId') productoId: string) {
    return await this.productoTiendaService.findTiendasByProductoId(productoId);
  }

  @Put(':productoId/stores')
  async associateProductosReceta(
    @Body() tiendasDto: TiendaDto[],
    @Param('productoId') productoId: string,
  ) {
    const tiendas = plainToInstance(TiendaEntity, tiendasDto);
    return await this.productoTiendaService.updateTiendasProducto(
      productoId,
      tiendas,
    );
  }

  @Delete(':productoId/stores/:storeId')
  @HttpCode(204)
  async deleteProductoReceta(
    @Param('productoId') productoId: string,
    @Param('storeId') storeId: string,
  ) {
    return await this.productoTiendaService.deleteTiendaFromProducto(
      productoId,
      storeId,
    );
  }
}
