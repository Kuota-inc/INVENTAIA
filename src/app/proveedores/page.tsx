import { PlusCircle, Search, Settings } from 'lucide-react';
import Link from 'next/link';

// Mock data para empezar a diseñar la vista
const mockProviders = [
  {
    id: '1',
    name: 'TechSolutions Inc.',
    description: 'Mayorista de componentes electrónicos',
    terms: 'Crédito a 30 días, envío gratis a partir de $500',
    contact: '+1 234 567 8900'
  },
  {
    id: '2',
    name: 'Global Logistics',
    description: 'Servicios de empaque y distribución',
    terms: 'Pago contra entrega',
    contact: '+1 987 654 3210'
  }
];

export default function ProveedoresPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-obsidian)]" style={{ fontFamily: "var(--font-wise-sans)" }}>Proveedores</h1>
          <p className="mt-1" style={{ color: "var(--color-pebble)" }}>
            Gestiona tu red de proveedores, acuerdos comerciales y catálogos de precios.
          </p>
        </div>
        <button className="wise-btn-primary">
          <PlusCircle size={20} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="wise-card overflow-hidden !p-0">
        {/* Barra de herramientas */}
        <div className="p-4 border-b border-[var(--color-fog)] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-pebble)" }} size={20} />
            <input 
              type="text" 
              placeholder="Buscar proveedores..." 
              className="wise-input pl-10"
            />
          </div>
          <button className="wise-btn-outline !p-3">
            <Settings size={20} />
          </button>
        </div>

        {/* Lista de Proveedores */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm" style={{ background: "var(--color-fog)", color: "var(--color-charcoal)" }}>
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre / Descripción</th>
                <th className="px-6 py-4 font-semibold">Términos Comerciales</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-fog)]">
              {mockProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-[var(--color-fog)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold" style={{ color: "var(--color-obsidian)" }}>{provider.name}</div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--color-pebble)" }}>{provider.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm max-w-xs truncate" style={{ color: "var(--color-charcoal)" }}>
                      {provider.terms}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--color-charcoal)" }}>
                    {provider.contact}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/proveedores/${provider.id}`} 
                      className="wise-text-link opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Ver Catálogo &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {mockProviders.length === 0 && (
            <div className="p-12 text-center text-sm" style={{ color: "var(--color-pebble)" }}>
              No tienes proveedores registrados aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
