// seed-database.js
// QuickCash - Script për të populuar database me të dhëna test
// Run: node seed-database.js

const { Client } = require('pg');
const bcrypt = require('bcrypt');

// ===========================================
// DATABASE CONNECTION
// ===========================================
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'quickcash_db',
  user: 'postgres',
  password: 'Ergi10' // NDRYSHO këtë me password tënden!
});

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Gjenero random date në një range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Gjenero order number unik
function generateOrderNumber(date) {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
}

// Gjenero customer code
function generateCustomerCode(id) {
  return `CUST-${id.toString().padStart(4, '0')}`;
}

// Gjenero product code
function generateProductCode(id) {
  return `PROD-${id.toString().padStart(4, '0')}`;
}

// ===========================================
// SEED DATA
// ===========================================

async function seedDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Fshi të dhënat ekzistuese (për re-seed)
    console.log('🗑️  Cleaning existing data...');
    await client.query('TRUNCATE TABLE users, customers, categories, products, inventory, orders, order_items, payments, tables, discounts, notifications RESTART IDENTITY CASCADE');

    // ===========================================
    // 1. USERS (Admin, Manager, Staff)
    // ===========================================
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersResult = await client.query(`
      INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
      VALUES 
        ('admin@quickcash.al', $1, 'admin', 'Admin User', '+355691234567', true, true),
        ('manager@quickcash.al', $1, 'manager', 'Joni Dervishi', '+355692345678', true, true),
        ('staff1@quickcash.al', $1, 'staff', 'Ela Hoxha', '+355693456789', true, true),
        ('staff2@quickcash.al', $1, 'staff', 'Ardi Krasniqi', '+355694567890', true, true),
        ('staff3@quickcash.al', $1, 'staff', 'Sara Shehu', '+355695678901', true, true)
      RETURNING user_id
    `, [hashedPassword]);

    console.log(`   ✓ Created ${usersResult.rowCount} users`);

    // ===========================================
    // 2. CATEGORIES
    // ===========================================
    console.log('📁 Seeding categories...');
    const categoriesResult = await client.query(`
      INSERT INTO categories (category_name, description, icon, sort_order)
      VALUES 
        ('Pije të Nxehta', 'Kafe, çaj, kakao', '☕', 1),
        ('Pije të Ftohta', 'Lëngje, smoothie, freskues', '🥤', 2),
        ('Ushqime', 'Sanduiç, sallatë, pasta', '🍔', 3),
        ('Ëmbëlsira', 'Torte, biskota, akullore', '🍰', 4),
        ('Alkoole', 'Verë, birrë, kokteje', '🍷', 5)
      RETURNING category_id
    `);

    const categoryIds = categoriesResult.rows.map(r => r.category_id);
    console.log(`   ✓ Created ${categoriesResult.rowCount} categories`);

    // ===========================================
    // 3. PRODUCTS
    // ===========================================
    console.log('📦 Seeding products...');
    
    const products = [
      // Pije të Nxehta
      { cat: categoryIds[0], name: 'Espresso', cost: 50, price: 100, prep: 3 },
      { cat: categoryIds[0], name: 'Cappuccino', cost: 70, price: 150, prep: 5 },
      { cat: categoryIds[0], name: 'Latte', cost: 80, price: 180, prep: 5 },
      { cat: categoryIds[0], name: 'Macchiato', cost: 60, price: 130, prep: 4 },
      { cat: categoryIds[0], name: 'Çaj i Zi', cost: 30, price: 80, prep: 3 },
      { cat: categoryIds[0], name: 'Çaj Jeshil', cost: 40, price: 100, prep: 3 },
      
      // Pije të Ftohta
      { cat: categoryIds[1], name: 'Coca Cola', cost: 50, price: 120, prep: 1 },
      { cat: categoryIds[1], name: 'Fanta', cost: 50, price: 120, prep: 1 },
      { cat: categoryIds[1], name: 'Sprite', cost: 50, price: 120, prep: 1 },
      { cat: categoryIds[1], name: 'Ujë Mineral', cost: 30, price: 80, prep: 1 },
      { cat: categoryIds[1], name: 'Smoothie Luleshtrydhe', cost: 150, price: 350, prep: 7 },
      { cat: categoryIds[1], name: 'Lëng Portokalli', cost: 80, price: 200, prep: 3 },
      
      // Ushqime
      { cat: categoryIds[2], name: 'Sanduiç Proshutë', cost: 200, price: 400, prep: 10 },
      { cat: categoryIds[2], name: 'Sanduiç Pule', cost: 250, price: 450, prep: 10 },
      { cat: categoryIds[2], name: 'Sallatë Caesar', cost: 300, price: 550, prep: 8 },
      { cat: categoryIds[2], name: 'Sallatë Greke', cost: 250, price: 500, prep: 8 },
      { cat: categoryIds[2], name: 'Pasta Carbonara', cost: 350, price: 650, prep: 15 },
      { cat: categoryIds[2], name: 'Pizza Margherita', cost: 400, price: 700, prep: 20 },
      
      // Ëmbëlsira
      { cat: categoryIds[3], name: 'Tiramisu', cost: 200, price: 400, prep: 5 },
      { cat: categoryIds[3], name: 'Cheesecake', cost: 220, price: 450, prep: 5 },
      { cat: categoryIds[3], name: 'Brownies', cost: 150, price: 300, prep: 5 },
      { cat: categoryIds[3], name: 'Akullore Vanilje', cost: 100, price: 250, prep: 3 },
      
      // Alkoole
      { cat: categoryIds[4], name: 'Birrë Tirana', cost: 150, price: 300, prep: 2 },
      { cat: categoryIds[4], name: 'Verë e Kuqe', cost: 400, price: 800, prep: 2 },
      { cat: categoryIds[4], name: 'Mojito', cost: 300, price: 600, prep: 8 }
    ];

    const productIds = [];
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const code = generateProductCode(i + 1);
      const result = await client.query(`
        INSERT INTO products (product_code, category_id, product_name, cost_price, selling_price, preparation_time, is_available)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING product_id
      `, [code, p.cat, p.name, p.cost, p.price, p.prep]);
      
      productIds.push(result.rows[0].product_id);
    }

    console.log(`   ✓ Created ${products.length} products`);

    // ===========================================
    // 4. INVENTORY
    // ===========================================
    console.log('📊 Seeding inventory...');
    
    for (const productId of productIds) {
      const quantity = Math.floor(Math.random() * 100) + 50;
      await client.query(`
        INSERT INTO inventory (product_id, location, current_quantity, minimum_quantity, maximum_quantity)
        VALUES ($1, 'main', $2, 20, 200)
      `, [productId, quantity]);
    }

    console.log(`   ✓ Created ${productIds.length} inventory records`);

    // ===========================================
    // 5. CUSTOMERS
    // ===========================================
    console.log('👤 Seeding customers...');
    
    const customerNames = [
      { first: 'Alban', last: 'Duka', email: 'alban.duka@gmail.com', phone: '+355681111111' },
      { first: 'Besa', last: 'Shehu', email: 'besa.shehu@gmail.com', phone: '+355682222222' },
      { first: 'Dritan', last: 'Hoxha', email: 'dritan.h@gmail.com', phone: '+355683333333' },
      { first: 'Elona', last: 'Krasniqi', email: 'elona.k@gmail.com', phone: '+355684444444' },
      { first: 'Florian', last: 'Meta', email: 'florian.meta@gmail.com', phone: '+355685555555' },
      { first: 'Gerta', last: 'Rama', email: 'gerta.rama@gmail.com', phone: '+355686666666' },
      { first: 'Hektor', last: 'Berisha', email: 'hektor.b@gmail.com', phone: '+355687777777' },
      { first: 'Iris', last: 'Topi', email: 'iris.topi@gmail.com', phone: '+355688888888' },
      { first: 'Kledi', last: 'Kadare', email: 'kledi.k@gmail.com', phone: '+355689999999' },
      { first: 'Linda', last: 'Gjoka', email: 'linda.gjoka@gmail.com', phone: '+355680000000' }
    ];

    const customerIds = [];
    for (let i = 0; i < customerNames.length; i++) {
      const c = customerNames[i];
      const code = generateCustomerCode(i + 1);
      const referralCode = `REF${(i + 1).toString().padStart(4, '0')}`;
      const totalSpent = Math.floor(Math.random() * 5000) + 500;
      const totalOrders = Math.floor(Math.random() * 30) + 5;
      
      const result = await client.query(`
        INSERT INTO customers (customer_code, first_name, last_name, email, phone, referral_code, total_spent, total_orders, is_member)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        RETURNING customer_id
      `, [code, c.first, c.last, c.email, c.phone, referralCode, totalSpent, totalOrders]);
      
      customerIds.push(result.rows[0].customer_id);
    }

    console.log(`   ✓ Created ${customerNames.length} customers`);

    // ===========================================
    // 6. MEMBERSHIP CARDS
    // ===========================================
    console.log('💳 Seeding membership cards...');
    
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    for (const customerId of customerIds) {
      const cardNumber = `QCASH-${customerId.toString().padStart(4, '0')}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const points = Math.floor(Math.random() * 1000);
      const discount = tier === 'bronze' ? 5 : tier === 'silver' ? 10 : tier === 'gold' ? 15 : 20;
      
      await client.query(`
        INSERT INTO membership_cards (customer_id, card_number, tier, points, total_points_earned, discount_percentage)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [customerId, cardNumber, tier, points, points + 500, discount]);
    }

    console.log(`   ✓ Created ${customerIds.length} membership cards`);

    // ===========================================
    // 7. TABLES
    // ===========================================
    console.log('🪑 Seeding tables...');
    
    const zones = ['indoor', 'outdoor', 'vip'];
    for (let i = 1; i <= 15; i++) {
      const zone = zones[Math.floor(i / 6)];
      const capacity = zone === 'vip' ? 6 : Math.floor(Math.random() * 4) + 2;
      
      await client.query(`
        INSERT INTO tables (table_number, table_name, seating_capacity, location_zone, status)
        VALUES ($1, $2, $3, $4, 'available')
      `, [`T${i.toString().padStart(2, '0')}`, `Tavolina ${i}`, capacity, zone]);
    }

    console.log('   ✓ Created 15 tables');

    // ===========================================
    // 8. ORDERS & ORDER ITEMS
    // ===========================================
    console.log('🛒 Seeding orders...');
    
    const orderTypes = ['dine_in', 'takeaway'];
    const statuses = ['completed', 'completed', 'completed', 'cancelled'];
    const staffIds = usersResult.rows.slice(2).map(r => r.user_id); // Staff users
    
    let totalOrdersCreated = 0;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Krijo 100 porosi random në 30 ditët e fundit
    for (let i = 0; i < 100; i++) {
      const orderDate = randomDate(thirtyDaysAgo, now);
      const orderNumber = generateOrderNumber(orderDate);
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const staffId = staffIds[Math.floor(Math.random() * staffIds.length)];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const tableNum = orderType === 'dine_in' ? `T${Math.floor(Math.random() * 15 + 1).toString().padStart(2, '0')}` : null;

      // Krijo order
      const orderResult = await client.query(`
        INSERT INTO orders (order_number, customer_id, staff_id, order_type, table_number, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING order_id
      `, [orderNumber, customerId, staffId, orderType, tableNum, status, orderDate]);

      const orderId = orderResult.rows[0].order_id;

      // Shto 1-5 items në porosi
      const itemCount = Math.floor(Math.random() * 4) + 1;
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const productId = productIds[Math.floor(Math.random() * productIds.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        const productResult = await client.query('SELECT product_name, selling_price FROM products WHERE product_id = $1', [productId]);
        const product = productResult.rows[0];
        const itemTotal = product.selling_price * quantity;
        subtotal += itemTotal;

        await client.query(`
          INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [orderId, productId, product.product_name, quantity, product.selling_price, itemTotal, itemTotal]);
      }

      // Përditëso order me totals
      const discountAmount = Math.random() < 0.3 ? subtotal * 0.1 : 0; // 30% chance për 10% zbritje
      const taxAmount = subtotal * 0.20; // TVSH 20%
      const totalAmount = subtotal - discountAmount + taxAmount;

      await client.query(`
        UPDATE orders 
        SET subtotal = $1, discount_amount = $2, tax_amount = $3, total_amount = $4, completed_at = $5
        WHERE order_id = $6
      `, [subtotal, discountAmount, taxAmount, totalAmount, orderDate, orderId]);

      // Krijo payment nëse completed
      if (status === 'completed') {
        const paymentMethods = ['cash', 'card', 'card'];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const receiptNumber = `RCP-${orderDate.getFullYear()}${(orderDate.getMonth() + 1).toString().padStart(2, '0')}${orderDate.getDate().toString().padStart(2, '0')}-${i.toString().padStart(4, '0')}`;

        await client.query(`
          INSERT INTO payments (order_id, payment_method, payment_status, amount_paid, amount_due, change_amount, receipt_number, processed_at)
          VALUES ($1, $2, 'completed', $3, $4, $5, $6, $7)
        `, [orderId, paymentMethod, totalAmount, totalAmount, 0, receiptNumber, orderDate]);
      }

      totalOrdersCreated++;
    }

    console.log(`   ✓ Created ${totalOrdersCreated} orders with items and payments`);

    // ===========================================
    // 9. DISCOUNTS
    // ===========================================
    console.log('🎁 Seeding discounts...');
    
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    await client.query(`
      INSERT INTO discounts (discount_code, discount_name, discount_type, discount_value, minimum_order_amount, start_date, end_date, is_active)
      VALUES 
        ('WELCOME10', 'Mirësevini në QuickCash', 'percentage', 10, 500, $1, $2, true),
        ('SUMMER20', 'Zbritje Verore', 'percentage', 20, 1000, $1, $2, true),
        ('FREESHIP', 'Dorëzim Falas', 'fixed_amount', 200, 2000, $1, $2, true),
        ('VIP30', 'VIP Ekskluzive', 'percentage', 30, 3000, $1, $2, true)
    `, [now, futureDate]);

    console.log('   ✓ Created 4 active discounts');

    // ===========================================
    // 10. NOTIFICATIONS
    // ===========================================
    console.log('🔔 Seeding notifications...');
    
    const managerUserId = usersResult.rows[1].user_id;
    
    await client.query(`
      INSERT INTO notifications (recipient_id, notification_type, title, message, priority, is_read)
      VALUES 
        ($1, 'low_stock', 'Stok i Ulët - Coca Cola', 'Produkti "Coca Cola" ka vetëm 5 copë në stok.', 'high', false),
        ($1, 'low_stock', 'Stok i Ulët - Ujë Mineral', 'Produkti "Ujë Mineral" ka vetëm 8 copë në stok.', 'high', false),
        ($1, 'daily_report', 'Raporti Ditor', 'Xhiro e sotme: 45,000 Lekë | Porosi: 35 | Klientë: 28', 'normal', true),
        ($1, 'new_customer', 'Klient i Ri', 'Klienti i ri "Linda Gjoka" u regjistrua në sistemin e anëtarësimit.', 'low', true)
    `, [managerUserId]);

    console.log('   ✓ Created 4 notifications');

    // ===========================================
    // SUMMARY
    // ===========================================
    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log('   • 5 Users (1 admin, 1 manager, 3 staff)');
    console.log('   • 5 Categories');
    console.log(`   • ${products.length} Products`);
    console.log(`   • ${products.length} Inventory records`);
    console.log(`   • ${customerNames.length} Customers with membership cards`);
    console.log('   • 15 Tables');
    console.log(`   • ${totalOrdersCreated} Orders with payments`);
    console.log('   • 4 Active discounts');
    console.log('   • 4 Notifications\n');

    console.log('🔐 Login Credentials:');
    console.log('   Admin:   admin@quickcash.al / password123');
    console.log('   Manager: manager@quickcash.al / password123');
    console.log('   Staff:   staff1@quickcash.al / password123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.end();
    console.log('👋 Disconnected from PostgreSQL');
  }
}

// ===========================================
// RUN SEED
// ===========================================
seedDatabase();