import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'CoWork CRM',
  description: 'CRM for coworking spaces',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
