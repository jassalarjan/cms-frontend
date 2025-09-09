import React, { useState, useCallback, useRef } from 'react';
import { 
  DocumentIcon, 
  PhotoIcon, 
  XMarkIcon, 
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FileUpload = ({ 
  onFilesChange, 
  maxFiles = 5, 
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  multiple = true,
  className = ""
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Max size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return type === fileExtension;
      } else if (type.includes('/*')) {
        const baseType = type.split('/')[0];
        return mimeType.startsWith(baseType);
      } else {
        return mimeType === type;
      }
    });

    if (!isValidType) {
      return `File ${file.name} is not a valid type. Accepted types: ${acceptedTypes.join(', ')}`;
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
          validFiles.push({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            status: 'ready'
          });
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id) => {
    const updatedFiles = files.filter(file => file.id !== id);
    
    // Revoke object URLs to prevent memory leaks
    const fileToRemove = files.find(file => file.id === id);
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return PhotoIcon;
    return DocumentIcon;
  };

  const clearAll = () => {
    // Revoke all object URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    onFilesChange([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : files.length > 0
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleChange}
          accept={acceptedTypes.join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
            dragActive ? 'bg-blue-100' : files.length > 0 ? 'bg-green-100' : 'bg-gray-200'
          }`}>
            {dragActive ? (
              <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
            ) : files.length > 0 ? (
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            ) : (
              <CloudArrowUpIcon className="h-8 w-8 text-gray-500" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {dragActive
                ? 'Drop files here'
                : files.length > 0
                ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                : 'Drop files here or click to browse'
              }
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {multiple && `Up to ${maxFiles} files, `}
              max {(maxSize / (1024 * 1024)).toFixed(1)}MB each
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported: {acceptedTypes.join(', ')}
            </p>
          </div>

          {files.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="btn-secondary btn-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Selected Files</h4>
            <span className="text-sm text-gray-500">{files.length} of {maxFiles}</span>
          </div>
          
          <div className="grid gap-3">
            {files.map((fileObj) => {
              const FileIcon = getFileIcon(fileObj.type);
              
              return (
                <div
                  key={fileObj.id}
                  className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0 mr-4">
                    {fileObj.preview ? (
                      <img
                        src={fileObj.preview}
                        alt={fileObj.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileObj.size)} • {fileObj.type || 'Unknown type'}
                    </p>
                    
                    {/* Status */}
                    <div className="mt-1">
                      {fileObj.status === 'ready' && (
                        <span className="inline-flex items-center text-xs text-green-600">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Ready to upload
                        </span>
                      )}
                      {fileObj.status === 'uploading' && (
                        <span className="inline-flex items-center text-xs text-blue-600">
                          <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full mr-1"></div>
                          Uploading...
                        </span>
                      )}
                      {fileObj.status === 'error' && (
                        <span className="inline-flex items-center text-xs text-red-600">
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Upload failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                      title="Remove file"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
            <span className="text-sm font-medium text-blue-900">Uploading files...</span>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '45%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
