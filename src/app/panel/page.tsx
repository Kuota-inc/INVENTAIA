import DashboardOverview from '@/components/inventory/DashboardOverview';

export const metadata = {
  title: 'Panel Ejecutivo | KUOTA',
  description: 'Centro de control ejecutivo: KPIs en tiempo real, forecast de demanda y salud de inventario.',
};

export default function PanelPage() {
  return <DashboardOverview />;
}
