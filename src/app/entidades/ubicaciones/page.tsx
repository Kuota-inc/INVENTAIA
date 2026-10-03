import { redirect } from 'next/navigation';

// Ubicaciones se elimina y se unifica con Sedes (Mi almacén).
export default function UbicacionesPage() {
  redirect('/inventory/branch-details');
}
