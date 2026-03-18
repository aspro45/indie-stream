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
