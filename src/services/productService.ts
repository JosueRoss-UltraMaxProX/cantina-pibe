import SQLite from 'react-native-sqlite-storage';
import { Product } from '../types';

export class ProductService {
  private db: SQLite.SQLiteDatabase;

  constructor(database: SQLite.SQLiteDatabase) {
    this.db = database;
  }

  async createProduct(product: Product): Promise<number> {
    const { name, description, price, category, image, available } = product;
    const result = await this.db.executeSql(
      `INSERT INTO products (name, description, price, category, image, available) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, price, category, image || null, available ? 1 : 0]
    );
    return result[0].insertId;
  }

  async getProducts(): Promise<Product[]> {
    const results = await this.db.executeSql('SELECT * FROM products ORDER BY name');
    const products: Product[] = [];
    
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      products.push({
        ...row,
        available: row.available === 1,
      });
    }
    
    return products;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const results = await this.db.executeSql(
      'SELECT * FROM products WHERE category = ? ORDER BY name',
      [category]
    );
    const products: Product[] = [];
    
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      products.push({
        ...row,
        available: row.available === 1,
      });
    }
    
    return products;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(product).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(key === 'available' ? (value ? 1 : 0) : value);
      }
    });
    
    values.push(id);
    
    await this.db.executeSql(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async deleteProduct(id: number): Promise<void> {
    await this.db.executeSql('DELETE FROM products WHERE id = ?', [id]);
  }
}