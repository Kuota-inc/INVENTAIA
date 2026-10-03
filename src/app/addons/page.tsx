import { redirect } from 'next/navigation';

// Complementos vuela de momento: redirige a Financiamiento.
export default function AddonsPage() {
  redirect('/dashboard/financiamiento');
}
