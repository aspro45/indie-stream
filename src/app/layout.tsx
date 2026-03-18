import type { Metadata } from "next";
import WalletProvider from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "IndieStream — Decentralized Media",
  description:
    "Stream and share indie music and videos on the decentralized Shelby Protocol network. Upload, discover, and play media with cryptographic storage guarantees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProvider>
          <Navbar />
          <div className="app-content">{children}</div>
          <footer className="app-footer">
            <p>
              Powered by{" "}
              <a href="https://shelby.xyz" target="_blank" rel="noopener noreferrer">
                Shelby Protocol
              </a>{" "}
              · Decentralized storage on{" "}
              <a href="https://aptoslabs.com" target="_blank" rel="noopener noreferrer">
                Aptos
              </a>
            </p>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
