import { ProductRepo } from "src/repositories/product.repo";
import { Client } from "pg";
import { IProduct, IProductCreate } from "src/interfaces/product.interface";

export class ProductService {
  productRepo: ProductRepo;

  constructor() {
    this.productRepo = new ProductRepo();
  }

  async getProductsAsync(client: Client): Promise<IProduct[]> {
    const products = await this.productRepo.getProducts(client);
    return products.rows;
  }

  async getProductByIdAsync(client: Client, id: string): Promise<IProduct> {
    const product = await this.productRepo.getProductById(client, id);
    return product.rows[0];
  }

  async addProduct(client: Client, product: IProductCreate): Promise<string> {
    const id = await this.productRepo.addProduct(client, product);
    return id;
  }
}
