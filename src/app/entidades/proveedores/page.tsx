import { redirect } from 'next/navigation';

// Directorio mock eliminado: el apartado real de Proveedores vive en /inventory/vendors.
export default function ProveedoresPage() {
  redirect('/inventory/vendors');
}
