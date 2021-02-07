import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Column,
} from 'typeorm';

import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('orders')
class Order {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Customer, customer => customer.id, { eager: true })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: Customer;

  @Column()
  customer_id: string;

  @OneToMany(() => OrdersProducts, ordersProduct => ordersProduct.order, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'order_id' })
  order_products: OrdersProducts[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Order;
