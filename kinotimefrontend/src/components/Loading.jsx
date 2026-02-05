export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="flex items-center gap-3 text-sm text-gray-300">
        <span className="h-3 w-3 animate-pulse rounded-full bg-red-600"></span>
        Loading...
      </div>
    </div>
  );
}
