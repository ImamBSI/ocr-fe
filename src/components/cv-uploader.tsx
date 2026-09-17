import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useUploadCV } from '@/hooks';
import { useJobStore } from '@/store';

interface CVUploaderProps {
  onUploadSuccess?: () => void;
  singleFile?: boolean;
}

export const CVUploader: React.FC<CVUploaderProps> = ({
  onUploadSuccess,
  singleFile = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const { uploadCV, uploadMultipleCV, isLoading, error } = useUploadCV();
  const { selectedJob } = useJobStore();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files).filter((file) => {
      const isPDF = file.type === 'application/pdf';
      const isDOCX =
        file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      return isPDF || isDOCX;
    });

    if (fileArray.length === 0) {
      setUploadStatus('error');
      setUploadMessage('Only PDF and DOCX files are supported');
      return;
    }

    if (singleFile) {
      setSelectedFiles([fileArray[0]]);
    } else {
      setSelectedFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus('error');
      setUploadMessage('Please select files to upload');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading files...');

    try {
      if (selectedFiles.length === 1 && singleFile) {
        await uploadCV(selectedFiles[0], selectedJob?.id);
      } else {
        await uploadMultipleCV(selectedFiles, selectedJob?.id);
      }

      setUploadStatus('success');
      setUploadMessage(
        `Successfully uploaded ${selectedFiles.length} file(s)`
      );
      setSelectedFiles([]);

      setTimeout(() => {
        onUploadSuccess?.();
        setUploadStatus('idle');
        setUploadMessage('');
      }, 2000);
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage(error || 'Upload failed. Please try again.');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={!singleFile}
          accept=".pdf,.docx"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-lg font-semibold text-gray-700 mb-1">
            Drag & drop your files here
          </p>
          <p className="text-sm text-gray-500">
            or click to select files (PDF, DOCX)
          </p>
          {!selectedJob && (
            <p className="text-xs text-amber-600 mt-3 bg-amber-50 px-3 py-1 rounded">
              ⚠️ Select a job requirement first
            </p>
          )}
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === 'error' && (
        <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{uploadMessage}</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-700">{uploadMessage}</p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || isLoading || !selectedJob}
        className={`w-full mt-6 py-2 px-4 rounded-lg font-medium transition-colors ${
          selectedFiles.length === 0 || isLoading || !selectedJob
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
      </button>
    </div>
  );
};

export default CVUploader;