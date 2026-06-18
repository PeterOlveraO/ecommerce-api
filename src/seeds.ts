import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './config/db.js';
import { generateId } from './utils/uuid.js';

const main = async () => {
  console.log('🌱 Iniciando seed de la base de datos...\n');
  
  try {
    console.log('🗑️  Truncando tablas...');
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE order_item');
    await pool.query('TRUNCATE TABLE shop_order');
    await pool.query('TRUNCATE TABLE product_category');
    await pool.query('TRUNCATE TABLE product');
    await pool.query('TRUNCATE TABLE header_image');
    await pool.query('TRUNCATE TABLE payment_method');
    await pool.query('TRUNCATE TABLE category');
    await pool.query('TRUNCATE TABLE attribute');
    await pool.query('TRUNCATE TABLE customer');
    await pool.query('TRUNCATE TABLE auth');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tablas truncadas\n');

    const salt = await bcrypt.genSalt(10);
    const hashed_admin = await bcrypt.hash('Admin123!', salt);
    const hashed_customer = await bcrypt.hash('Cliente123!', salt);

    // ─── auth & customer (10 clientes + 1 admin) ─────────────────────────────
    const admin_id = generateId();
    await pool.query(
      `INSERT INTO auth (id, email, password, role) VALUES (?, ?, ?, ?)`,
      [admin_id, 'admin@ecommerceangel.mx', hashed_admin, 'admin']
    );

    const customers_data = [
      { f: 'Juan', l: 'Pérez', e: 'juan.perez@gmail.com', ph: '5512345678', n: 'Centro', st: 'CDMX', c: 'Ciudad de México', zip: '06600', ext: '1602' },
      { f: 'María', l: 'López', e: 'maria.lopez@gmail.com', ph: '5598765432', n: 'Providencia', st: 'Jalisco', c: 'Guadalajara', zip: '44100', ext: '45' },
      { f: 'Carlos', l: 'Ruiz', e: 'carlos.ruiz@gmail.com', ph: '5567891234', n: 'Zona Hotelera', st: 'Quintana Roo', c: 'Cancún', zip: '77500', ext: 'Km13' },
      { f: 'Ana', l: 'García', e: 'ana.garcia@gmail.com', ph: '5511112222', n: 'Roma Norte', st: 'CDMX', c: 'Ciudad de México', zip: '06700', ext: '10' },
      { f: 'Luis', l: 'Fernández', e: 'luis.fernandez@gmail.com', ph: '5533334444', n: 'Polanco', st: 'CDMX', c: 'Ciudad de México', zip: '11560', ext: '105' },
      { f: 'Elena', l: 'Martínez', e: 'elena.martinez@gmail.com', ph: '5555556666', n: 'Del Valle', st: 'CDMX', c: 'Ciudad de México', zip: '03100', ext: '20' },
      { f: 'Miguel', l: 'González', e: 'miguel.gonzalez@gmail.com', ph: '5577778888', n: 'San Ángel', st: 'CDMX', c: 'Ciudad de México', zip: '01000', ext: '34' },
      { f: 'Sofía', l: 'Rodríguez', e: 'sofia.rodriguez@gmail.com', ph: '5599990000', n: 'Coyoacán', st: 'CDMX', c: 'Ciudad de México', zip: '04000', ext: '56' },
      { f: 'Diego', l: 'Sánchez', e: 'diego.sanchez@gmail.com', ph: '5522221111', n: 'Narvarte', st: 'CDMX', c: 'Ciudad de México', zip: '03020', ext: '78' },
      { f: 'Laura', l: 'Ramírez', e: 'laura.ramirez@gmail.com', ph: '5544443333', n: 'Condesa', st: 'CDMX', c: 'Ciudad de México', zip: '06140', ext: '90' },
    ];

    const customer_ids: string[] = [];

    for (const c of customers_data) {
      const auth_id = generateId();
      const customer_id = generateId();
      customer_ids.push(customer_id);

      await pool.query(
        `INSERT INTO auth (id, email, password, role) VALUES (?, ?, ?, ?)`,
        [auth_id, c.e, hashed_customer, 'customer']
      );

      await pool.query(
        `INSERT INTO customer
         (id, auth_id, first_name, last_name, country, street_address, neighborhood, exterior_number, postal_code, city, state, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer_id, auth_id, c.f, c.l, 'México', 'Calle ' + c.f, c.n, c.ext, c.zip, c.c, c.st, c.ph]
      );
    }
    console.log(`✅ 10 Clientes insertados (Total auth: 11)`);

    // ─── category ─────────────────────────────────────────────────────────────
    const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes', 'Belleza', 'Libros', 'Mascotas', 'Herramientas', 'Automotriz'];
    const category_ids: string[] = [];
    for (let i = 0; i < categories.length; i++) {
      const id = generateId();
      category_ids.push(id);
      await pool.query(`INSERT INTO category (id, name, display_order) VALUES (?, ?, ?)`, [id, categories[i], i + 1]);
    }
    console.log(`✅ 10 Categorías insertadas`);

    // ─── attribute ────────────────────────────────────────────────────────────
    const attributes = ['Talla', 'Color', 'Material', 'Peso', 'Dimensiones', 'Marca', 'Modelo', 'Garantía', 'Capacidad', 'Voltaje'];
    for (const attr of attributes) {
      await pool.query(`INSERT INTO attribute (id, name) VALUES (?, ?)`, [generateId(), attr]);
    }
    console.log(`✅ 10 Atributos insertados`);

    // ─── payment_method ───────────────────────────────────────────────────────
    const payment_methods_data = [
      { m: 'Transferencia SPEI', b: 'BBVA' },
      { m: 'Transferencia SPEI', b: 'Citibanamex' },
      { m: 'Transferencia SPEI', b: 'Santander' },
      { m: 'Transferencia SPEI', b: 'Banorte' },
      { m: 'Transferencia SPEI', b: 'HSBC' },
      { m: 'Tarjeta de Crédito', b: 'Stripe' },
      { m: 'Tarjeta de Débito', b: 'Stripe' },
      { m: 'Efectivo OXXO', b: 'Oxxo Pay' },
      { m: 'PayPal', b: 'PayPal' },
      { m: 'MercadoPago', b: 'MercadoPago' },
    ];
    const pm_ids: string[] = [];
    for (const pm of payment_methods_data) {
      const id = generateId();
      pm_ids.push(id);
      await pool.query(
        `INSERT INTO payment_method (id, method, bank, account_number, account_holder) VALUES (?, ?, ?, ?, ?)`,
        [id, pm.m, pm.b, '012345678901234567', 'Ecommerce Angel SA']
      );
    }
    console.log(`✅ 10 Métodos de pago insertados`);

    // ─── header_image ─────────────────────────────────────────────────────────
    for (let i = 1; i <= 10; i++) {
      await pool.query(
        `INSERT INTO header_image (id, name, image_url, link_url, display_order) VALUES (?, ?, ?, ?, ?)`,
        [generateId(), `Banner Promocional ${i}`, `https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=1200&sig=${i}`, `/products?promo=${i}`, i]
      );
    }
    console.log(`✅ 10 Imágenes de banner insertadas`);

    // ─── product ──────────────────────────────────────────────────────────────
    const products_data = [
      { n: 'Laptop UltraSlim Pro 15', b: 'TechBook', p: 18999, sp: 15999, c: category_ids[0], img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', f: true, d: { 'Color': 'Plata', 'Marca': 'TechBook', 'Modelo': 'Pro 15', 'Garantía': '1 Año' } },
      { n: 'Audífonos Noise Pro 500', b: 'SoundMax', p: 2499, sp: 1899, c: category_ids[0], img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', f: false, d: { 'Color': 'Negro', 'Marca': 'SoundMax', 'Garantía': '6 Meses' } },
      { n: 'Smartwatch Serie 8', b: 'WearTech', p: 4299, sp: null, c: category_ids[0], img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', f: true, d: { 'Color': 'Medianoche', 'Material': 'Aluminio', 'Peso': '38g' } },
      { n: 'Playera Dry-Fit Performance', b: 'SportStyle', p: 549, sp: 399, c: category_ids[1], img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', f: false, d: { 'Talla': 'M', 'Color': 'Azul Marino', 'Material': 'Poliéster' } },
      { n: 'Tenis Running AirMax Z', b: 'RunPro', p: 2199, sp: null, c: category_ids[3], img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', f: true, d: { 'Talla': '27.5', 'Color': 'Rojo/Blanco', 'Material': 'Mesh Transpirable' } },
      { n: 'Cafetera Espresso Classic', b: 'BrewMaster', p: 3799, sp: 2999, c: category_ids[2], img: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800', f: false, d: { 'Color': 'Acero Inoxidable', 'Capacidad': '1.2L', 'Voltaje': '110V' } },
      { n: 'Set de Mancuernas 20kg', b: 'FitGear', p: 1299, sp: 999, c: category_ids[3], img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800', f: false, d: { 'Peso': '20kg total', 'Material': 'Hierro fundido', 'Color': 'Negro' } },
      { n: 'Crema Hidratante Facial', b: 'GlowSkin', p: 450, sp: null, c: category_ids[5], img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', f: true, d: { 'Capacidad': '50ml', 'Marca': 'GlowSkin', 'Dimensiones': '5x5x5 cm' } },
      { n: 'Taladro Inalámbrico 20V', b: 'PowerTool', p: 2100, sp: 1800, c: category_ids[8], img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', f: false, d: { 'Voltaje': '20V', 'Garantía': '2 Años', 'Color': 'Amarillo' } },
      { n: 'Alimento Premium Perro 15kg', b: 'DoggyChoice', p: 1100, sp: null, c: category_ids[7], img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800', f: true, d: { 'Peso': '15kg', 'Marca': 'DoggyChoice' } },
    ];
    
    const prod_ids: string[] = [];
    for (let i = 0; i < products_data.length; i++) {
      const p = products_data[i];
      const id = generateId();
      prod_ids.push(id);
      await pool.query(
        `INSERT INTO product (id, name, brand, description, price, sale_price, stock, details, image_url, display_order, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, p.n, p.b, `Descripción genial de ${p.n}`, p.p, p.sp, 50, JSON.stringify(p.d), p.img, i + 1, p.f ? 1 : 0]
      );
      await pool.query(`INSERT INTO product_category (product_id, category_id) VALUES (?, ?)`, [id, p.c]);
    }
    console.log(`✅ 10 Productos insertados (y sus asociaciones)`);

    // ─── shop_order & order_item ──────────────────────────────────────────────
    for (let i = 0; i < 10; i++) {
      const order_id = generateId();
      const c_id = customer_ids[i];
      const p_id = pm_ids[i];
      
      const prod1 = products_data[i];
      const prod1_id = prod_ids[i];
      const price1 = prod1.sp ?? prod1.p;
      
      const subtotal = price1 * 2; 
      
      await pool.query(
        `INSERT INTO shop_order (id, customer_id, payment_method_id, status, subtotal, shipping_cost, total, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [order_id, c_id, p_id, i % 2 === 0 ? 'delivered' : 'pending', subtotal, 100.00, subtotal + 100, `Nota orden ${i}`]
      );

      await pool.query(
        `INSERT INTO order_item (id, order_id, product_id, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?)`,
        [generateId(), order_id, prod1_id, 2, price1, subtotal]
      );
    }
    console.log(`✅ 10 Órdenes y 10 Ítems insertados`);

    console.log('\n🎉 Seed completado exitosamente.\n');
    console.log('Credenciales de prueba:');
    console.log('  Admin:    admin@ecommerceangel.mx  / Admin123!');
    console.log('  Cliente:  juan.perez@gmail.com     / Cliente123!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    await pool.end();
    process.exit(1);
  }
};

main();
