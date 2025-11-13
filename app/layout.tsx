import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CopilotProvider } from '@/components/ai/CopilotProvider';

export const metadata: Metadata = {
  title: 'Intune Configuration Reporter',
  description: 'Connect, inspect, and export your Intune environment',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <CopilotProvider>
          <div className="min-h-screen bg-bg-primary">
            {children}
          </div>
        </CopilotProvider>
      </body>
    </html>
  );
}
