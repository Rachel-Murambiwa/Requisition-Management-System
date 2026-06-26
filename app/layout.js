import localFont from 'next/font/local';
import '../styles/globals.css';

const avenir = localFont({
  src: '../fonts/AvenirNext-Bold.woff2',
  variable: '--font-avenir',
});

export const metadata = {
  title: 'uncommon.org | requisition management system',
  description: 'internal funds requisition and approval workflow platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={avenir.variable}>
      <body className="antialiased bg-white text-[#111827]">
        {children}
      </body>
    </html>
  );
}