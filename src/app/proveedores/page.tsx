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
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tu red de proveedores, acuerdos comerciales y catálogos de precios.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <PlusCircle size={20} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Barra de herramientas */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar proveedores..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Lista de Proveedores */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre / Descripción</th>
                <th className="px-6 py-4 font-medium">Términos Comerciales</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{provider.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{provider.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {provider.terms}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {provider.contact}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/proveedores/${provider.id}`} 
                      className="text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Ver Catálogo &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {mockProviders.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No tienes proveedores registrados aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
