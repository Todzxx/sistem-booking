export default function BookingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="h-8 w-44 bg-default-200 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-default-100 rounded-lg animate-pulse mt-2" />
      </div>
      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-default-50 animate-pulse border border-default-100"
          />
        ))}
      </div>
    </div>
  );
}
