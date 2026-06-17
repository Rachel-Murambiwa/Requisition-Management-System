export default function DashboardGroupLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* This renders our nested pages, like the requester dashboard dashboard */}
      {children}
    </div>
  );
}