import { pool } from './src/config/db.js';

async function verify() {
  try {
    const [product] = await pool.query('DESCRIBE product;');
    console.log('--- PRODUCT TABLE ---');
    console.table(product);

    const [customer] = await pool.query('DESCRIBE customer;');
    console.log('--- CUSTOMER TABLE ---');
    console.table(customer);

    let [tables] = await pool.query('SHOW TABLES;');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('--- TABLES ---');
    console.log(tableNames);

    if (tableNames.includes('atribute')) {
      const [attrDesc] = await pool.query('DESCRIBE atribute;');
      console.log('--- ATRIBUTE TABLE ---');
      console.table(attrDesc);
    } else if (tableNames.includes('attribute')) {
      const [attrDesc] = await pool.query('DESCRIBE attribute;');
      console.log('--- ATTRIBUTE TABLE ---');
      console.table(attrDesc);
    } else {
      console.log('--- NO ATTRIBUTE TABLE FOUND ---');
    }
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}
verify();
