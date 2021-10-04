import { Client } from "pg";
import { IProductCreate } from "src/interfaces/product.interface";
export class ProductRepo {
  getProducts(client: Client) {
    return client.query(`
        SELECT p.*, s.count
            FROM products p
        INNER JOIN stocks s ON p.id = s.product_id;`);
  }

  getProductById(client: Client, id: string) {
    const query = {
      text: `SELECT p.*, s.count
                FROM products p
            INNER JOIN stocks s ON p.id = s.product_id
            WHERE p.id = $1;`,
      values: [id],
    };

    return client.query(query);
  }

  async addProduct(client: Client, product: IProductCreate): Promise<string> {
    const { title, description, count, price } = product;

    try {
      await client.query("BEGIN");
      const addProductResult = await client.query(
        `
            INSERT INTO products (title, description, price)
                VALUES ($1, $2, $3) RETURNING id;
          `,
        [title, description, price]
      );

      const newProductId = addProductResult.rows[0].id;

      await client.query(
        `
        INSERT INTO stocks (product_id, count)
            VALUES ($1, $2);
        `,
        [newProductId, count]
      );
      await client.query("COMMIt");

      return newProductId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
}
