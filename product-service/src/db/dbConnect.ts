import { Client } from "pg";

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const dbOptions = {
  host: PG_HOST,
  port: Number(PG_PORT),
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
};

export class DbContext {
  static client: Client;

  public static getClient() {
    DbContext.client = new Client(dbOptions);
    return DbContext.client;
  }

  public static async connect() {
    await DbContext.client.connect();
  }

  public static async end() {
    await DbContext.client.end();
  }
}
