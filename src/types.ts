export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    badge?: string;
    image: string;
    description: string;
    stock: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}
