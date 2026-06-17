// Change this line to use a direct relative path import
import '../styles/globals.css';

export const metadata = {
  title: 'uncommon.org | requisition management system',
  description: 'internal funds requisition and approval workflow platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-[#111827]">
        {children}
      </body>
    </html>
  );
}