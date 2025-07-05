import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Sistem Presensi Sekolah",
  description: "Sistem manajemen presensi siswa sekolah dengan fitur QR Code, Real-time Notifications, dan Analytics",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
                {children}
              </div>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--card)',
                    color: 'var(--card-foreground)',
                    border: '1px solid var(--border)',
                  },
                  success: {
                    iconTheme: {
                      primary: 'var(--primary)',
                      secondary: 'var(--primary-foreground)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'var(--destructive)',
                      secondary: 'var(--destructive-foreground)',
                    },
                  },
                }}
              />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
