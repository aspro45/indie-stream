import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";

let clientInstance: ShelbyNodeClient | null = null;

/**
 * Get or create a singleton ShelbyNodeClient for server-side operations.
 */
export function getShelbyClient(): ShelbyNodeClient {
  if (!clientInstance) {
    clientInstance = new ShelbyNodeClient({
      network: Network.TESTNET,
      apiKey: process.env.SHELBY_API_KEY || "",
    });
  }
  return clientInstance;
}

/**
 * Load the Aptos Ed25519 account from environment variables.
 */
export function getAccount(): Account {
  const privateKeyHex = process.env.APTOS_PRIVATE_KEY;
  if (!privateKeyHex) {
    throw new Error("APTOS_PRIVATE_KEY environment variable is not set.");
  }
  const privateKey = new Ed25519PrivateKey(privateKeyHex);
  return Account.fromPrivateKey({ privateKey });
}

/**
 * Build the direct retrieval URL for a blob stored on Shelby Testnet.
 * Format: https://api.testnet.shelby.xyz/shelby/v1/blobs/{accountAddress}/{blobName}
 */
export function getShelbyRetrievalUrl(
  accountAddress: string,
  blobName: string
): string {
  return `https://api.testnet.shelby.xyz/shelby/v1/blobs/${accountAddress}/${encodeURIComponent(blobName)}`;
}
