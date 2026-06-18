import { z } from 'zod';
import { AppError } from '../../middlewares/error.middleware.js';
import { AttributeModel, Attribute } from './attribute.model.js';

export const create_attribute_schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
});

export const update_attribute_schema = z.object({
  name: z.string().min(1).max(100).optional(),
});

type CreateAttributeInput = z.infer<typeof create_attribute_schema>;
type UpdateAttributeInput = z.infer<typeof update_attribute_schema>;

export const AttributeService = {
  async getAll(): Promise<Attribute[]> {
    return AttributeModel.findAll();
  },

  async getById(id: string): Promise<Attribute> {
    const attribute = await AttributeModel.findById(id);
    if (!attribute) throw new AppError('Atributo no encontrado', 404);
    return attribute;
  },

  async create(data: CreateAttributeInput): Promise<Attribute> {
    const existing = await AttributeModel.findByName(data.name);
    if (existing) throw new AppError('El atributo ya existe', 409);

    const id = await AttributeModel.create(data);
    return this.getById(id);
  },

  async update(id: string, data: UpdateAttributeInput): Promise<Attribute> {
    const attribute = await this.getById(id);

    if (data.name && data.name !== attribute.name) {
      const existing = await AttributeModel.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError('El nombre del atributo ya está en uso', 409);
      }
    }

    await AttributeModel.update(id, data);
    return this.getById(id);
  },

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await AttributeModel.softDelete(id);
  },
};
