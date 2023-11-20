import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductoTiendaService } from './producto-tienda.service';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';

describe('ProductoTiendaService', () => {
  let service: ProductoTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let productosList: ProductoEntity[];
  let tiendasList: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(
      getRepositoryToken(ProductoEntity),
    );
    tiendaRepository = module.get<Repository<TiendaEntity>>(
      getRepositoryToken(TiendaEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    productoRepository.clear();
    tiendaRepository.clear();

    tiendasList = [];
    for (let i = 0; i < 5; i++) {
      const tienda: TiendaEntity = await tiendaRepository.save({
        nombre: faker.lorem.word(),
        ciudad: faker.lorem.word({
          length: 3,
        }),
        direccion: faker.lorem.word(),
        productos: [],
      });
      tiendasList.push(tienda);
    }

    productosList = [];
    for (let i = 0; i < 5; i++) {
      const producto: ProductoEntity = await productoRepository.save({
        nombre: faker.lorem.word(),
        precio: faker.number.int(5000),
        tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
        tiendas: tiendasList,
      });
      productosList.push(producto);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addTiendaToProducto should add a producto to a receta', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.word(),
      ciudad: faker.lorem.word({
        length: 3,
      }),
      direccion: faker.lorem.word(),
      productos: [],
    });
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.word(),
      precio: faker.number.int(5000),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
    });

    const result: ProductoEntity = await service.addTiendaToProducto(
      newProducto.id,
      newTienda.id,
    );
    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].id).toEqual(newTienda.id);
    expect(result.tiendas[0].nombre).toEqual(newTienda.nombre);
    expect(result.tiendas[0].ciudad).toEqual(newTienda.ciudad);
    expect(result.tiendas[0].direccion).toEqual(newTienda.direccion);
  });

  it('addTiendaToProducto should throw an exception for an invalid tienda', async () => {
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.lorem.word(),
      precio: faker.number.int(5000),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
      tiendas: [],
    });
    await expect(
      service.addTiendaToProducto(newProducto.id, '0'),
    ).rejects.toHaveProperty('message', 'La tienda con el id dado no existe');
  });

  it('addTiendaToProducto should throw an exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.word(),
      ciudad: faker.lorem.word({
        length: 3,
      }),
      direccion: faker.lorem.word(),
      productos: [],
    });
    await expect(
      service.addTiendaToProducto('0', newTienda.id),
    ).rejects.toHaveProperty('message', 'El producto con el id dado no existe');
  });

  it('findTiendaByProductoIdTiendaId should return a producto by receta', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    const storedTienda: TiendaEntity =
      await service.findTiendaByProductoIdTiendaId(
        productosList[0].id,
        tienda.id,
      );
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.id).toEqual(tienda.id);
    expect(storedTienda.nombre).toEqual(tienda.nombre);
    expect(storedTienda.ciudad).toEqual(tienda.ciudad);
    expect(storedTienda.direccion).toEqual(tienda.direccion);
  });

  it('findTiendaByProductoIdTiendaId should throw an exception for an invalid tienda', async () => {
    await expect(
      service.findTiendaByProductoIdTiendaId(productosList[0].id, '0'),
    ).rejects.toHaveProperty('message', 'La tienda con el id dado no existe');
  });

  it('findTiendaByProductoIdTiendaId should throw an exception for an invalid producto', async () => {
    await expect(
      service.findTiendaByProductoIdTiendaId('0', tiendasList[0].id),
    ).rejects.toHaveProperty('message', 'El producto con el id dado no existe');
  });

  it('findTiendaByProductoIdTiendaId should throw an exception for a tienda not associated to the producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.word(),
      ciudad: faker.lorem.word({
        length: 5,
      }),
      direccion: faker.lorem.word(),
      productos: [],
    });
    await expect(
      service.findTiendaByProductoIdTiendaId(productosList[0].id, newTienda.id),
    ).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no está asociado al producto',
    );
  });

  it('findTiendasByProductoId should return a list of tiendas by producto', async () => {
    const storedTiendas: TiendaEntity[] = await service.findTiendasByProductoId(
      productosList[0].id,
    );
    expect(storedTiendas).not.toBeNull();
    expect(storedTiendas).toHaveLength(tiendasList.length);
    expect(storedTiendas.length).toBe(5);
  });

  it('findTiendasByProductoId should throw an exception for an invalid producto', async () => {
    await expect(service.findTiendasByProductoId('0')).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no existe',
    );
  });

  it('updateTiendasProducto should update a list of tiendas to a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.word(),
      ciudad: faker.lorem.word({
        length: 3,
      }),
      direccion: faker.lorem.word(),
      productos: [],
    });

    const updatedProducto: ProductoEntity = await service.updateTiendasProducto(
      productosList[0].id,
      [newTienda],
    );

    expect(updatedProducto.tiendas.length).toBe(1);
    expect(updatedProducto.tiendas[0]).not.toBeNull();
    expect(updatedProducto.tiendas[0].id).toEqual(newTienda.id);
    expect(updatedProducto.tiendas[0].nombre).toEqual(newTienda.nombre);
    expect(updatedProducto.tiendas[0].ciudad).toEqual(newTienda.ciudad);
    expect(updatedProducto.tiendas[0].direccion).toEqual(newTienda.direccion);
  });

  it('updateTiendasProducto should throw an exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.word(),
      ciudad: faker.lorem.word({
        length: 3,
      }),
      direccion: faker.lorem.word(),
      productos: [],
    });
    await expect(
      service.updateTiendasProducto('0', [newTienda]),
    ).rejects.toHaveProperty('message', 'El producto con el id dado no existe');
  });

  it('updateTiendasProducto should throw an exception for an invalid tienda', async () => {
    const newTienda: TiendaEntity = tiendasList[0];
    newTienda.id = '0';
    await expect(
      service.updateTiendasProducto(productosList[0].id, [newTienda]),
    ).rejects.toHaveProperty('message', 'La tienda con el id dado no existe');
  });

  it('deleteTiendaFromProducto should delete a tienda from a producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await service.deleteTiendaFromProducto(productosList[0].id, tienda.id);
    const storedProducto: ProductoEntity = await productoRepository.findOne({
      where: { id: productosList[0].id },
      relations: ['tiendas'],
    });
    const deletedProducto: TiendaEntity = storedProducto.tiendas.find(
      (e) => e.id === tienda.id,
    );
    expect(deletedProducto).toBeUndefined();
  });

  it('deleteTiendaFromProducto should throw an exception for an invalid tienda', async () => {
    await expect(
      service.deleteTiendaFromProducto(productosList[0].id, '0'),
    ).rejects.toHaveProperty('message', 'La tienda con el id dado no existe');
  });

  it('deleteTiendaFromProducto should throw an exception for an invalid producto', async () => {
    await expect(
      service.deleteTiendaFromProducto('0', tiendasList[0].id),
    ).rejects.toHaveProperty('message', 'El producto con el id dado no existe');
  });

  it('deleteTiendaFromProducto should throw an exception for a product not associated to the receta', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.lorem.word(),
      ciudad: faker.lorem.word({
        length: 3,
      }),
      direccion: faker.lorem.word(),
      productos: [],
    });
    await expect(
      service.deleteTiendaFromProducto(productosList[0].id, newTienda.id),
    ).rejects.toHaveProperty(
      'message',
      'La tienda con el id dado no está asociado al producto',
    );
  });
});
