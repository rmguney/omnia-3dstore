import "./globals.css";
import { Ubuntu } from 'next/font/google'

export const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

export const metadata = {
  title: "Omnia Interactive",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={ubuntu.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
