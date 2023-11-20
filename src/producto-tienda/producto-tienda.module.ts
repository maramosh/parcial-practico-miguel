import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from 'src/tienda/tienda.entity';
import { ProductoTiendaService } from './producto-tienda.service';
import { ProductoTiendaController } from './producto-tienda.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity, TiendaEntity])],
  providers: [ProductoTiendaService],
  controllers: [ProductoTiendaController],
})
export class ProductoTiendaModule {}
