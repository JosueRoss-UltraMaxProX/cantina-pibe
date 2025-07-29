import SQLite from 'react-native-sqlite-2';

const database_name = 'CantinaDaPibe.db';

export interface Database {
  transaction: (callback: (tx: any) => void) => void;
  executeSql: (sql: string, params?: any[]) => Promise<any>;
}

let db: Database | null = null;

export const getDBConnection = (): Database => {
  if (!db) {
    db = SQLite.openDatabase(database_name, '1.0', 'Cantina da Pibe', 5 * 1024 * 1024);
  }
  return db;
};

export const createTables = (database: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      // Tabela de produtos
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          category TEXT NOT NULL,
          image TEXT,
          available INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => console.log('Products table created'),
        (error: any) => console.error('Error creating products table:', error)
      );

      // Tabela de pedidos
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          total REAL NOT NULL,
          status TEXT NOT NULL,
          customer_name TEXT,
          customer_phone TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => console.log('Orders table created'),
        (error: any) => console.error('Error creating orders table:', error)
      );

      // Tabela de itens do pedido
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        );`,
        [],
        () => console.log('Order items table created'),
        (error: any) => console.error('Error creating order items table:', error)
      );

      // Tabela de categorias
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          icon TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => {
          console.log('Categories table created');
          resolve();
        },
        (error: any) => {
          console.error('Error creating categories table:', error);
          reject(error);
        }
      );
    });
  });
};

export const initDatabase = async (): Promise<Database> => {
  try {
    const database = getDBConnection();
    await createTables(database);
    await seedInitialData(database);
    return database;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Dados iniciais para teste
const seedInitialData = (database: Database): Promise<void> => {
  return new Promise((resolve) => {
    database.transaction((tx) => {
      // Inserir categorias padrão
      const categories = ['Lanches', 'Bebidas', 'Doces', 'Salgados'];
      categories.forEach((category) => {
        tx.executeSql(
          'INSERT OR IGNORE INTO categories (name) VALUES (?)',
          [category],
          () => console.log(`Category ${category} inserted`),
          (error: any) => console.error('Error inserting category:', error)
        );
      });

      // Inserir alguns produtos de exemplo
      const products = [
        { name: 'Hambúrguer', price: 15.00, category: 'Lanches', description: 'Hambúrguer artesanal' },
        { name: 'X-Burger', price: 18.00, category: 'Lanches', description: 'Com queijo e salada' },
        { name: 'Coca-Cola', price: 5.00, category: 'Bebidas', description: 'Lata 350ml' },
        { name: 'Água', price: 3.00, category: 'Bebidas', description: 'Garrafa 500ml' },
        { name: 'Brigadeiro', price: 2.50, category: 'Doces', description: 'Unidade' },
        { name: 'Coxinha', price: 6.00, category: 'Salgados', description: 'Coxinha de frango' },
      ];

      products.forEach((product) => {
        tx.executeSql(
          'INSERT OR IGNORE INTO products (name, price, category, description) VALUES (?, ?, ?, ?)',
          [product.name, product.price, product.category, product.description],
          () => console.log(`Product ${product.name} inserted`),
          (error: any) => console.error('Error inserting product:', error)
        );
      });

      resolve();
    });
  });
};