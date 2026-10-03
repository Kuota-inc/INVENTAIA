import { redirect } from 'next/navigation';

// Vista legacy de sucursal: usar Mi almacén.
export default function SucursalPage() {
  redirect('/inventory/branch-details');
}
