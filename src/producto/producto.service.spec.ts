/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from './producto.service';
import { Repository } from 'typeorm';
import { ProductoEntity } from './producto.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: Repository<ProductoEntity>;
  let productosList: ProductoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoService],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<Repository<ProductoEntity>>(
      getRepositoryToken(ProductoEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    productosList = [];
    for (let i = 0; i < 5; i++) {
      const producto: ProductoEntity = await repository.save({
        nombre: faker.lorem.word(),
        precio: faker.number.int(5000),
        tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
      });
      productosList.push(producto);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return a list of productos', async () => {
    const productos: ProductoEntity[] = await service.findAll();
    expect(productos).not.toBeNull();
    expect(productos).toHaveLength(productosList.length);
  });

  it('findOne should return a product by id', async () => {
    const storedProduct: ProductoEntity = productosList[0];
    const product: ProductoEntity = await service.findOne(storedProduct.id);
    expect(product).not.toBeNull();
    expect(product.id).toEqual(storedProduct.id);
    expect(product.nombre).toEqual(storedProduct.nombre);
  });

  it('findOne should throw an exception for an invalid producto', async () => {
    await expect(service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no existe',
    );
  });

  it('create should return a new producto', async () => {
    const producto: ProductoEntity = {
      id: '',
      nombre: faker.lorem.word(),
      precio: faker.number.int(5000),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No perecedero']),
      tiendas: [],
    };

    const newproducto: ProductoEntity = await service.create(producto);
    expect(newproducto).not.toBeNull();

    expect(producto).not.toBeNull();
    expect(producto.id).toBeDefined();
    expect(producto.nombre).toBeDefined();
    expect(producto.precio).toBeDefined();
    expect(producto.tipo).toBeDefined();
  });

  it('create should throw an exception for an invalid schema', async () => {
    const producto: ProductoEntity = {
      id: '',
      nombre: faker.lorem.word(),
      precio: faker.number.int(5000),
      tipo: faker.lorem.word(),
      tiendas: [],
    };

    await expect(service.create(producto)).rejects.toHaveProperty(
      'message',
      'El tipo de producto no es valido',
    );
  });

  it('update should modify a producto', async () => {
    const producto: ProductoEntity = productosList[0];
    producto.nombre = 'Nuevo nombre';
    producto.precio = 3560;
    producto.tipo = 'No perecedero';
    const updatedProducto: ProductoEntity = await service.update(
      producto.id,
      producto,
    );
    expect(updatedProducto).not.toBeNull();
    const storedProducto: ProductoEntity = await repository.findOne({
      where: { id: producto.id },
    });
    expect(storedProducto).not.toBeNull();
    expect(storedProducto.id).toEqual(producto.id);
    expect(storedProducto.nombre).toEqual(producto.nombre);
    expect(storedProducto.precio).toEqual(producto.precio);
    expect(storedProducto.tipo).toEqual(producto.tipo);
  });

  it('update should modify a producto', async () => {
    const producto: ProductoEntity = productosList[0];
    producto.nombre = 'Nuevo nombre';
    producto.precio = 3560;
    producto.tipo = 'Error';

    await expect(service.update(producto.id, producto)).rejects.toHaveProperty(
      'message',
      'El tipo de producto no es valido',
    );
  });

  it('update should throw an exception for an invalid producto', async () => {
    let producto: ProductoEntity = productosList[0];
    producto = {
      ...producto,
      nombre: 'Nuevo nombre',
      precio: 3500,
    };
    await expect(service.update('0', producto)).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no existe',
    );
  });

  it('delete should remove a producto', async () => {
    const producto: ProductoEntity = productosList[0];
    await service.delete(producto.id);
    const storedProducto: ProductoEntity = await repository.findOne({
      where: { id: producto.id },
    });
    expect(storedProducto).toBeNull();
  });

  it('delete should throw an exception for an invalid producto', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El producto con el id dado no existe',
    );
  });
});
