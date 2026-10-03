import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspace } from '@/lib/requireWorkspace';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireWorkspace();
    if (auth.error) return auth.error;

    const params = req.nextUrl.searchParams;
    const q = params.get('q')?.trim() || '';
    const myProviders = params.get('myProviders') === 'true'; // Si es true, retorna solo los del workspace

    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();

    let query = supabase.from('suppliers').select('*');

    if (q) {
      query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
    }

    if (myProviders) {
      // Necesitamos hacer join con workspace_suppliers
      // Nota: Como 'workspace_suppliers' es una tabla separada, primero obtenemos los IDs
      // Asumiremos que el frontend pasará myProviders=true si quiere solo sus proveedores.
      // O podemos hacerlo con un query join. Para mantenerlo simple:
      
      const session = auth.workspaceId || 'ws-default'; // TODO: get from auth properly
      
      const { data: wsData, error: wsError } = await supabase
        .from('workspace_suppliers')
        .select('supplier_id')
        .eq('workspace_id', session);
        
      if (wsError && wsError.code !== '42P01') { 
        // 42P01 es table undefined (aún no corrieron la migración)
        console.error(wsError);
      }
      
      const supplierIds = wsData?.map(w => w.supplier_id) || [];
      
      if (supplierIds.length > 0) {
        query = query.in('id', supplierIds);
      } else {
        // No tiene proveedores
        return NextResponse.json({ success: true, items: [] });
      }
    }

    const { data, error } = await query;
    
    // Si la tabla no existe aún porque no han corrido el script SQL, mandamos data simulada
    if (error && error.code === '42P01') {
      return NextResponse.json({ 
        success: true, 
        items: [], 
        warning: 'Por favor ejecuta el script de migración SQL en Supabase.' 
      });
    }
    
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, items: data || [] });

  } catch (error: any) {
    console.error('Error en GET /api/suppliers:', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireWorkspace();
    if (auth.error) return auth.error;
    const body = await req.json().catch(() => null);
    
    const supplierId = body?.supplierId;
    const action = body?.action; // 'add' | 'remove'
    
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    
    const session = auth.workspaceId || 'ws-default';
    
    if (action === 'add') {
      await supabase.from('workspace_suppliers').insert({
        workspace_id: session,
        supplier_id: supplierId
      });
    } else if (action === 'remove') {
      await supabase.from('workspace_suppliers').delete()
        .eq('workspace_id', session)
        .eq('supplier_id', supplierId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
