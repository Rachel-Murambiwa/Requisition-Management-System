export const metadata = {
  title: 'uncommon.org | Dashboard Workspace',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* This is a safe space for global dashboard wrappers like a sidebar or navigation header later!
      */}
      {children}
    </div>
  );
}