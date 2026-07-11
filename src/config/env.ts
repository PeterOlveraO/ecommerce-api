import 'dotenv/config';

// Valida que las variables de entorno requeridas existan al iniciar
const required_vars = [
  'PORT',
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'UPLOAD_DIR',
  'UPLOAD_BASE_URL',
];

for (const var_name of required_vars) {
  if (!process.env[var_name]) {
    throw new Error(`Variable de entorno requerida no encontrada: ${var_name}`);
  }
}

export const env = {
  port: Number(process.env.PORT),
  node_env: process.env.NODE_ENV as string,
  upload_dir: process.env.UPLOAD_DIR as string,
  upload_base_url: process.env.UPLOAD_BASE_URL as string,
  db: {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    name: process.env.DB_NAME as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    expires_in: process.env.JWT_EXPIRES_IN as string,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN as string,
  },
};
