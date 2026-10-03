import { redirect } from 'next/navigation';

// Comparar planes vuela: redirige a Financiamiento.
export default function PlansPage() {
  redirect('/dashboard/financiamiento');
}
