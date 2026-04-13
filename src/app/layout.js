import './globals.css';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'CoWork CRM',
  description: 'CRM for coworking spaces',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 pt-18 lg:p-8 lg:pt-8">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
