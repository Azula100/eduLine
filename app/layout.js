import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import ShellGate from "@/components/ShellGate";

export const metadata = { title: "EduLine" };

export default function RootLayout({ children }) {
  return (
    <html lang="mn" data-scroll-behavior="smooth">
      <body>
        <ShellGate>{children}</ShellGate>
      </body>
    </html>
  );
}