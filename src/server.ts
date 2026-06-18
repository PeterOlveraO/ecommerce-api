import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

const start = async () => {
  // Verifica la conexión a la base de datos antes de levantar el servidor
  try {
    const connection = await pool.getConnection();
    console.log(" Conexión a la base de datos establecida");
    connection.release();
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(` Servidor corriendo en http://localhost:${env.port}`);
    console.log(`   Entorno: ${env.node_env}`);
  });
};

start();
