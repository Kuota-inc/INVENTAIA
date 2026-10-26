/**
 * Dashboard loading skeleton — muestra placeholders animados mientras se
 * carga la página real, mejorando la percepción de velocidad (Instant FCP).
 */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 p-2">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl"
            style={{ background: 'var(--bg2, #f3f4f6)' }}
          />
        ))}
      </div>
      {/* Chart area */}
      <div
        className="h-64 rounded-xl"
        style={{ background: 'var(--bg2, #f3f4f6)' }}
      />
      {/* Table area */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
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
