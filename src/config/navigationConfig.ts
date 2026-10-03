import { ComponentType } from 'react';
import {
  LayoutDashboard,
  Bell,
  History,
  Tag,
  Building2,
  Store,
  User,
  Boxes,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Repeat,
  Settings,
  Shapes,
  BellPlus,
  BookOpen,
  MessageCircleQuestion,
  Headset,
  GraduationCap,
  FileQuestion,
  Blocks,
  LucideProps,
} from 'lucide-react';
import { NotificationSummary } from '@/services/NotificationService';

export interface NavItemConfig {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  aliases?: string[];
  icon: ComponentType<LucideProps>;
  badgeKey?: keyof NotificationSummary;
  badgeType?: 'alert' | 'warning' | 'info' | 'purple';
  /* Oculto del sidebar (síntesis visual): la ruta sigue viva vía aliases,
     buscador global, paleta de comandos y Nexo. Solo deja de ocupar
     espacio en el menú lateral. */
  sidebarHidden?: boolean;
}

export interface NavGroupConfig {
  id: string;
  title: string;
  items: NavItemConfig[];
}

/* Orden estándar de mercado (Stripe / Linear / Ramp): primero el pulso
   diario (panel), luego la operación (inventario), las relaciones
   (entidades por frecuencia de uso), conexiones, planes, y al fondo
   configuración y ayuda. Los ids/hrefs/aliases no cambian: el sidebar, la
   paleta de comandos y Nexo consumen este arreglo dinámicamente. */
export const NAVIGATION_CONFIG: NavGroupConfig[] = [
  {
    id: 'panel',
    title: 'PANEL',
    items: [
      {
        id: 'resumen',
        label: 'Resumen',
        href: '/panel',
        aliases: ['/panel/resumen', '/dashboard', '/'],
        icon: LayoutDashboard,
      },
      {
        id: 'alertas-stock',
        label: 'Alertas de stock',
        href: '/stock-alerts',
        aliases: ['/panel/alertas', '/estrategia/riesgo-quiebre', '/quiebre'],
        icon: Bell,
        badgeKey: 'riesgoQuiebre',
        badgeType: 'alert',
      },
      {
        id: 'actividad-reciente',
        label: 'Actividad reciente',
        href: '/activity-log',
        aliases: ['/panel/actividad', '/dashboard/ordenes'],
        icon: History,
      },
    ],
  },
  {
    id: 'producto',
    title: 'PRODUCTO',
    items: [
      {
        id: 'productos',
        label: 'Productos',
        href: '/products/products',
        aliases: ['/entidades/productos'],
        icon: Tag,
      },
      {
        // Inventario vive dentro del desplegable de Producto: un solo flujo.
        id: 'inventario-actual',
        label: 'Inventario',
        href: '/inventario',
        aliases: ['/dashboard/inventario', '/inventory'],
        icon: Boxes,
        badgeKey: 'inventarioInmovilizado',
        badgeType: 'warning',
      },
      {
        id: 'recibos',
        label: 'Recibos',
        href: '/inventory/incoming',
        aliases: ['/inventario/recibos'],
        icon: ArrowDownLeft,
      },
      {
        // Ajuste es un botón dentro de Inventario, no un ítem de menú.
        id: 'ajustes-stock',
        label: 'Ajustes de stock',
        href: '/inventory/stock-adjustments',
        aliases: ['/inventario/ajustes'],
        icon: ArrowLeftRight,
        sidebarHidden: true,
      },
      {
        // Importaciones es un botón dentro de Inventario.
        id: 'importaciones',
        label: 'Importaciones',
        href: '/inventory/imports',
        aliases: ['/inventario/importaciones'],
        icon: Download,
        sidebarHidden: true,
      },
      {
        // Despachos sale del menú (la ruta sigue viva por compatibilidad).
        id: 'despachos',
        label: 'Despachos',
        href: '/inventory/outgoing',
        aliases: ['/inventario/despachos'],
        icon: ArrowUpRight,
        sidebarHidden: true,
      },
      {
        // Alertas y reorders viven dentro de Inventarios.
        id: 'alertas-reorders',
        label: 'Alertas y reorders',
        href: '/settings/stock-alerts-reorders',
        aliases: ['/configuracion/alertas'],
        icon: BellPlus,
        sidebarHidden: true,
      },
    ],
  },
  {
    id: 'entidades',
    title: 'ENTIDADES',
    items: [
      {
        id: 'proveedores',
        label: 'Proveedores',
        href: '/proveedores',
        aliases: ['/entidades/proveedores', '/abastecimiento/proveedores-criticos'],
        icon: Store,
        badgeKey: 'proveedoresCriticos',
        badgeType: 'alert',
      },
      {
        // El apartado Clientes pasa a ser el apartado Ventas.
        id: 'ventas',
        label: 'Ventas',
        href: '/ventas',
        aliases: ['/entidades/clientes', '/ventas'],
        icon: User,
      },
      {
        id: 'mi-almacen',
        label: 'Mi almacén',
        sublabel: 'Sedes e inventario por sede',
        href: '/inventory/branch-details',
        aliases: ['/entidades/sucursal', '/mi-almacen'],
        icon: Building2,
      },
      {
        id: 'compras',
        label: 'Compras',
        href: '/compras',
        aliases: ['/compras'],
        icon: Repeat,
      },
    ],
  },
  {
    id: 'integraciones',
    title: 'INTEGRACIONES',
    items: [
      {
        id: 'centro-integraciones',
        label: 'Integraciones',
        sublabel: 'Marketplaces, e-commerce y ERP',
        href: '/dashboard/integraciones',
        aliases: ['/integraciones', '/integrations'],
        icon: Blocks,
      },
    ],
  },
  {
    id: 'finanzas',
    title: 'FINANZAS',
    items: [
      {
        id: 'financiamiento',
        label: 'Financiamiento',
        href: '/financiamiento',
        aliases: ['/financiamiento', '/financing', '/complementos/planes', '/plans'],
        icon: Repeat,
      },
    ],
  },
  {
    id: 'configuracion',
    title: 'CONFIGURACIÓN',
    items: [
      {
        id: 'config-general',
        label: 'Configuración general',
        href: '/settings/general-settings',
        aliases: ['/configuracion/general', '/dashboard/ajustes', '/settings'],
        icon: Settings,
      },
      {
        id: 'categorias',
        label: 'Categorías',
        href: '/settings/product-categories',
        aliases: ['/configuracion/categorias'],
        icon: Shapes,
        sidebarHidden: true,
      },
      {
        id: 'alertas-reorders',
        label: 'Alertas y reorders',
        href: '/settings/stock-alerts-reorders',
        aliases: ['/configuracion/alertas'],
        icon: BellPlus,
        sidebarHidden: true,
      },
    ],
  },
  {
    id: 'ayuda',
    title: 'AYUDA',
    items: [
      {
        id: 'guia-usuario',
        label: 'Guía del usuario',
        href: '/help/user-guide',
        aliases: ['/ayuda/guia'],
        icon: BookOpen,
      },
      {
        id: 'faq',
        label: 'Preguntas frecuentes',
        href: '/help/faq',
        aliases: ['/ayuda/faq'],
        icon: MessageCircleQuestion,
        sidebarHidden: true,
      },
      {
        id: 'contactar-soporte',
        label: 'Contactar soporte',
        href: '/help/contact-support',
        aliases: ['/ayuda/soporte', '/soporte', '/support'],
        icon: Headset,
      },
      {
        id: 'aprender',
        label: 'Aprender',
        href: '/help/learn',
        aliases: ['/ayuda/aprender'],
        icon: GraduationCap,
        sidebarHidden: true,
      },
      {
        id: 'ponme-a-prueba',
        label: 'Ponme a prueba',
        href: '/help/grill-me',
        aliases: ['/ayuda/prueba'],
        icon: FileQuestion,
        sidebarHidden: true,
      },
    ],
  },
];
