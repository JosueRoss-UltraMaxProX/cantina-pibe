import SQLite from 'react-native-sqlite-storage';
import { Order, OrderItem, OrderStatus } from '../types';

export class OrderService {
  private db: SQLite.SQLiteDatabase;

  constructor(database: SQLite.SQLiteDatabase) {
    this.db = database;
  }

  async createOrder(order: Order): Promise<number> {
    const { total, status, customer_name, customer_phone, notes, items } = order;
    
    await this.db.transaction(async (tx) => {
      const orderResult = await tx.executeSql(
        `INSERT INTO orders (total, status, customer_name, customer_phone, notes) 
         VALUES (?, ?, ?, ?, ?)`,
        [total, status, customer_name || null, customer_phone || null, notes || null]
      );
      
      const orderId = orderResult[0].insertId;
      
      if (items && items.length > 0) {
        for (const item of items) {
          await tx.executeSql(
            `INSERT INTO order_items (order_id, product_id, quantity, price) 
             VALUES (?, ?, ?, ?)`,
            [orderId, item.product_id, item.quantity, item.price]
          );
        }
      }
      
      return orderId;
    });
    
    return 0;
  }

  async getOrders(): Promise<Order[]> {
    const results = await this.db.executeSql(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    const orders: Order[] = [];
    
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      const items = await this.getOrderItems(row.id);
      orders.push({
        ...row,
        items,
      });
    }
    
    return orders;
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const results = await this.db.executeSql(
      'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    const orders: Order[] = [];
    
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      const items = await this.getOrderItems(row.id);
      orders.push({
        ...row,
        items,
      });
    }
    
    return orders;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const results = await this.db.executeSql(
      `SELECT oi.*, p.name, p.description, p.category, p.image 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    const items: OrderItem[] = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      items.push({
        id: row.id,
        order_id: row.order_id,
        product_id: row.product_id,
        quantity: row.quantity,
        price: row.price,
        product: {
          id: row.product_id,
          name: row.name,
          description: row.description,
          price: row.price,
          category: row.category,
          image: row.image,
          available: true,
        },
      });
    }
    
    return items;
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
    await this.db.executeSql(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
  }

  async deleteOrder(id: number): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.executeSql('DELETE FROM order_items WHERE order_id = ?', [id]);
      await tx.executeSql('DELETE FROM orders WHERE id = ?', [id]);
    });
  }
}