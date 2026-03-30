import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Customizable info dashboard for your secondary monitor',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-root">
      {children}
    </div>
  );
}
