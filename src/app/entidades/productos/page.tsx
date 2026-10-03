import { redirect } from 'next/navigation';

// Producto e inventario son un solo flujo: el catálogo canónico es /products/products.
export default function ProductosPage() {
  redirect('/products/products');
}
