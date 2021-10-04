export interface IProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  count: number;
}

export interface IProductCreate {
  title: string;
  description?: string;
  price: number;
  count: number;
}
