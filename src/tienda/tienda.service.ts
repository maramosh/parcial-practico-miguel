import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { TiendaEntity } from './tienda.entity';

@Injectable()
export class TiendaService {
  constructor(
    @InjectRepository(TiendaEntity)
    private readonly tiendaRepository: Repository<TiendaEntity>,
  ) {}

  async findAll(): Promise<TiendaEntity[]> {
    return await this.tiendaRepository.find({
      relations: ['productos'],
    });
  }

  async findOne(id: string): Promise<TiendaEntity> {
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({
      where: { id },
      relations: ['productos'],
    });
    if (!tienda)
      throw new BusinessLogicException(
        'La tienda con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    return tienda;
  }

  async create(tienda: TiendaEntity): Promise<TiendaEntity> {
    if (tienda.ciudad.length !== 3)
      throw new BusinessLogicException(
        'El codigo de la ciudad de la tienda no es valido. Debe ser un código de 3 letras',
        BusinessError.PRECONDITION_FAILED,
      );

    return await this.tiendaRepository.save(tienda);
  }

  async update(id: string, tienda: TiendaEntity): Promise<TiendaEntity> {
    const tiendaExistente: TiendaEntity = await this.tiendaRepository.findOne({
      where: { id },
    });
    if (!tiendaExistente)
      throw new BusinessLogicException(
        'La tienda con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    if (tienda.ciudad.length !== 3)
      throw new BusinessLogicException(
        `El codigo de la ciudad de la tienda no es valido. Debe ser un código de 3 letras`,
        BusinessError.PRECONDITION_FAILED,
      );

    tienda.id = id;
    return await this.tiendaRepository.save(tienda);
  }

  async delete(id: string) {
    const tiendaExistente: TiendaEntity = await this.tiendaRepository.findOne({
      where: { id },
    });
    if (!tiendaExistente)
      throw new BusinessLogicException(
        'La tienda con el id dado no existe',
        BusinessError.NOT_FOUND,
      );

    return await this.tiendaRepository.remove(tiendaExistente);
  }
}
