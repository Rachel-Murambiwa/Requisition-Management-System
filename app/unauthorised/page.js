export default function UnauthorisedPage() {
  return (
    <div className="p-8 text-xs font-semibold lowercase text-red-600">
      <h1>403: identity access validation token missing or unauthorized</h1>
    </div>
  );
}