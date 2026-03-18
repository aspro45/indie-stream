export interface MediaItem {
  id: string;
  title: string;
  type: 'audio' | 'video';
  blobName: string;
  accountAddress: string;
  uploaderWallet?: string;
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadFormData {
  title: string;
  file: File;
}
