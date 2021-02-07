import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository') private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not exists');
    }

    const productsStoraged = await this.productsRepository.findAllById(
      products.map(({ quantity, ...rest }) => rest),
    );

    const serializedProducts = products.map(product => {
      const productStoraged = productsStoraged.find(x => x.id === product.id);

      if (!productStoraged) {
        throw new AppError(`Invalid product ${product.id}`);
      }

      if (productStoraged && productStoraged.quantity < product.quantity) {
        throw new AppError(
          `Invalid quantity to product ${productStoraged?.name}`,
        );
      }

      return {
        product_id: product.id,
        quantity: product.quantity,
        price: productStoraged.price,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: serializedProducts,
    });

    const { order_products } = order;

    const productsToUpdateQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        productsStoraged.filter(x => x.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(productsToUpdateQuantity);

    return order;
  }
}

export default CreateOrderService;
