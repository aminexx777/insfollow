export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-4">
          <div className="h-12 bg-muted rounded animate-pulse mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse mb-4"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
