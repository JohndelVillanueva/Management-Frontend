export const getFileIcon = (fileName: string, type: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (type === 'Image' || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension || '')) return '🖼️';
  if (type === 'PDF' || extension === 'pdf') return '📄';
  if (type === 'Spreadsheet' || ['xlsx', 'xls', 'csv'].includes(extension || '')) return '📊';
  if (['doc', 'docx'].includes(extension || '')) return '📝';
  if (['ppt', 'pptx'].includes(extension || '')) return '📈';
  return '📄';
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};