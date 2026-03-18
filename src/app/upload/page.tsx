import UploadZone from "@/components/UploadZone";

export const metadata = {
  title: "Upload | IndieStream",
  description: "Upload your audio and video to the decentralized Shelby network",
};

export default function UploadPage() {
  return (
    <main className="page-container">
      <div className="upload-page">
        <div className="upload-page__header">
          <h1 className="upload-page__title">Upload Media</h1>
          <p className="upload-page__subtitle">
            Share your music and videos on the decentralized web. Files are stored
            on the <strong>Shelby Protocol</strong> network with cryptographic
            guarantees.
          </p>
        </div>
        <UploadZone />
      </div>
    </main>
  );
}
