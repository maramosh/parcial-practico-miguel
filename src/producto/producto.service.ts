import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from './producto.entity';
import { Repository } from 'typeorm/repository/Repository';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
  ) {}

  async findAll(): Promise<ProductoEntity[]> {
    return await this.productoRepository.find({
      relations: ['tiendas'],
    });
  }

  async findOne(id: string): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.productoRepository.findOne({
      where: { id },
      relations: ['tiendas'],
    });
    if (!producto)
      throw new BusinessLogicException(
        'El producto con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    return producto;
  }

  async create(producto: ProductoEntity): Promise<ProductoEntity> {
    if (producto.tipo !== 'Perecedero' && producto.tipo !== 'No perecedero')
      throw new BusinessLogicException(
        'El tipo de producto no es valido',
        BusinessError.PRECONDITION_FAILED,
      );

    return await this.productoRepository.save(producto);
  }

  async update(id: string, producto: ProductoEntity): Promise<ProductoEntity> {
    const productoExistente: ProductoEntity =
      await this.productoRepository.findOne({ where: { id } });
    if (!productoExistente)
      throw new BusinessLogicException(
        'El producto con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    if (producto.tipo !== 'Perecedero' && producto.tipo !== 'No perecedero')
      throw new BusinessLogicException(
        'El tipo de producto no es valido',
        BusinessError.PRECONDITION_FAILED,
      );

    producto.id = id;
    return await this.productoRepository.save(producto);
  }

  async delete(id: string) {
    const productoExistente: ProductoEntity =
      await this.productoRepository.findOne({ where: { id } });
    if (!productoExistente)
      throw new BusinessLogicException(
        'El producto con el id dado no existe',
        BusinessError.NOT_FOUND,
      );

    return await this.productoRepository.remove(productoExistente);
  }
}
