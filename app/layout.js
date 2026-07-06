import { Inter } from 'next/font/google';
import '../styles/globals.css';

// 🛠️ FIX: Using Next.js Google Fonts to bypass the corrupted local binary font file
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-avenir', // Keeping the variable name identical so your CSS files don't break!
});

export const metadata = {
  title: 'uncommon.org | requisition management system',
  description: 'internal funds requisition and approval workflow platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-white text-[#111827]">
        {children}
      </body>
    </html>
  );
}