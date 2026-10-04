import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Dashboard | KUOTA',
  description: 'Compras Inteligentes para Empresas.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
