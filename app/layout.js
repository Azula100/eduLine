import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export const metadata = { title: "EduLine" };

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}