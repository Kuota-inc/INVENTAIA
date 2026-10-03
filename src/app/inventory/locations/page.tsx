import { redirect } from 'next/navigation';

// Ubicaciones se elimina como sección y se unifica con Sedes (Mi almacén).
// La API /api/locations sigue viva para el selector de ubicación.
export default function LocationsPage() {
  redirect('/inventory/branch-details');
}
