import { query, testConnection, closePool } from './Connection';
import bcrypt from 'bcryptjs';

/**
 * Database Seed Script
 * Populates your existing database with initial data
 */

const SALT_ROUNDS = 10;

const seedUsers = async (): Promise<void> => {
  console.log('📝 Duke shtuar përdoruesit...');
  
  const password = await bcrypt.hash('password123', SALT_ROUNDS);
  
  const users = [
    {
      email: 'admin@quickcash.com',
      password_hash: password,
      role: 'admin',
      full_name: 'Administrator',
      phone: '+355691234567'
    },
    {
      email: 'manager@quickcash.com',
      password_hash: password,
      role: 'manager',
      full_name: 'Manager User',
      phone: '+355692345678'
    },
    {
      email: 'staff@quickcash.com',
      password_hash: password,
      role: 'staff',
      full_name: 'Staff Demo',
      phone: '+355693456789'
    },
    {
      email: 'customer@quickcash.com',
      password_hash: password,
      role: 'customer',
      full_name: 'Customer Demo',
      phone: '+355694567890'
    }
  ];

  for (const user of users) {
    await query(`
      INSERT INTO users (email, password_hash, role, full_name, phone, is_active, is_verified, two_factor_enabled)
      VALUES ($1, $2, $3, $4, $5, true, true, false)
      ON CONFLICT (email) DO NOTHING
    `, [user.email, user.password_hash, user.role, user.full_name, user.phone]);
  }
  
  console.log('✅ Përdoruesit u shtuan\n');
};

const seedCategories = async (): Promise<void> => {
  console.log('📝 Duke shtuar kategoritë...');
  
  const categories = [
    { name: 'Pije të Nxehta', description: 'Kafe, çaj dhe pije të nxehta', icon: '☕', sort: 1 },
    { name: 'Pije të Ftohta', description: 'Lëngje, smoothie dhe pije të ftohta', icon: '🥤', sort: 2 },
    { name: 'Ushqime', description: 'Pjata kryesore dhe anësore', icon: '🍽️', sort: 3 },
    { name: 'Picë', description: 'Pica të ndryshme', icon: '🍕', sort: 4 },
    { name: 'Sanduiçe', description: 'Sanduiçe dhe burger', icon: '🥪', sort: 5 },
    { name: 'Sallata', description: 'Sallata të freskëta', icon: '🥗', sort: 6 },
    { name: 'Ëmbëlsira', description: 'Torta dhe ëmbëlsira', icon: '🍰', sort: 7 },
    { name: 'Snacks', description: 'Snacks dhe aperitivë', icon: '🍿', sort: 8 },
  ];

  for (const cat of categories) {
    await query(`
      INSERT INTO categories (category_name, description, icon, sort_order, is_active)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT DO NOTHING
    `, [cat.name, cat.description, cat.icon, cat.sort]);
  }
  
  console.log('✅ Kategoritë u shtuan\n');
};

const seedProducts = async (): Promise<void> => {
  console.log('📝 Duke shtuar produktet...');

  // Get category IDs
  const catResult = await query('SELECT category_id, category_name FROM categories');
  const categories: { [key: string]: number } = {};
  catResult.rows.forEach((row: any) => {
    categories[row.category_name] = row.category_id;
  });

  const products = [
    // Pije të Nxehta
    { cat: 'Pije të Nxehta', code: 'ESP-001', name: 'Espresso', cost: 50, price: 150, desc: 'Kafe e fortë italiane', qty: 100 },
    { cat: 'Pije të Nxehta', code: 'CAP-001', name: 'Cappuccino', cost: 70, price: 200, desc: 'Kafe me qumësht të shkumuar', qty: 100 },
    { cat: 'Pije të Nxehta', code: 'LAT-001', name: 'Latte', cost: 80, price: 220, desc: 'Kafe me shumë qumësht', qty: 100 },
    { cat: 'Pije të Nxehta', code: 'AME-001', name: 'Americano', cost: 55, price: 180, desc: 'Espresso me ujë të ngrohtë', qty: 100 },
    { cat: 'Pije të Nxehta', code: 'MAC-001', name: 'Macchiato', cost: 60, price: 170, desc: 'Espresso me pak shkumë', qty: 100 },
    { cat: 'Pije të Nxehta', code: 'MOC-001', name: 'Mocha', cost: 90, price: 250, desc: 'Kafe me çokollatë', qty: 100 },
    { cat: 'Pije të Nxehta', code: 'TEA-001', name: 'Çaj i Zi', cost: 30, price: 120, desc: 'Çaj i zi tradicional', qty: 100 },
    { cat: 'Pije të Nxehta', code: 'TEA-002', name: 'Çaj Jeshil', cost: 35, price: 130, desc: 'Çaj jeshil organik', qty: 100 },
    
    // Pije të Ftohta
    { cat: 'Pije të Ftohta', code: 'OJ-001', name: 'Lëng Portokalli', cost: 100, price: 250, desc: 'Lëng portokalli i freskët', qty: 50 },
    { cat: 'Pije të Ftohta', code: 'LEM-001', name: 'Limonadë', cost: 80, price: 200, desc: 'Limonadë e freskët', qty: 50 },
    { cat: 'Pije të Ftohta', code: 'ICE-001', name: 'Ice Coffee', cost: 90, price: 230, desc: 'Kafe e ftohtë me akull', qty: 80 },
    { cat: 'Pije të Ftohta', code: 'SMO-001', name: 'Smoothie Fruta', cost: 120, price: 300, desc: 'Smoothie me fruta të përziera', qty: 40 },
    { cat: 'Pije të Ftohta', code: 'WAT-001', name: 'Ujë Mineral', cost: 30, price: 100, desc: 'Ujë mineral 500ml', qty: 200 },
    { cat: 'Pije të Ftohta', code: 'COL-001', name: 'Coca Cola', cost: 80, price: 150, desc: 'Coca Cola 330ml', qty: 100 },
    
    // Picë
    { cat: 'Picë', code: 'PIZ-001', name: 'Margherita', cost: 250, price: 600, desc: 'Picë klasike me domate dhe mocarella', qty: 30 },
    { cat: 'Picë', code: 'PIZ-002', name: 'Pepperoni', cost: 300, price: 700, desc: 'Picë me pepperoni', qty: 30 },
    { cat: 'Picë', code: 'PIZ-003', name: 'Quattro Formaggi', cost: 350, price: 800, desc: 'Picë me 4 lloje djathi', qty: 25 },
    { cat: 'Picë', code: 'PIZ-004', name: 'Prosciutto', cost: 320, price: 750, desc: 'Picë me proshutë dhe rukola', qty: 25 },
    
    // Sanduiçe
    { cat: 'Sanduiçe', code: 'SAN-001', name: 'Club Sandwich', cost: 220, price: 500, desc: 'Sanduiç me pule, proshutë dhe djathë', qty: 40 },
    { cat: 'Sanduiçe', code: 'SAN-002', name: 'Tuna Sandwich', cost: 200, price: 450, desc: 'Sanduiç me ton', qty: 35 },
    { cat: 'Sanduiçe', code: 'BUR-001', name: 'Cheeseburger', cost: 280, price: 600, desc: 'Burger me djathë dhe perime', qty: 40 },
    { cat: 'Sanduiçe', code: 'BUR-002', name: 'Chicken Burger', cost: 260, price: 550, desc: 'Burger me fileto pule', qty: 40 },
    
    // Sallata
    { cat: 'Sallata', code: 'SAL-001', name: 'Caesar Salad', cost: 200, price: 450, desc: 'Sallatë me pule dhe salcë caesar', qty: 30 },
    { cat: 'Sallata', code: 'SAL-002', name: 'Greek Salad', cost: 180, price: 400, desc: 'Sallatë greke me feta', qty: 30 },
    { cat: 'Sallata', code: 'SAL-003', name: 'Caprese', cost: 190, price: 420, desc: 'Domate, mocarella dhe borzilok', qty: 25 },
    
    // Ëmbëlsira
    { cat: 'Ëmbëlsira', code: 'DES-001', name: 'Tiramisu', cost: 150, price: 350, desc: 'Ëmbëlsirë italiane klasike', qty: 20 },
    { cat: 'Ëmbëlsira', code: 'DES-002', name: 'Cheesecake', cost: 140, price: 320, desc: 'Tortë me djathë kremoz', qty: 20 },
    { cat: 'Ëmbëlsira', code: 'DES-003', name: 'Chocolate Cake', cost: 130, price: 300, desc: 'Tortë çokollatë', qty: 25 },
    { cat: 'Ëmbëlsira', code: 'DES-004', name: 'Panna Cotta', cost: 100, price: 250, desc: 'Panna cotta me fruta', qty: 20 },
    { cat: 'Ëmbëlsira', code: 'DES-005', name: 'Gelato', cost: 80, price: 200, desc: 'Akullore italiane', qty: 50 },
    
    // Snacks
    { cat: 'Snacks', code: 'SNK-001', name: 'Patate të Skuqura', cost: 80, price: 200, desc: 'Patate të skuqura me salcë', qty: 50 },
    { cat: 'Snacks', code: 'SNK-002', name: 'Mozzarella Sticks', cost: 120, price: 280, desc: 'Shkopinj mocarelle të skuqur', qty: 40 },
    { cat: 'Snacks', code: 'SNK-003', name: 'Chicken Wings', cost: 150, price: 350, desc: 'Krahë pule të skuqura', qty: 35 },
    { cat: 'Snacks', code: 'SNK-004', name: 'Nachos', cost: 100, price: 250, desc: 'Nachos me djathë dhe salsa', qty: 40 },
  ];

  for (const prod of products) {
    const categoryId = categories[prod.cat];
    
    // Insert product (profit_margin is auto-generated)
    const productResult = await query(`
      INSERT INTO products (category_id, product_code, product_name, description, cost_price, selling_price, tax_rate, is_available, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, 20, true, false)
      ON CONFLICT (product_code) DO NOTHING
      RETURNING product_id
    `, [categoryId, prod.code, prod.name, prod.desc, prod.cost, prod.price]);

    // Insert inventory if product was created
    if (productResult.rows.length > 0) {
      const productId = productResult.rows[0].product_id;
      await query(`
        INSERT INTO inventory (product_id, current_quantity, minimum_quantity, maximum_quantity)
        VALUES ($1, $2, 10, 200)
        ON CONFLICT DO NOTHING
      `, [productId, prod.qty]);
    }
  }
  
  console.log('✅ Produktet u shtuan\n');
};

const seedCustomers = async (): Promise<void> => {
  console.log('📝 Duke shtuar klientët demo...');
  
  const customers = [
    { code: 'CUST-001', first: 'Arta', last: 'Hoxha', email: 'arta@email.com', phone: '+355691111111' },
    { code: 'CUST-002', first: 'Besnik', last: 'Krasniqi', email: 'besnik@email.com', phone: '+355692222222' },
    { code: 'CUST-003', first: 'Drita', last: 'Gashi', email: 'drita@email.com', phone: '+355693333333' },
  ];

  for (const cust of customers) {
    await query(`
      INSERT INTO customers (customer_code, first_name, last_name, email, phone, is_member)
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (customer_code) DO NOTHING
    `, [cust.code, cust.first, cust.last, cust.email, cust.phone]);
  }
  
  console.log('✅ Klientët u shtuan\n');
};

/**
 * Run seed
 */
const runSeed = async (): Promise<void> => {
  console.log('\n🌱 Duke filluar mbushjen e databazës...\n');

  try {
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Nuk mund të lidhem me databazën.');
      process.exit(1);
    }

    await seedUsers();
    await seedCategories();
    await seedProducts();
    await seedCustomers();

    console.log('🎉 Mbushja e databazës përfundoi me sukses!');
    console.log('\n📋 Kredencialet për test:');
    console.log('   Admin:    admin@quickcash.com / password123');
    console.log('   Manager:  manager@quickcash.com / password123');
    console.log('   Staff:    staff@quickcash.com / password123');
    console.log('   Customer: customer@quickcash.com / password123\n');
    
  } catch (error) {
    console.error('❌ Gabim:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
};

runSeed();