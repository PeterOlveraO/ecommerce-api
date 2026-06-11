import { v4 as uuidv4 } from 'uuid';

// Genera un UUID v4 para usar como PK
export const generateId = (): string => uuidv4();
