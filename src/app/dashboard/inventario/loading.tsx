/**
 * Inventario loading skeleton — tabla de productos con placeholders animados.
 */
export default function InventarioLoading() {
  return (
    <div className="animate-pulse space-y-5 p-2">
      {/* Filters bar */}
      <div className="flex gap-3">
        <div
          className="h-10 w-48 rounded-lg"
          style={{ background: 'var(--bg2, #f3f4f6)' }}
        />
        <div
          className="h-10 w-32 rounded-lg"
          style={{ background: 'var(--bg2, #f3f4f6)' }}
        />
        <div className="flex-1" />
        <div
          className="h-10 w-28 rounded-lg"
          style={{ background: 'var(--bg2, #f3f4f6)' }}
        />
      </div>
      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl"
            style={{ background: 'var(--bg2, #f3f4f6)' }}
          />
        ))}
      </div>
      {/* Table */}
      <div className="space-y-2">
        <div
          className="h-12 rounded-lg"
          style={{ background: 'var(--bg2, #f3f4f6)' }}
        />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-lg"
            style={{ background: 'var(--bg2, #f3f4f6)' }}
          />
        ))}
      </div>
    </div>
  );
}
