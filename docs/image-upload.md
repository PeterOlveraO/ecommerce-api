# Manejo de Imágenes en Ecommerce

Esta guía detalla cómo funciona el servicio de almacenamiento de imágenes en la API y cómo interactuar con él desde el frontend (CMS o Tienda).

---

## 1. El Endpoint de Subida

Para subir cualquier imagen física al servidor (fotos de producto, banners, imágenes de cabecera), debes hacer una petición al endpoint unificado de carga.

- **URL:** `/upload`
- **Método HTTP:** `POST`
- **Autenticación requerida:** Sí (Header `Authorization: Bearer <token>`)
- **Rol requerido:** `admin` (Solo un administrador puede subir imágenes)
- **Tipo de Petición:** `multipart/form-data`

### Restricciones de Seguridad
- **Formatos permitidos:** JPEG, PNG, WEBP, GIF.
- **Tamaño máximo:** 5 MB por archivo.

---

## 2. Cómo usarlo desde el Frontend (Ej. Astro / React)

Cuando el administrador selecciona un archivo local en el CMS, debes envolverlo en un objeto `FormData` y enviarlo mediante `fetch` o tu cliente preferido (como axios).

### Ejemplo — Subir una sola imagen:

```javascript
async function uploadImage(file) {
  const formData = new FormData();
  // ⚠️ EL NOMBRE DEL CAMPO DEBE SER "image"
  formData.append('image', file);

  const response = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    headers: {
      // NOTA VITAL: ¡NO configures el 'Content-Type' manualmente!
      // Al mandar un FormData, el navegador asigna automáticamente
      // 'multipart/form-data' junto con el 'boundary' necesario.
      'Authorization': `Bearer ${localStorage.getItem('token_admin')}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);

  return data.data.url; // Ejemplo: "/uploads/ab3...9f1.jpg"
}
```

---

## 3. Imágenes de Producto: Principal y Galería Secundaria

Los productos soportan **dos tipos de imágenes**:

| Campo | Tabla | Descripción |
|-------|-------|-------------|
| `image_url` | `product.image_url` | **Imagen principal** (portada, thumbnail). Una sola URL. |
| `image_urls` | `product_image` | **Galería secundaria**. Array de hasta 10 URLs ordenadas por `sort_order`. |

### Flujo típico en el CMS para crear un producto con galería:

```javascript
async function createProductWithGallery(productData, mainImageFile, galleryFiles) {
  // 1. Subir imagen principal
  const mainUrl = await uploadImage(mainImageFile);

  // 2. Subir cada imagen de la galería en paralelo
  const galleryUrls = await Promise.all(
    galleryFiles.map(file => uploadImage(file))
  );

  // 3. Crear el producto con ambos campos
  const response = await fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token_admin')}`
    },
    body: JSON.stringify({
      ...productData,
      image_url: mainUrl,        // Imagen principal (portada)
      image_urls: galleryUrls,   // Galería secundaria (orden respetado)
    })
  });

  return response.json();
}
```

### Flujo para actualizar la galería de un producto existente:

```javascript
// Enviar image_urls reemplaza TODA la galería secundaria del producto.
// Para borrar todas las imágenes secundarias, enviar un array vacío: image_urls: []

await fetch(`http://localhost:3000/products/${productId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token_admin')}`
  },
  body: JSON.stringify({
    image_urls: ['/uploads/img1.jpg', '/uploads/img2.jpg', '/uploads/img3.jpg']
  })
});
```

> **Nota:** Si no envías el campo `image_urls` en un PUT, la galería secundaria **no se modifica**.
> Si envías `image_urls: []`, se **borran todas** las imágenes secundarias.

---

## 4. Consumir/Visualizar las Imágenes

Una vez que la imagen fue cargada exitosamente, se guarda en la carpeta estática `public/uploads`.

El endpoint `GET /products/:id` devuelve la siguiente estructura:

```json
{
  "id": "...",
  "name": "Producto Ejemplo",
  "image_url": "/uploads/portada.jpg",
  "images": [
    "/uploads/galeria1.jpg",
    "/uploads/galeria2.jpg",
    "/uploads/galeria3.jpg"
  ]
}
```

Para mostrarlas en el frontend, concatena la URL base de la API:

```html
<!-- Imagen principal -->
<img src="http://localhost:3000/uploads/portada.jpg" alt="Portada del Producto" />

<!-- Galería secundaria -->
<div class="gallery">
  <img src="http://localhost:3000/uploads/galeria1.jpg" alt="Vista 1" />
  <img src="http://localhost:3000/uploads/galeria2.jpg" alt="Vista 2" />
</div>
```

**Recomendación:** Ten una variable de entorno global en tu frontend (ej. `PUBLIC_API_URL="http://localhost:3000"`) y úsala como prefijo cada vez que vayas a imprimir una imagen.
