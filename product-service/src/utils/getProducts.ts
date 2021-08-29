import products from "./mock-data.json";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export const getProducts = (throwError: boolean = false): Promise<Product[]> =>
  new Promise((res, rej) => {
    if (throwError) rej("Error getting products");
    else res(products);
  });
