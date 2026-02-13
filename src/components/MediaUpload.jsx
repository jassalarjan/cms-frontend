import React, { useState, useCallback, useRef } from 'react';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  XMarkIcon, 
  CloudArrowUpIcon,
  PlayIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MediaUpload = ({ 
  onFilesChange, 
  maxFiles = 5, 
  maxImageSize = 10 * 1024 * 1024, // 10MB for images
  maxVideoSize = 100 * 1024 * 1024, // 100MB for videos
  multiple = true,
  className = ""
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return `File ${file.name} must be an image or video`;
    }

    // Check file size
    const maxSize = isImage ? maxImageSize : maxVideoSize;
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Max size is ${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
    }

    return null;
  };

  const processFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const errors = [];

    // Check total files limit
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        // Check for duplicates
        const isDuplicate = files.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );
        
        if (!isDuplicate) {
          const fileData = {
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            isImage: file.type.startsWith('image/'),
            isVideo: file.type.startsWith('video/'),
            preview: URL.createObjectURL(file),
            status: 'ready'
          };
          validFiles.push(fileData);
        } else {
          errors.push(`File ${file.name} is already selected`);
        }
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  }, [files, maxFiles, onFilesChange]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Revoke object URL to avoid memory leaks
    const removedFile = files.find(f => f.id === fileId);
    if (removedFile && removedFile.preview) {
      URL.revokeObjectURL(removedFile.preview);
    }
    toast.success('File removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-3 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <PhotoIcon className="w-16 h-16 text-blue-500" />
            <VideoCameraIcon className="w-16 h-16 text-purple-500" />
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Upload Images & Videos
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Drag and drop files here, or click to select
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <CloudArrowUpIcon className="w-5 h-5" />
            Choose Files
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Images: Max {(maxImageSize / (1024 * 1024)).toFixed(0)}MB • 
            Videos: Max {(maxVideoSize / (1024 * 1024)).toFixed(0)}MB • 
            Max {maxFiles} files
          </p>
        </div>
      </div>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((fileData) => (
            <div
              key={fileData.id}
              className="relative group bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-all duration-200"
            >
              {/* Preview */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {fileData.isImage && (
                  <img
                    src={fileData.preview}
                    alt={fileData.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {fileData.isVideo && (
                  <div className="relative w-full h-full">
                    <video
                      src={fileData.preview}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <PlayIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="p-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                  {fileData.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(fileData.size)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(fileData.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              {/* Media Type Badge */}
              <div className="absolute top-2 left-2">
                {fileData.isImage ? (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                    Image
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                    Video
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Message */}
      {files.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          No files selected yet
        </p>
      )}
    </div>
  );
};

export default MediaUpload;
