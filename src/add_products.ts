import 'dotenv/config';
import { pool } from './config/db.js';
import { generateId } from './utils/uuid.js';

// Script para agregar 100 productos nuevos sin eliminar ningún dato existente

const main = async () => {
  console.log('🛒 Agregando 100 productos nuevos...\n');

  try {
    // Obtener los IDs de categorías existentes
    const [categories]: any = await pool.query(`SELECT id, name FROM category ORDER BY display_order`);
    if (categories.length === 0) {
      throw new Error('No hay categorías en la base de datos. Ejecuta el seed primero.');
    }

    // Mapear categorías por nombre para asignarlas correctamente
    const catMap: Record<string, string> = {};
    for (const cat of categories) {
      catMap[cat.name] = cat.id;
    }

    // Obtener el display_order máximo actual de productos
    const [maxOrderRows]: any = await pool.query(`SELECT COALESCE(MAX(display_order), 0) AS max_order FROM product`);
    let display_order = maxOrderRows[0].max_order + 1;

    // ─── 100 productos coherentes por categoría ───────────────────────────────
    const products = [
      // === ELECTRÓNICA (20 productos) ===
      { n: 'Monitor 4K UltraWide 32"', b: 'ViewMax', p: 12499, sp: 10999, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', f: true,  d: { 'Resolución': '3840x2160', 'Tamaño': '32"', 'Marca': 'ViewMax', 'Garantía': '3 Años' } },
      { n: 'Teclado Mecánico RGB Pro', b: 'KeyCraft', p: 1899, sp: 1499, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', f: false, d: { 'Color': 'Negro', 'Material': 'Aluminio/PBT', 'Marca': 'KeyCraft', 'Garantía': '2 Años' } },
      { n: 'Mouse Inalámbrico Ergonómico', b: 'CursorPro', p: 899, sp: null, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', f: false, d: { 'Color': 'Gris', 'Marca': 'CursorPro', 'Garantía': '1 Año' } },
      { n: 'Tablet Android 10" 128GB', b: 'TabTech', p: 6999, sp: 5499, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', f: true,  d: { 'Capacidad': '128GB', 'Color': 'Negro Espacial', 'Marca': 'TabTech', 'Garantía': '1 Año' } },
      { n: 'Cámara DSLR 24MP Kit', b: 'ShootPro', p: 22999, sp: 19999, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800', f: true,  d: { 'Megapixeles': '24MP', 'Marca': 'ShootPro', 'Garantía': '2 Años', 'Material': 'Magnesio' } },
      { n: 'Bocina Bluetooth 360° Waterproof', b: 'BoomSound', p: 1299, sp: 999, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', f: false, d: { 'Color': 'Azul', 'Peso': '320g', 'Marca': 'BoomSound', 'Garantía': '1 Año' } },
      { n: 'Disco SSD Externo 1TB USB-C', b: 'SpeedDrive', p: 2199, sp: 1799, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1597289124948-f6c6f8b24ef5?w=800', f: false, d: { 'Capacidad': '1TB', 'Color': 'Plata', 'Marca': 'SpeedDrive', 'Garantía': '3 Años' } },
      { n: 'Router WiFi 6 Mesh Dual-Band', b: 'NetFlow', p: 3499, sp: null, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800', f: false, d: { 'Modelo': 'AX5400', 'Marca': 'NetFlow', 'Garantía': '2 Años', 'Voltaje': '110V' } },
      { n: 'Cargador Inalámbrico 20W Qi', b: 'ChargeZone', p: 549, sp: 399, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800', f: false, d: { 'Color': 'Blanco', 'Voltaje': '20W', 'Marca': 'ChargeZone', 'Garantía': '1 Año' } },
      { n: 'Impresora Multifuncional Láser', b: 'PrintMaster', p: 4299, sp: 3799, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800', f: false, d: { 'Color': 'Blanco/Gris', 'Voltaje': '110V', 'Marca': 'PrintMaster', 'Garantía': '2 Años' } },
      { n: 'Webcam 4K 60fps con Micrófono', b: 'StreamVision', p: 2899, sp: 2499, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1587614297882-0954cf8a2096?w=800', f: true,  d: { 'Resolución': '4K/60fps', 'Color': 'Negro', 'Marca': 'StreamVision', 'Garantía': '2 Años' } },
      { n: 'Auriculares Gaming Surround 7.1', b: 'GameSound', p: 1599, sp: 1299, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800', f: false, d: { 'Color': 'Negro/Rojo', 'Material': 'Plástico/Espuma', 'Marca': 'GameSound', 'Garantía': '1 Año' } },
      { n: 'Powerbank 20000mAh PD45W', b: 'EnergyPack', p: 899, sp: 699, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1609592806596-b42de9b35e01?w=800', f: false, d: { 'Capacidad': '20000mAh', 'Color': 'Negro', 'Marca': 'EnergyPack', 'Garantía': '1 Año' } },
      { n: 'Cable HDMI 2.1 8K 2m', b: 'UltraLink', p: 349, sp: null, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', f: false, d: { 'Dimensiones': '2 metros', 'Color': 'Negro', 'Marca': 'UltraLink', 'Garantía': '6 Meses' } },
      { n: 'Hub USB-C 7 en 1', b: 'ConnectAll', p: 799, sp: 649, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1610810658108-b12fc7a64c8c?w=800', f: false, d: { 'Puertos': 'USB-A x3, HDMI, SD, MicroSD, USB-C', 'Marca': 'ConnectAll', 'Garantía': '1 Año' } },
      { n: 'Smart TV 55" OLED 4K', b: 'ScreenMax', p: 34999, sp: 29999, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=800', f: true,  d: { 'Tamaño': '55"', 'Resolución': '4K OLED', 'Marca': 'ScreenMax', 'Garantía': '3 Años' } },
      { n: 'Proyector Portátil Full HD 3000 Lúmenes', b: 'LightShow', p: 8999, sp: 7499, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', f: false, d: { 'Resolución': '1080p', 'Peso': '1.2kg', 'Marca': 'LightShow', 'Garantía': '2 Años' } },
      { n: 'Drone FPV con Cámara 4K', b: 'SkyFly', p: 14999, sp: 12999, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800', f: true,  d: { 'Resolución': '4K', 'Peso': '249g', 'Marca': 'SkyFly', 'Garantía': '1 Año' } },
      { n: 'Consola Gaming Portátil', b: 'PixelPlay', p: 9999, sp: null, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=800', f: true,  d: { 'Color': 'Azul/Negro', 'Capacidad': '256GB', 'Marca': 'PixelPlay', 'Garantía': '1 Año' } },
      { n: 'Control Remoto Universal Smart', b: 'RemoteOne', p: 699, sp: 549, cat: 'Electrónica', img: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800', f: false, d: { 'Color': 'Negro', 'Marca': 'RemoteOne', 'Garantía': '1 Año' } },

      // === ROPA (15 productos) ===
      { n: 'Chamarra Impermeable Urban Explorer', b: 'OutdoorWear', p: 2299, sp: 1799, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800', f: true,  d: { 'Talla': 'L', 'Color': 'Verde Olivo', 'Material': 'Nylon Ripstop', 'Garantía': '6 Meses' } },
      { n: 'Jeans Slim Fit Premium', b: 'DenimCo', p: 999, sp: 799, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', f: false, d: { 'Talla': '32', 'Color': 'Azul Índigo', 'Material': 'Denim 98% Algodón' } },
      { n: 'Vestido Floral Maxi Verano', b: 'BlossoMode', p: 899, sp: 699, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1623039405147-547794f92e9e?w=800', f: false, d: { 'Talla': 'S', 'Color': 'Multicolor', 'Material': 'Viscosa' } },
      { n: 'Hoodie Oversize Básico', b: 'ComfyFit', p: 699, sp: null, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800', f: false, d: { 'Talla': 'XL', 'Color': 'Gris Jaspeado', 'Material': 'Algodón Fleece' } },
      { n: 'Camisa Oxford de Algodón', b: 'ClassicMen', p: 649, sp: 499, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800', f: false, d: { 'Talla': 'M', 'Color': 'Azul Cielo', 'Material': 'Algodón Peinado' } },
      { n: 'Pantalón de Yoga Compresión', b: 'FlexBody', p: 799, sp: 599, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800', f: false, d: { 'Talla': 'M', 'Color': 'Negro', 'Material': 'Licra/Spandex' } },
      { n: 'Traje de Baño Deportivo UV50+', b: 'AquaStyle', p: 599, sp: null, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1570976447640-ac859083963f?w=800', f: false, d: { 'Talla': 'M', 'Color': 'Azul/Turquesa', 'Material': 'Nylon Reciclado' } },
      { n: 'Calcetines Deportivos Pack x6', b: 'SockPro', p: 299, sp: 249, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800', f: false, d: { 'Talla': 'Única', 'Color': 'Blanco/Negro/Gris', 'Material': 'Algodón/Lycra' } },
      { n: 'Gorra Snapback Bordada', b: 'CapZone', p: 399, sp: 299, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800', f: false, d: { 'Talla': 'Ajustable', 'Color': 'Negro', 'Material': 'Algodón/Poliéster' } },
      { n: 'Bufanda de Lana Merino', b: 'WoolSoft', p: 549, sp: null, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800', f: false, d: { 'Color': 'Beige', 'Material': 'Lana Merino 100%', 'Dimensiones': '180x30cm' } },
      { n: 'Blazer Entallado Mujer', b: 'EleganStyle', p: 1599, sp: 1299, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800', f: true,  d: { 'Talla': 'S', 'Color': 'Negro', 'Material': 'Poliéster/Viscosa' } },
      { n: 'Short Deportivo Running 2en1', b: 'RunStyle', p: 499, sp: 399, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800', f: false, d: { 'Talla': 'M', 'Color': 'Negro', 'Material': 'Poliéster' } },
      { n: 'Camiseta Estampada Artística', b: 'ArtWear', p: 449, sp: null, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800', f: false, d: { 'Talla': 'L', 'Color': 'Blanca', 'Material': 'Algodón 180g' } },
      { n: 'Pijama de Franela Unisex', b: 'DreamWear', p: 699, sp: 549, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800', f: false, d: { 'Talla': 'L', 'Color': 'Cuadros Rojo/Azul', 'Material': 'Franela de Algodón' } },
      { n: 'Chaleco Acolchado Ultraligero', b: 'AlpineGear', p: 1099, sp: 899, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', f: false, d: { 'Talla': 'M', 'Color': 'Azul Marino', 'Material': 'Nylon/Plumas Sintéticas' } },

      // === HOGAR (15 productos) ===
      { n: 'Set de Sartenes Antiadherentes x3', b: 'ChefCook', p: 1499, sp: 1199, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', f: true,  d: { 'Material': 'Aluminio con recubrimiento cerámico', 'Color': 'Negro', 'Garantía': '5 Años' } },
      { n: 'Aspiradora Robot Inteligente', b: 'CleanBot', p: 8999, sp: 7499, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', f: true,  d: { 'Color': 'Negro', 'Marca': 'CleanBot', 'Garantía': '2 Años', 'Capacidad': '0.6L depósito' } },
      { n: 'Cojines Decorativos Pack x4', b: 'HomeDeco', p: 699, sp: 549, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', f: false, d: { 'Dimensiones': '45x45cm', 'Material': 'Terciopelo', 'Color': 'Mostaza/Verde Bosque' } },
      { n: 'Juego de Sábanas Bambú 400 Hilos', b: 'SleepLux', p: 1299, sp: null, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', f: false, d: { 'Talla': 'Matrimonial', 'Color': 'Blanco', 'Material': 'Bambú/Algodón' } },
      { n: 'Lámpara de Piso Arco LED', b: 'LightHome', p: 1899, sp: 1599, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', f: false, d: { 'Color': 'Dorado/Blanco', 'Voltaje': '110V', 'Marca': 'LightHome', 'Garantía': '1 Año' } },
      { n: 'Purificador de Aire HEPA H13', b: 'AirPure', p: 3999, sp: 3299, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', f: true,  d: { 'Color': 'Blanco', 'Capacidad': 'Habitaciones hasta 40m²', 'Voltaje': '110V', 'Garantía': '3 Años' } },
      { n: 'Organizador Modular Closet 6 piezas', b: 'SpaceMax', p: 1199, sp: 999, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800', f: false, d: { 'Material': 'Madera MDF', 'Color': 'Blanco', 'Dimensiones': 'Modular 30x30cm c/u' } },
      { n: 'Difusor Aromaterapia Ultrasónico', b: 'ZenAir', p: 649, sp: 499, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800', f: false, d: { 'Capacidad': '300ml', 'Color': 'Madera/Blanco', 'Voltaje': '110V', 'Garantía': '1 Año' } },
      { n: 'Batidora de Pedestal 1000W', b: 'BakePro', p: 5299, sp: 4499, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=800', f: true,  d: { 'Color': 'Rojo', 'Capacidad': '5.5L', 'Voltaje': '110V', 'Garantía': '5 Años' } },
      { n: 'Cuadro Canvas Abstracto Grande', b: 'ArtFrame', p: 799, sp: null, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', f: false, d: { 'Dimensiones': '80x60cm', 'Material': 'Lienzo Canvas', 'Color': 'Multicolor' } },
      { n: 'Freidora de Aire XL 5.5L', b: 'CrispAir', p: 2499, sp: 1999, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800', f: true,  d: { 'Capacidad': '5.5L', 'Color': 'Negro', 'Voltaje': '110V', 'Garantía': '2 Años' } },
      { n: 'Set de Cuchillos Japoneses 7 piezas', b: 'BladeChef', p: 1799, sp: 1499, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1547538374-3c32e9281aa6?w=800', f: false, d: { 'Material': 'Acero Inoxidable 420', 'Color': 'Plateado', 'Garantía': '5 Años' } },
      { n: 'Cajonera con Ruedas 3 Cajones', b: 'FlexDesk', p: 999, sp: 849, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', f: false, d: { 'Color': 'Blanco', 'Material': 'Madera MDF', 'Dimensiones': '40x50x80cm' } },
      { n: 'Espejo de Pared Decorativo Redondo', b: 'ReflexDeco', p: 699, sp: null, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800', f: false, d: { 'Dimensiones': 'Ø 60cm', 'Material': 'Marco de Metal Dorado', 'Color': 'Dorado' } },
      { n: 'Cafetera de Goteo Programable 12 Tazas', b: 'MornBrew', p: 1099, sp: 899, cat: 'Hogar', img: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800', f: false, d: { 'Capacidad': '1.5L', 'Color': 'Plateado/Negro', 'Voltaje': '110V', 'Garantía': '2 Años' } },

      // === DEPORTES (12 productos) ===
      { n: 'Bicicleta Estática Magnética Pro', b: 'CycleFit', p: 12999, sp: 10999, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', f: true,  d: { 'Color': 'Negro/Gris', 'Peso': '35kg', 'Garantía': '2 Años', 'Material': 'Acero reforzado' } },
      { n: 'Colchoneta Yoga TPE 6mm', b: 'ZenMat', p: 599, sp: 449, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1601925228003-34d28124b2b7?w=800', f: false, d: { 'Dimensiones': '183x61cm', 'Peso': '1.1kg', 'Material': 'TPE Ecológico', 'Color': 'Morado/Negro' } },
      { n: 'Guantes de Box Profesionales 16oz', b: 'KnockOut', p: 899, sp: 749, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1517438122489-d9ddc10a5e14?w=800', f: false, d: { 'Peso': '16oz', 'Color': 'Rojo', 'Material': 'Cuero sintético', 'Garantía': '1 Año' } },
      { n: 'Raqueta de Tenis Profesional', b: 'AcePro', p: 2499, sp: null, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1617083934551-ac1a7e16ad22?w=800', f: true,  d: { 'Peso': '295g', 'Material': 'Grafito', 'Color': 'Azul/Negro', 'Garantía': '1 Año' } },
      { n: 'Pelota de Fútbol Profesional FIFA', b: 'GoalKick', p: 749, sp: 599, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800', f: false, d: { 'Talla': '5', 'Material': 'PU Termosellado', 'Color': 'Blanco/Negro' } },
      { n: 'Cuerda para Saltar de Velocidad', b: 'JumpRope', p: 299, sp: 249, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800', f: false, d: { 'Material': 'Aluminio/PVC', 'Color': 'Negro/Plateado', 'Peso': '150g' } },
      { n: 'Cintillo de Resistencia Elástico Pack x5', b: 'FlexBand', p: 399, sp: 299, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1598289431069-4a0cc0de39ac?w=800', f: false, d: { 'Material': 'Látex Natural', 'Color': 'Multicolor (5 resistencias)' } },
      { n: 'Mochila Deportiva Impermeable 40L', b: 'TrailPack', p: 1299, sp: 1099, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', f: false, d: { 'Capacidad': '40L', 'Color': 'Negro', 'Material': 'Nylon 600D', 'Peso': '800g' } },
      { n: 'Kettlebell Hierro Fundido 16kg', b: 'IronFit', p: 849, sp: null, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1526401363535-a79174ca6b97?w=800', f: false, d: { 'Peso': '16kg', 'Material': 'Hierro fundido sólido', 'Color': 'Negro' } },
      { n: 'Tobilleras con Peso 2kg Par', b: 'WeightWear', p: 449, sp: 349, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', f: false, d: { 'Peso': '2kg c/u', 'Material': 'Neopreno/Arena', 'Color': 'Gris' } },
      { n: 'Pesas Rusas Ajustables 2-24kg', b: 'AdjustFit', p: 3999, sp: 3499, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800', f: true,  d: { 'Peso': 'Ajustable 2-24kg', 'Material': 'Acero', 'Color': 'Negro', 'Garantía': '3 Años' } },
      { n: 'Casco de Ciclismo Certificado CE', b: 'SafeRide', p: 799, sp: 649, cat: 'Deportes', img: 'https://images.unsplash.com/photo-1557803175-6a658b9c8a93?w=800', f: false, d: { 'Talla': 'L (58-62cm)', 'Color': 'Blanco', 'Material': 'EPS/Policarbonato', 'Garantía': '2 Años' } },

      // === JUGUETES (8 productos) ===
      { n: 'LEGO Arquitectura Coliseo Roma 5923 pcs', b: 'LEGO', p: 8999, sp: 7499, cat: 'Juguetes', img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800', f: true,  d: { 'Piezas': '5923', 'Marca': 'LEGO', 'Edad': '+18 años', 'Dimensiones': '27x52x59cm armado' } },
      { n: 'Muñeca Articulada con Accesorios', b: 'DreamDoll', p: 599, sp: 449, cat: 'Juguetes', img: 'https://images.unsplash.com/photo-1600710462627-8a70e0afa4c7?w=800', f: false, d: { 'Edad': '+3 años', 'Material': 'Plástico ABS', 'Color': 'Rosa/Multicolor' } },
      { n: 'Control Remoto Carro Todoterreno 4WD', b: 'RC Motors', p: 1299, sp: 999, cat: 'Juguetes', img: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800', f: true,  d: { 'Velocidad': 'Hasta 30km/h', 'Material': 'Plástico Reforzado', 'Garantía': '6 Meses', 'Color': 'Rojo/Negro' } },
      { n: 'Rompecabezas 1000 Piezas Paisaje', b: 'PuzzlePro', p: 349, sp: 299, cat: 'Juguetes', img: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800', f: false, d: { 'Piezas': '1000', 'Dimensiones': '70x50cm armado', 'Marca': 'PuzzlePro', 'Edad': '+8 años' } },
      { n: 'Kit de Arte y Manualidades 100 piezas', b: 'CreativeKids', p: 499, sp: null, cat: 'Juguetes', img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', f: false, d: { 'Piezas': '100', 'Edad': '+4 años', 'Material': 'Atóxico', 'Color': 'Multicolor' } },
      { n: 'Telescopio Astronómico 70mm Niños', b: 'StarKids', p: 1499, sp: 1199, cat: 'Juguetes', img: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800', f: false, d: { 'Apertura': '70mm', 'Marca': 'StarKids', 'Edad': '+8 años', 'Garantía': '1 Año' } },
      { n: 'Juego de Mesa Monopoly Edición Lujo', b: 'Hasbro', p: 899, sp: 749, cat: 'Juguetes', img: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800', f: false, d: { 'Jugadores': '2-6', 'Edad': '+8 años', 'Material': 'Cartón/Metal', 'Marca': 'Hasbro' } },
      { n: 'Patineta Maple Pro 8" Completa', b: 'SkateKing', p: 1199, sp: 999, cat: 'Juguetes', img: 'https://images.unsplash.com/photo-1509461399763-ae67a981b254?w=800', f: false, d: { 'Dimensiones': '8"x32"', 'Material': 'Maple Canadiense 7 capas', 'Peso máx': '100kg', 'Edad': '+8 años' } },

      // === BELLEZA (10 productos) ===
      { n: 'Sérum Vitamina C Concentrado 30ml', b: 'VitaGlow', p: 699, sp: 549, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800', f: true,  d: { 'Capacidad': '30ml', 'Marca': 'VitaGlow', 'Tipo piel': 'Todos los tipos' } },
      { n: 'Mascarilla Capilar Keratina 500g', b: 'HairLux', p: 449, sp: 349, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', f: false, d: { 'Capacidad': '500g', 'Tipo cabello': 'Dañado/Reseco', 'Marca': 'HairLux' } },
      { n: 'Plancha de Cabello Titanio 450°F', b: 'SmoothStar', p: 1299, sp: 999, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800', f: true,  d: { 'Temperatura': 'Hasta 450°F', 'Material': 'Titanio', 'Marca': 'SmoothStar', 'Garantía': '2 Años' } },
      { n: 'Paleta de Sombras 35 Colores Pro', b: 'ColorMuse', p: 799, sp: 599, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800', f: false, d: { 'Colores': '35', 'Marca': 'ColorMuse', 'Tipo': 'Shimmer, Mate, Glitter' } },
      { n: 'Perfume Floral Oriental 100ml EDP', b: 'AuraSense', p: 2199, sp: null, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800', f: true,  d: { 'Capacidad': '100ml', 'Concentración': 'EDP', 'Notas': 'Rosa, Jazmín, Ámbar', 'Marca': 'AuraSense' } },
      { n: 'Cepillo Eléctrico Facial Limpieza', b: 'CleanFace', p: 899, sp: 699, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800', f: false, d: { 'Velocidades': '3', 'Recargable': 'Sí, USB-C', 'Marca': 'CleanFace', 'Garantía': '1 Año' } },
      { n: 'Aceite de Argán Puro Marroquí 100ml', b: 'ArganOil', p: 599, sp: null, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800', f: false, d: { 'Capacidad': '100ml', 'Origen': 'Marruecos', 'Marca': 'ArganOil', 'Certificación': 'Orgánico' } },
      { n: 'Set de Brochas Maquillaje 12 piezas', b: 'BrushSet', p: 649, sp: 499, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1590156562745-5b5e2d4c71da?w=800', f: false, d: { 'Piezas': '12', 'Material': 'Pelo Sintético Vegano', 'Marca': 'BrushSet', 'Color': 'Dorado/Blanco' } },
      { n: 'Crema Corporal Manteca de Karité 400ml', b: 'SheaSoft', p: 349, sp: 299, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', f: false, d: { 'Capacidad': '400ml', 'Aroma': 'Vainilla', 'Marca': 'SheaSoft', 'Tipo piel': 'Seca/Muy Seca' } },
      { n: 'Rizador Automático Cerámica 32mm', b: 'CurlPro', p: 1099, sp: 899, cat: 'Belleza', img: 'https://images.unsplash.com/photo-1504376379689-8d54347b26c6?w=800', f: false, d: { 'Diámetro': '32mm', 'Material': 'Cerámica Turmalina', 'Marca': 'CurlPro', 'Garantía': '1 Año' } },

      // === LIBROS (5 productos) ===
      { n: '"Atómicos Hábitos" James Clear', b: 'Editorial Planeta', p: 299, sp: 249, cat: 'Libros', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', f: true,  d: { 'Idioma': 'Español', 'Páginas': '320', 'Formato': 'Tapa blanda', 'Marca': 'Editorial Planeta' } },
      { n: '"El Arte de la Guerra" Sun Tzu', b: 'Ediciones Brontes', p: 199, sp: null, cat: 'Libros', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', f: false, d: { 'Idioma': 'Español', 'Páginas': '128', 'Formato': 'Tapa dura', 'Marca': 'Ediciones Brontes' } },
      { n: '"Piense y Hágase Rico" Napoleon Hill', b: 'Obelisco', p: 249, sp: 199, cat: 'Libros', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', f: false, d: { 'Idioma': 'Español', 'Páginas': '288', 'Formato': 'Tapa blanda', 'Marca': 'Obelisco' } },
      { n: '"Padre Rico Padre Pobre" Kiyosaki', b: 'Aguilar', p: 279, sp: null, cat: 'Libros', img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800', f: false, d: { 'Idioma': 'Español', 'Páginas': '256', 'Formato': 'Tapa blanda', 'Marca': 'Aguilar' } },
      { n: '"Cien Años de Soledad" García Márquez', b: 'RAE/Alfaguara', p: 399, sp: 349, cat: 'Libros', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800', f: true,  d: { 'Idioma': 'Español', 'Páginas': '432', 'Formato': 'Edición conmemorativa tapa dura', 'Marca': 'RAE/Alfaguara' } },

      // === MASCOTAS (5 productos) ===
      { n: 'Cama Ortopédica para Perro Grande', b: 'PetDream', p: 899, sp: 749, cat: 'Mascotas', img: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=800', f: false, d: { 'Dimensiones': '90x70cm', 'Material': 'Memory Foam', 'Color': 'Gris', 'Lavable': 'Sí' } },
      { n: 'Transportador Aéreo Mascotas M', b: 'PetFly', p: 649, sp: null, cat: 'Mascotas', img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=800', f: false, d: { 'Dimensiones': '45x28x28cm', 'Peso máx mascota': '7kg', 'Material': 'Tela Oxford', 'Color': 'Negro' } },
      { n: 'Rascador Árbol Gato 5 Niveles', b: 'CatWorld', p: 1299, sp: 999, cat: 'Mascotas', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', f: false, d: { 'Altura': '150cm', 'Material': 'Sisal/Felpa', 'Color': 'Beige', 'Garantía': '6 Meses' } },
      { n: 'Alimento Húmedo Gato Premium x12 latas', b: 'FelineLux', p: 499, sp: 399, cat: 'Mascotas', img: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=800', f: false, d: { 'Contenido': '12 latas x 85g', 'Sabor': 'Atún y Salmón', 'Marca': 'FelineLux' } },
      { n: 'Correa Retráctil Anti-jalón 5m', b: 'SafeWalk', p: 399, sp: 299, cat: 'Mascotas', img: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800', f: false, d: { 'Longitud': '5m', 'Carga máx': '25kg', 'Color': 'Rojo', 'Material': 'Nylon reforzado' } },

      // === HERRAMIENTAS (8 productos) ===
      { n: 'Caja de Herramientas Completa 150 piezas', b: 'ToolBox Pro', p: 2999, sp: 2499, cat: 'Herramientas', img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800', f: true,  d: { 'Piezas': '150', 'Material': 'Acero Cr-V', 'Color': 'Rojo/Negro', 'Garantía': '5 Años' } },
      { n: 'Sierra Circular Inalámbrica 20V', b: 'CutMaster', p: 4299, sp: 3799, cat: 'Herramientas', img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800', f: false, d: { 'Voltaje': '20V', 'Disco': '7-1/4"', 'Marca': 'CutMaster', 'Garantía': '3 Años' } },
      { n: 'Nivel Láser Autonivelante Verde', b: 'LevelPro', p: 2199, sp: 1799, cat: 'Herramientas', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', f: false, d: { 'Alcance': '30 metros', 'Color': 'Verde', 'Precisión': '±1mm/5m', 'Garantía': '2 Años' } },
      { n: 'Amoladora Angular 115mm 800W', b: 'GrindMax', p: 1099, sp: 899, cat: 'Herramientas', img: 'https://images.unsplash.com/photo-1563201515-adbe35c669c5?w=800', f: false, d: { 'Potencia': '800W', 'Disco': '115mm', 'Voltaje': '110V', 'Garantía': '1 Año' } },
      { n: 'Pistola de Calor 2000W Digital', b: 'HeatGun Pro', p: 899, sp: 749, cat: 'Herramientas', img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800', f: false, d: { 'Potencia': '2000W', 'Temperatura': '50-650°C', 'Voltaje': '110V', 'Garantía': '1 Año' } },
      { n: 'Compresor de Aire Portátil 10 Galones', b: 'AirForce', p: 5999, sp: null, cat: 'Herramientas', img: 'https://images.unsplash.com/photo-1558091007-b96cec3e4044?w=800', f: false, d: { 'Capacidad': '10 galones', 'Presión': '150 PSI', 'Voltaje': '110V', 'Garantía': '2 Años' } },
      { n: 'Multímetro Digital Profesional', b: 'VoltMeter Pro', p: 649, sp: 499, cat: 'Herramientas', img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', f: false, d: { 'Medidas': 'Voltaje, Corriente, Resistencia', 'Marca': 'VoltMeter Pro', 'Garantía': '2 Años' } },
      { n: 'Soldadora Inversora MIG 180A', b: 'WeldPro', p: 7499, sp: 6499, cat: 'Herramientas', img: 'https://images.unsplash.com/photo-1563201515-adbe35c669c5?w=800', f: false, d: { 'Corriente': '180A', 'Voltaje': '220V', 'Marca': 'WeldPro', 'Garantía': '2 Años' } },

      // === AUTOMOTRIZ (7 productos) ===
      { n: 'Kit Pulimento Pintura Auto 5 pasos', b: 'AutoShine', p: 899, sp: 699, cat: 'Automotriz', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800', f: false, d: { 'Piezas': '5', 'Marca': 'AutoShine', 'Tipo': 'Pulidor + Cera + Microfibra x2 + Aplicador' } },
      { n: 'Inflador Digital Portátil 150PSI', b: 'TireMax', p: 699, sp: 549, cat: 'Automotriz', img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800', f: false, d: { 'Presión': '150 PSI', 'Voltaje': '12V (encendedor)', 'Marca': 'TireMax', 'Garantía': '1 Año' } },
      { n: 'Cámara de Reversa HD Universal', b: 'SafeView', p: 799, sp: 649, cat: 'Automotriz', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800', f: false, d: { 'Resolución': '1080p', 'Ángulo': '170°', 'Impermeable': 'IP67', 'Garantía': '1 Año' } },
      { n: 'Soporte Magnético Celular Tablero', b: 'MagMount', p: 299, sp: 249, cat: 'Automotriz', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', f: false, d: { 'Compatibilidad': 'Universal con imán', 'Material': 'Aluminio/Neodimio', 'Marca': 'MagMount' } },
      { n: 'Aspiradora para Coche 12V 120W', b: 'CleanCar', p: 499, sp: 399, cat: 'Automotriz', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', f: false, d: { 'Potencia': '120W', 'Voltaje': '12V', 'Capacidad': '1.2L', 'Garantía': '1 Año' } },
      { n: 'Funda de Volante Microfibra Antideslizante', b: 'WheelWrap', p: 249, sp: null, cat: 'Automotriz', img: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800', f: false, d: { 'Diámetro': '37-38cm', 'Material': 'Microfibra', 'Color': 'Negro/Costura Roja' } },
      { n: 'Batería Jumper Portátil 2000A Peak', b: 'JumpStart Pro', p: 1999, sp: 1699, cat: 'Automotriz', img: 'https://images.unsplash.com/photo-1593941707882-a56bbc3f6a2c?w=800', f: true,  d: { 'Corriente pico': '2000A', 'Capacidad': '20000mAh', 'Marca': 'JumpStart Pro', 'Garantía': '2 Años' } },
    ];

    // Insertar productos
    let inserted = 0;
    for (const p of products) {
      const cat_id = catMap[p.cat];
      if (!cat_id) {
        console.warn(`⚠️  Categoría "${p.cat}" no encontrada, saltando producto "${p.n}"`);
        continue;
      }

      const id = generateId();
      await pool.query(
        `INSERT INTO product (id, name, brand, description, price, sale_price, stock, details, image_url, display_order, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          p.n,
          p.b,
          `${p.n} de la marca ${p.b}. Producto de alta calidad con características premium para satisfacer tus necesidades.`,
          p.p,
          p.sp ?? null,
          Math.floor(Math.random() * 150) + 10, // stock entre 10 y 159
          JSON.stringify(p.d),
          p.img,
          display_order++,
          p.f ? 1 : 0,
        ]
      );

      await pool.query(
        `INSERT INTO product_category (product_id, category_id) VALUES (?, ?)`,
        [id, cat_id]
      );

      inserted++;
    }

    console.log(`\n✅ ${inserted} productos nuevos insertados exitosamente sin eliminar datos existentes.`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar productos:', error);
    await pool.end();
    process.exit(1);
  }
};

main();
