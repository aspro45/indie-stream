"use client";

import React, { useState, useRef, useCallback } from "react";
import { useWallet, type InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { v4 as uuidv4 } from "uuid";
import { 
  expectedTotalChunksets, 
  ShelbyBlobClient, 
  ShelbyClient, 
  createDefaultErasureCodingProvider, 
  generateCommitments 
} from "@shelby-protocol/sdk/browser";

interface UploadZoneProps {
  onUploadComplete?: (mediaId: string) => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = "audio/*,video/*";

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setSuccessId(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith("audio/") || droppedFile.type.startsWith("video/"))) {
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    } else {
      setError("Please drop an audio or video file.");
    }
  }, [title]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      setSuccessId(null);
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        }
      }
    },
    [title]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError("Please select a file and enter a title.");
      return;
    }

    if (!connected || !account) {
      setError("Please connect your wallet to upload to Shelby.");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(5);

    try {
      // 1. File Encoding
      setProgress(10);
      const data = new Uint8Array(await file.arrayBuffer());
      const provider = await createDefaultErasureCodingProvider();
      const commitments = await generateCommitments(provider, data);

      setProgress(30);

      const id = uuidv4();
      const extension = file.name.split(".").pop() || "bin";
      const blobName = `media/${id}.${extension}`;

      // 2. On-Chain Registration
      setProgress(40);
      const payload = ShelbyBlobClient.createRegisterBlobPayload({
        account: account.address,
        blobName,
        blobMerkleRoot: commitments.blob_merkle_root,
        numChunksets: expectedTotalChunksets(commitments.raw_data_size),
        expirationMicros: (1000 * 60 * 60 * 24 * 30 + Date.now()) * 1000,
        blobSize: commitments.raw_data_size,
        encoding: 1, // Erasure Coded
      });

      const transaction: InputTransactionData = { data: payload };
      const transactionSubmitted = await signAndSubmitTransaction(transaction);
      
      setProgress(60);

      const aptosClient = new Aptos(new AptosConfig({ network: Network.TESTNET }));
      await aptosClient.waitForTransaction({ transactionHash: transactionSubmitted.hash });

      // 3. RPC Upload
      setProgress(80);
      const shelbyClient = new ShelbyClient({
        network: Network.TESTNET,
        apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY || "", 
      });

      await shelbyClient.rpc.putBlob({
        account: account.address,
        blobName: blobName,
        blobData: data,
      });

      setProgress(95);

      // 4. Save metadata
      const mType = file.type.startsWith("video/") ? "video" : "audio";
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: title.trim(),
          type: mType,
          blobName,
          accountAddress: account.address.toString(),
          uploaderWallet: account.address.toString(),
          fileSize: file.size,
          mimeType: file.type
        })
      });

      if (!res.ok) {
        throw new Error("Upload succeeded, but metadata saving failed.");
      }

      setProgress(100);
      setSuccessId(id);
      setFile(null);
      setTitle("");

      if (onUploadComplete) {
        onUploadComplete(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle("");
    setError(null);
    setSuccessId(null);
    setProgress(0);
  };

  return (
    <div className="upload-zone-wrapper">
      {/* Wallet Status */}
      <div className={`wallet-status ${connected ? "wallet-status--connected" : "wallet-status--disconnected"}`}>
        <div className="wallet-status__dot" />
        <span>
          {connected && account
            ? `Connected: ${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}`
            : "No wallet connected — uploads will use the app account"}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? "drop-zone--active" : ""} ${file ? "drop-zone--has-file" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="drop-zone__input"
        />

        {!file ? (
          <div className="drop-zone__prompt">
            <div className="drop-zone__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="drop-zone__text">
              Drag & drop your audio or video file here
            </p>
            <p className="drop-zone__subtext">
              or click to browse · MP4, MP3, WAV, WebM, OGG
            </p>
          </div>
        ) : (
          <div className="drop-zone__file-info">
            <div className="file-info__icon">
              {file.type.startsWith("video/") ? "🎬" : "🎵"}
            </div>
            <div className="file-info__details">
              <p className="file-info__name">{file.name}</p>
              <p className="file-info__meta">
                {formatFileSize(file.size)} · {file.type}
              </p>
            </div>
            <button
              className="file-info__remove"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Title Input */}
      {file && (
        <div className="upload-form">
          <label className="upload-form__label" htmlFor="media-title">
            Title
          </label>
          <input
            id="media-title"
            type="text"
            className="upload-form__input"
            placeholder="Give your media a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="progress-bar">
          <div className="progress-bar__track">
            <div
              className="progress-bar__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="progress-bar__text">
            {progress < 30
              ? "Preparing file..."
              : progress < 80
              ? "Uploading to Shelby network..."
              : "Finalizing..."}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="upload-message upload-message--error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Success */}
      {successId && (
        <div className="upload-message upload-message--success">
          <span>✅</span> Upload successful!{" "}
          <a href={`/watch/${successId}`} className="upload-message__link">
            Watch now →
          </a>
        </div>
      )}

      {/* Upload Button */}
      {file && !successId && (
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={uploading || !title.trim()}
        >
          {uploading ? (
            <span className="upload-btn__spinner" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              </svg>
              Upload to Shelby
            </>
          )}
        </button>
      )}
    </div>
  );
}
