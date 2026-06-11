import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './config/db.js';
import { generateId } from './utils/uuid.js';

// Script de seed: pobla todas las tablas con datos realistas de prueba

const main = async () => {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ─── Generar IDs ─────────────────────────────────────────────────────────────

  const auth_admin_id     = generateId();
  const auth_customer1_id = generateId();
  const auth_customer2_id = generateId();
  const auth_customer3_id = generateId();

  const customer1_id = generateId();
  const customer2_id = generateId();
  const customer3_id = generateId();

  const cat_electronica_id = generateId();
  const cat_ropa_id        = generateId();
  const cat_hogar_id       = generateId();
  const cat_deportes_id    = generateId();

  const pm1_id = generateId();
  const pm2_id = generateId();

  const hi1_id = generateId();
  const hi2_id = generateId();
  const hi3_id = generateId();

  const prod1_id = generateId();
  const prod2_id = generateId();
  const prod3_id = generateId();
  const prod4_id = generateId();
  const prod5_id = generateId();
  const prod6_id = generateId();

  const order1_id = generateId();
  const order2_id = generateId();

  const item1_id = generateId();
  const item2_id = generateId();
  const item3_id = generateId();
  const item4_id = generateId();

  try {
    // ─── Truncar tablas desactivando FK checks ────────────────────────────────
    console.log('🗑️  Truncando tablas...');
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE order_item');
    await pool.query('TRUNCATE TABLE shop_order');
    await pool.query('TRUNCATE TABLE product_category');
    await pool.query('TRUNCATE TABLE product');
    await pool.query('TRUNCATE TABLE header_image');
    await pool.query('TRUNCATE TABLE payment_method');
    await pool.query('TRUNCATE TABLE category');
    await pool.query('TRUNCATE TABLE customer');
    await pool.query('TRUNCATE TABLE auth');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tablas truncadas\n');

    // ─── auth: 1 admin + 3 clientes ───────────────────────────────────────────
    console.log('👤 Insertando usuarios auth...');
    const salt            = await bcrypt.genSalt(10);
    const hashed_admin    = await bcrypt.hash('Admin123!', salt);
    const hashed_customer = await bcrypt.hash('Cliente123!', salt);

    await pool.query(
      `INSERT INTO auth (id, email, password, role) VALUES
        (?, 'admin@ecommerceangel.mx', ?, 'admin'),
        (?, 'juan.perez@gmail.com',   ?, 'customer'),
        (?, 'maria.lopez@gmail.com',  ?, 'customer'),
        (?, 'carlos.ruiz@gmail.com',  ?, 'customer')`,
      [
        auth_admin_id,     hashed_admin,
        auth_customer1_id, hashed_customer,
        auth_customer2_id, hashed_customer,
        auth_customer3_id, hashed_customer,
      ]
    );
    console.log('✅ Usuarios auth insertados\n');

    // ─── customer: 3 clientes ─────────────────────────────────────────────────
    console.log('🧑‍🤝‍🧑 Insertando clientes...');
    await pool.query(
      `INSERT INTO customer
         (id, auth_id, first_name, last_name, country, street_address,
          exterior_number, postal_code, city, state, phone)
       VALUES
        (?, ?, 'Juan',   'Pérez García',    'México', 'Av. Insurgentes Sur', '1602', '06600', 'Ciudad de México', 'CDMX',       '5512345678'),
        (?, ?, 'María',  'López Hernández', 'México', 'Calle Madero',        '45',   '44100', 'Guadalajara',      'Jalisco',    '5598765432'),
        (?, ?, 'Carlos', 'Ruiz Martínez',   'México', 'Blvd. Kukulcán',     'Km13', '77500', 'Cancún',           'Quintana Roo','5567891234')`,
      [
        customer1_id, auth_customer1_id,
        customer2_id, auth_customer2_id,
        customer3_id, auth_customer3_id,
      ]
    );
    console.log('✅ Clientes insertados\n');

    // ─── category: 4 categorías ───────────────────────────────────────────────
    console.log('📂 Insertando categorías...');
    await pool.query(
      `INSERT INTO category (id, name, display_order) VALUES
        (?, 'Electrónica', 1),
        (?, 'Ropa',        2),
        (?, 'Hogar',       3),
        (?, 'Deportes',    4)`,
      [cat_electronica_id, cat_ropa_id, cat_hogar_id, cat_deportes_id]
    );
    console.log('✅ Categorías insertadas\n');

    // ─── payment_method: 2 métodos de pago ───────────────────────────────────
    console.log('💳 Insertando métodos de pago...');
    await pool.query(
      `INSERT INTO payment_method (id, method, bank, account_number, account_holder) VALUES
        (?, 'Transferencia SPEI', 'BBVA México',  '012180001234567890', 'Ecommerce Angel SA de CV'),
        (?, 'Transferencia SPEI', 'Citibanamex',  '002180701234567891', 'Ecommerce Angel SA de CV')`,
      [pm1_id, pm2_id]
    );
    console.log('✅ Métodos de pago insertados\n');

    // ─── header_image: 3 imágenes de banner ──────────────────────────────────
    console.log('🖼️  Insertando imágenes de banner...');
    await pool.query(
      `INSERT INTO header_image (id, name, image_url, link_url, display_order) VALUES
        (?, 'Ofertas de Verano',    'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=1200', '/products?category=electronica', 1),
        (?, 'Nueva Colección Ropa', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', '/products?category=ropa',        2),
        (?, 'Equipa tu Hogar',      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', '/products?category=hogar',       3)`,
      [hi1_id, hi2_id, hi3_id]
    );
    console.log('✅ Imágenes de banner insertadas\n');

    // ─── product: 6 productos ─────────────────────────────────────────────────
    console.log('📦 Insertando productos...');
    const specs_laptop = JSON.stringify({
      procesador: 'Intel Core i7-1355U',
      ram: '16GB DDR5',
      almacenamiento: '512GB NVMe SSD',
      pantalla: '15.6" FHD IPS',
      bateria: '72Wh hasta 10 hrs',
    });
    const specs_audifonos = JSON.stringify({
      tipo: 'Over-ear inalámbrico',
      autonomia: '30 horas',
      cancelacion_ruido: 'Activa (ANC)',
      conectividad: 'Bluetooth 5.3',
    });
    const specs_tenis = JSON.stringify({
      material: 'Mesh transpirable',
      suela: 'Goma vulcanizada',
      tallas_disponibles: [25, 26, 27, 28, 29, 30],
      drop: '10mm',
    });

    await pool.query(
      `INSERT INTO product
         (id, name, brand, description, price, sale_price, stock, details, image_url, display_order)
       VALUES
        (?, 'Laptop UltraSlim Pro 15',    'TechBook',   'Laptop delgada y potente para profesionales.',                      18999.00, 15999.00, 25, ?,    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 1),
        (?, 'Audífonos Noise Pro 500',    'SoundMax',   'Audífonos inalámbricos con cancelación activa de ruido.',           2499.00,  1899.00,  60, ?,    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 2),
        (?, 'Smartwatch Serie 8',         'WearTech',   'Reloj inteligente con monitor de salud y GPS.',                     4299.00,  NULL,     40, NULL, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 3),
        (?, 'Playera Dry-Fit Performance','SportStyle', 'Playera técnica con absorción de humedad para entrenamientos.',     549.00,   399.00,  150, NULL, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 4),
        (?, 'Tenis Running AirMax Z',     'RunPro',     'Tenis de alto rendimiento para corredores con amortiguación.',      2199.00,  NULL,     80, ?,    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',    5),
        (?, 'Cafetera Espresso Classic',  'BrewMaster', 'Cafetera semi-automática con vaporizador de leche.',               3799.00,  2999.00,  35, NULL, 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800', 6)`,
      [
        prod1_id, specs_laptop,
        prod2_id, specs_audifonos,
        prod3_id,
        prod4_id,
        prod5_id, specs_tenis,
        prod6_id,
      ]
    );
    console.log('✅ Productos insertados\n');

    // ─── product_category: asociaciones ──────────────────────────────────────
    console.log('🔗 Insertando asociaciones producto-categoría...');
    await pool.query(
      `INSERT INTO product_category (product_id, category_id) VALUES
        (?, ?),
        (?, ?),
        (?, ?),
        (?, ?),
        (?, ?),
        (?, ?),
        (?, ?),
        (?, ?)`,
      [
        prod1_id, cat_electronica_id, // Laptop → Electrónica
        prod2_id, cat_electronica_id, // Audífonos → Electrónica
        prod3_id, cat_electronica_id, // Smartwatch → Electrónica
        prod4_id, cat_ropa_id,        // Playera → Ropa
        prod4_id, cat_deportes_id,    // Playera → Deportes
        prod5_id, cat_deportes_id,    // Tenis → Deportes
        prod5_id, cat_ropa_id,        // Tenis → Ropa
        prod6_id, cat_hogar_id,       // Cafetera → Hogar
      ]
    );
    console.log('✅ Asociaciones producto-categoría insertadas\n');

    // ─── shop_order: 2 órdenes ────────────────────────────────────────────────
    console.log('🛒 Insertando órdenes...');
    await pool.query(
      `INSERT INTO shop_order
         (id, customer_id, payment_method_id, status, subtotal, shipping_cost, total, notes)
       VALUES
        (?, ?, ?, 'delivered', 17898.00,  0.00, 17898.00, 'Entregar en horario matutino'),
        (?, ?, ?, 'pending',    2698.00, 150.00, 2848.00, NULL)`,
      [
        order1_id, customer1_id, pm1_id,
        order2_id, customer2_id, pm2_id,
      ]
    );
    console.log('✅ Órdenes insertadas\n');

    // ─── order_item: ítems de cada orden ─────────────────────────────────────
    console.log('📋 Insertando ítems de órdenes...');
    await pool.query(
      `INSERT INTO order_item (id, order_id, product_id, quantity, unit_price, line_total) VALUES
        (?, ?, ?, 1, 15999.00, 15999.00),
        (?, ?, ?, 1,  1899.00,  1899.00),
        (?, ?, ?, 1,   399.00,   399.00),
        (?, ?, ?, 1,  2299.00,  2299.00)`,
      [
        item1_id, order1_id, prod1_id, // Orden 1: Laptop
        item2_id, order1_id, prod2_id, // Orden 1: Audífonos
        item3_id, order2_id, prod4_id, // Orden 2: Playera
        item4_id, order2_id, prod3_id, // Orden 2: Smartwatch
      ]
    );
    console.log('✅ Ítems de órdenes insertados\n');

    console.log('🎉 Seed completado exitosamente.');
    console.log('\nCredenciales de prueba:');
    console.log('  Admin:    admin@ecommerceangel.mx  / Admin123!');
    console.log('  Cliente:  juan.perez@gmail.com     / Cliente123!');
    console.log('  Cliente:  maria.lopez@gmail.com    / Cliente123!');
    console.log('  Cliente:  carlos.ruiz@gmail.com    / Cliente123!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    await pool.end();
    process.exit(1);
  }
};

main();
