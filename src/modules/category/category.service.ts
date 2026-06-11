import { z } from 'zod';
import { CategoryModel } from './category.model.js';
import { AppError } from '../../middlewares/error.middleware.js';

// --- Schemas de validación Zod ---

// Schema para crear una categoría — todos los campos requeridos
export const create_category_schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  display_order: z.number().int().min(0, 'El orden debe ser un entero no negativo'),
});

// Schema para actualizar una categoría — todos los campos opcionales
export const update_category_schema = create_category_schema.partial();

// Tipos inferidos de los schemas
export type CreateCategoryInput = z.infer<typeof create_category_schema>;
export type UpdateCategoryInput = z.infer<typeof update_category_schema>;

// --- Lógica de negocio ---

export const CategoryService = {
  // Devuelve todas las categorías activas
  async getAll() {
    return CategoryModel.findAll();
  },

  // Devuelve una categoría por id; lanza 404 si no existe
  async getById(id: string) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }
    return category;
  },

  // Crea una nueva categoría; valida que el nombre no esté duplicado
  async create(data: CreateCategoryInput) {
    const existing = await CategoryModel.findByName(data.name);
    if (existing) {
      throw new AppError('Ya existe una categoría con ese nombre', 409);
    }
    const id = await CategoryModel.create(data);
    return CategoryModel.findById(id);
  },

  // Actualiza una categoría existente; valida unicidad de nombre si se cambia
  async update(id: string, data: UpdateCategoryInput) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (data.name && data.name !== category.name) {
      const existing = await CategoryModel.findByName(data.name);
      if (existing) {
        throw new AppError('Ya existe una categoría con ese nombre', 409);
      }
    }

    await CategoryModel.update(id, data);
    return CategoryModel.findById(id);
  },

  // Realiza un borrado suave de la categoría
  async remove(id: string) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }
    await CategoryModel.softDelete(id);
  },
};
