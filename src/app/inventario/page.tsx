import InventarioPage from '@/app/dashboard/inventario/page';

export const metadata = {
  title: 'Inventario | KUOTA',
  description: 'Control de SKUs, stock físico, valorización y salud de inventario en tiempo real.',
};

export default function InventarioRoutePage() {
  return <InventarioPage />;
}
