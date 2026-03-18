"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Navbar() {
  const pathname = usePathname();
  const { connected } = useWallet();

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link href="/" className="navbar__logo">
          <span className="navbar__logo-icon">▶</span>
          <span className="navbar__logo-text">IndieStream</span>
        </Link>
        <div className="navbar__links">
          <Link
            href="/"
            className={`navbar__link ${pathname === "/" ? "navbar__link--active" : ""}`}
          >
            Discover
          </Link>
          <Link
            href="/upload"
            className={`navbar__link navbar__link--cta ${
              pathname === "/upload" ? "navbar__link--active" : ""
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            </svg>
            Upload
          </Link>
          {connected && (
            <Link
              href="/profile"
              className={`navbar__link ${pathname === "/profile" ? "navbar__link--active" : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </Link>
          )}
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
