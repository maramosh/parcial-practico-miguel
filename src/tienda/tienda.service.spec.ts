/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { TiendaService } from './tienda.service';
import { TiendaEntity } from './tienda.entity';

describe('TiendaService', () => {
  let service: TiendaService;
  let repository: Repository<TiendaEntity>;
  let tiendasList: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TiendaService],
    }).compile();

    service = module.get<TiendaService>(TiendaService);
    repository = module.get<Repository<TiendaEntity>>(
      getRepositoryToken(TiendaEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    tiendasList = [];
    for (let i = 0; i < 5; i++) {
      const tienda: TiendaEntity = await repository.save({
        nombre: faker.lorem.word(),
        ciudad: faker.lorem.word({
          length: 3,
        }),
        direccion: faker.lorem.word(),
        tiendaos: [],
      });
      tiendasList.push(tienda);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return a list of tiendas', async () => {
    const tiendas: TiendaEntity[] = await service.findAll();
    expect(tiendas).not.toBeNull();
    expect(tiendas).toHaveLength(tiendasList.length);
  });

  it('findOne should return a tienda by id', async () => {
    const storedTienda: TiendaEntity = tiendasList[0];
    const tienda: TiendaEntity = await service.findOne(storedTienda.id);
    expect(tienda).not.toBeNull();
    expect(tienda.id).toEqual(storedTienda.id);
    expect(tienda.nombre).toEqual(storedTienda.nombre);
  });

  it('findOne should throw an exception for an invalid tienda', async () => {
    await expect(service.findOne('0')).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no existe',
    );
  });

  it('create should return a new tienda', async () => {
    const tienda: TiendaEntity = {
      id: '',
      nombre: faker.lorem.word(),
      ciudad: faker.lorem.word({
        length: 3,
      }),
      direccion: faker.lorem.word(),
      productos: [],
    };

    const newtienda: TiendaEntity = await service.create(tienda);
    expect(newtienda).not.toBeNull();

    expect(tienda).not.toBeNull();
    expect(tienda.id).toBeDefined();
    expect(tienda.nombre).toBeDefined();
    expect(tienda.ciudad).toBeDefined();
    expect(tienda.direccion).toBeDefined();
  });

  it('create should throw an exception for an invalid schema', async () => {
    const tienda: TiendaEntity = {
      id: '',
      nombre: faker.lorem.word(),
      ciudad: faker.lorem.word({
        length: 5,
      }),
      direccion: faker.lorem.word(),
      productos: [],
    };
    await expect(service.create(tienda)).rejects.toHaveProperty(
      'message',
      'El codigo de la ciudad de la tienda no es valido. Debe ser un código de 3 letras',
    );
  });

  it('update should modify a tienda', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    tienda.nombre = 'Nuevo nombre';
    tienda.ciudad = 'MED';
    tienda.direccion = 'Nueva direccion';
    const updatedTienda: TiendaEntity = await service.update(tienda.id, tienda);
    expect(updatedTienda).not.toBeNull();
    const storedTienda: TiendaEntity = await repository.findOne({
      where: { id: tienda.id },
    });
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.id).toEqual(tienda.id);
    expect(storedTienda.ciudad).toEqual(tienda.ciudad);
    expect(storedTienda.direccion).toEqual(tienda.direccion);
  });

  it('update should throw an exception for an invalid schema', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    tienda.nombre = 'Nuevo nombre';
    tienda.ciudad = 'MEDELLIN';
    tienda.direccion = 'Nueva direccion';
    await expect(service.update(tienda.id, tienda)).rejects.toHaveProperty(
      'message',
      'El codigo de la ciudad de la tienda no es valido. Debe ser un código de 3 letras',
    );
  });

  it('update should throw an exception for an invalid tienda', async () => {
    let tienda: TiendaEntity = tiendasList[0];
    tienda = {
      ...tienda,
      nombre: 'Nuevo nombre',
      ciudad: 'MED',
      direccion: 'Nueva direccion',
    };
    await expect(service.update('0', tienda)).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no existe',
    );
  });

  it('delete should remove a tienda', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await service.delete(tienda.id);
    const storedTienda: TiendaEntity = await repository.findOne({
      where: { id: tienda.id },
    });
    expect(storedTienda).toBeNull();
  });

  it('delete should throw an exception for an invalid tienda', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no existe',
    );
  });
});
