import './globals.css';
import { ToastProvider } from '@/components/Toast';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'LaunchBox CRM',
  description: 'CRM for coworking spaces',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
