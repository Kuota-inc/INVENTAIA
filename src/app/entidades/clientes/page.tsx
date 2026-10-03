import { redirect } from 'next/navigation';

// El apartado Clientes ahora es el apartado Ventas (/inventory/clients).
export default function ClientesPage() {
  redirect('/inventory/clients');
}
