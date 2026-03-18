"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function WalletConnect() {
  const { connect, disconnect, account, connected, wallets, wallet } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowWalletList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      setShowWalletList(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDropdown(false);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  // Not connected — show connect button
  if (!connected || !account) {
    return (
      <div className="wallet-connect" ref={dropdownRef}>
        <button
          className="wallet-connect__btn"
          onClick={() => setShowWalletList(!showWalletList)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 10h20" />
            <circle cx="17" cy="15" r="1.5" />
          </svg>
          Connect Wallet
        </button>

        {showWalletList && (
          <div className="wallet-dropdown">
            <div className="wallet-dropdown__header">
              <h4>Select Wallet</h4>
            </div>
            {wallets && wallets.length > 0 ? (
              <div className="wallet-dropdown__list">
                {wallets.map((w) => (
                  <button
                    key={w.name}
                    className="wallet-dropdown__item"
                    onClick={() => handleConnect(w.name)}
                  >
                    {w.icon && (
                      <img
                        src={w.icon}
                        alt={w.name}
                        className="wallet-dropdown__icon"
                      />
                    )}
                    <span>{w.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="wallet-dropdown__empty">
                <p>No Aptos wallets detected.</p>
                <a
                  href="https://petra.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wallet-dropdown__install-link"
                >
                  Install Petra Wallet →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Connected — show address with dropdown
  return (
    <div className="wallet-connect" ref={dropdownRef}>
      <button
        className="wallet-connect__account"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="wallet-connect__avatar">
          <div
            className="wallet-connect__avatar-inner"
            style={{
              background: `linear-gradient(135deg, hsl(${
                parseInt(account.address.toString().slice(2, 6), 16) % 360
              }, 70%, 50%), hsl(${
                (parseInt(account.address.toString().slice(2, 6), 16) + 60) % 360
              }, 70%, 40%))`,
            }}
          />
        </div>
        <span className="wallet-connect__address">
          {truncateAddress(account.address.toString())}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`wallet-connect__chevron ${showDropdown ? "wallet-connect__chevron--open" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showDropdown && (
        <div className="wallet-dropdown">
          <div className="wallet-dropdown__header">
            <p className="wallet-dropdown__wallet-name">
              {wallet?.name || "Wallet"}
            </p>
            <p className="wallet-dropdown__full-address">
              {truncateAddress(account.address.toString())}
            </p>
          </div>
          <div className="wallet-dropdown__menu">
            <Link
              href="/profile"
              className="wallet-dropdown__menu-item"
              onClick={() => setShowDropdown(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              My Uploads
            </Link>
            <button
              className="wallet-dropdown__menu-item wallet-dropdown__menu-item--danger"
              onClick={handleDisconnect}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
