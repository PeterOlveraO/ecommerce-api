import { z } from 'zod';
import { HeaderImageModel } from './header_image.model.js';
import { AppError } from '../../middlewares/error.middleware.js';

// --- Schemas de validación Zod ---

// Schema para crear una imagen de cabecera
export const create_header_image_schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  image_url: z.string().url('La URL de la imagen no es válida'),
  link_url: z.string().nullable().optional(),
  display_order: z.number().int().min(0, 'El orden debe ser un entero no negativo'),
});

// Schema para actualizar una imagen de cabecera — todos los campos opcionales
export const update_header_image_schema = create_header_image_schema.partial();

// Tipos inferidos de los schemas
export type CreateHeaderImageInput = z.infer<typeof create_header_image_schema>;
export type UpdateHeaderImageInput = z.infer<typeof update_header_image_schema>;

// --- Lógica de negocio ---

export const HeaderImageService = {
  // Devuelve todas las imágenes de cabecera activas
  async getAll() {
    return HeaderImageModel.findAll();
  },

  // Devuelve una imagen de cabecera por id; lanza 404 si no existe
  async getById(id: string) {
    const image = await HeaderImageModel.findById(id);
    if (!image) {
      throw new AppError('Imagen de cabecera no encontrada', 404);
    }
    return image;
  },

  // Crea una nueva imagen de cabecera
  async create(data: CreateHeaderImageInput) {
    const id = await HeaderImageModel.create(data);
    return HeaderImageModel.findById(id);
  },

  // Actualiza una imagen de cabecera existente
  async update(id: string, data: UpdateHeaderImageInput) {
    const image = await HeaderImageModel.findById(id);
    if (!image) {
      throw new AppError('Imagen de cabecera no encontrada', 404);
    }
    await HeaderImageModel.update(id, data);
    return HeaderImageModel.findById(id);
  },

  // Realiza un borrado suave de la imagen de cabecera
  async remove(id: string) {
    const image = await HeaderImageModel.findById(id);
    if (!image) {
      throw new AppError('Imagen de cabecera no encontrada', 404);
    }
    await HeaderImageModel.softDelete(id);
  },
};
