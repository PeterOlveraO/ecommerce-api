import { AppError } from '../../middlewares/error.middleware.js';
import {
  findProductsPaginated,
  countProducts,
  findProductById,
  insertProduct,
  updateProduct,
  softDeleteProduct,
  deleteProductCategories,
  insertProductCategories,
  insertProductImages,
  replaceProductImages,
  type CreateProductInput,
  type UpdateProductInput,
} from './product.model.js';

// Parámetros de paginación que llegan del query string
export interface ProductListParams {
  page?:        string;
  limit?:       string;
  search?:      string;
  category_id?: string;
}

// Parsea los query params y ejecuta las dos queries en paralelo
export const getAllProducts = async (params: ProductListParams) => {
  // Parsea y acota los valores de paginación
  const page  = Math.max(1, parseInt(params.page  ?? '1',  10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit ?? '12', 10) || 12));

  const filters = {
    page,
    limit,
    search:      params.search      || undefined,
    category_id: params.category_id || undefined,
  };

  // Ejecuta ambas queries en paralelo para no sumar latencia
  const [data, total] = await Promise.all([
    findProductsPaginated(filters),
    countProducts(filters),
  ]);

  return { data, total, page, limit };
};

// Retorna un producto por ID con sus categorías; lanza 404 si no existe
export const getProductById = async (id: string) => {
  const product = await findProductById(id);
  if (!product) throw new AppError('Producto no encontrado', 404);
  return product;
};

// Crea un producto y asocia las categorías e imágenes secundarias indicadas
export const createProduct = async (input: CreateProductInput) => {
  const { category_ids, image_urls, ...product_data } = input;

  const id = await insertProduct(product_data);

  // Inserta las asociaciones de categorías si se proporcionaron
  if (category_ids && category_ids.length > 0) {
    await insertProductCategories(id, category_ids);
  }

  // Inserta las imágenes secundarias de la galería si se proporcionaron
  if (image_urls && image_urls.length > 0) {
    await insertProductImages(id, image_urls);
  }

  if (input.variants) {
    const { replaceProductVariants } = await import('./product.model.js');
    await replaceProductVariants(id, input.variants);
  }

  return getProductById(id);
};

// Actualiza un producto; si se pasan category_ids o image_urls, reemplaza todas sus asociaciones
export const updateProductById = async (
  id: string,
  input: UpdateProductInput
) => {
  // Verifica que el producto exista antes de actualizar
  await getProductById(id);

  const { category_ids, image_urls, ...product_data } = input;

  const updated = await updateProduct(id, product_data);

  // Reemplaza asociaciones de categorías si se enviaron
  if (category_ids !== undefined) {
    await deleteProductCategories(id);
    if (category_ids.length > 0) {
      await insertProductCategories(id, category_ids);
    }
  }

  // Reemplaza todas las imágenes secundarias si se envió el array
  if (image_urls !== undefined) {
    await replaceProductImages(id, image_urls);
  }

  if (input.variants !== undefined) {
    const { replaceProductVariants } = await import('./product.model.js');
    await replaceProductVariants(id, input.variants);
  }

  if (!updated && category_ids === undefined && image_urls === undefined) {
    throw new AppError('No se proporcionaron campos para actualizar', 400);
  }

  return getProductById(id);
};

// Realiza el soft delete del producto
export const deleteProductById = async (id: string) => {
  // Verifica que el producto exista antes de desactivar
  await getProductById(id);
  await softDeleteProduct(id);
};
