import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const FileDetails = () => {
  const { fileId } = useParams();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/file/${fileId}`);
        if (!res.ok) throw new Error("Failed to fetch file");
        const data = await res.json();
        setFile(data);
      } catch (err: any) {
        setError(err.message || "Error loading file");
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [fileId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!file) return <div>No file found.</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">{file.name}</h2>
      <div className="mb-2">
        <strong>Owner:</strong>{" "}
        {file.user
          ? `${file.user.first_name ?? ""} ${file.user.last_name ?? ""}`.trim()
          : "Unknown"}
      </div>
      <div className="mb-2">
        <strong>Type:</strong> {file.type}
      </div>
      <div className="mb-2">
        <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
      </div>
      <div className="mb-2">
        <strong>Last Modified:</strong>{" "}
        {file.updatedAt
          ? new Date(file.updatedAt).toLocaleString()
          : new Date(file.createdAt).toLocaleString()}
      </div>
      <div className="mb-2">
        <strong>Download:</strong>{" "}
        <a
          href={file.path}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {file.name}
        </a>
      </div>
    </div>
  );
};

export default FileDetails;