import { useState } from 'react';
import { toast } from 'react-toastify';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? '';

  const uploadFile = async (
    cardId: string, 
    uploadData: { file: File; title: string; description?: string },
    departmentId?: number
  ): Promise<boolean> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description || "");
      formData.append("type", "Document");

      if (departmentId) {
        formData.append("departmentId", departmentId.toString());
      }

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/submissions/${cardId}`, {
        method: "POST",
        headers,
        body: formData
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.details || response.statusText;
        } catch {
          errorText = await response.text();
        }
        throw new Error(errorText || `Upload failed with status: ${response.status}`);
      }

      toast.success('File uploaded successfully!');
      return true;
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(`Upload failed: ${err.message}`);
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};