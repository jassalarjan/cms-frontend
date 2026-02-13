import React, { useState } from 'react';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Modal from './Modal';

const MediaViewer = ({ attachments = [], className = "", onDelete = null, allowDelete = false }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [deleting, setDeleting] = useState(null);

  if (!attachments || attachments.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <DocumentIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No attachments</p>
      </div>
    );
  }

  const isImage = (mimeType) => {
    return mimeType?.startsWith('image/');
  };

  const isVideo = (mimeType) => {
    return mimeType?.startsWith('video/');
  };

  const getFileIcon = (mimeType) => {
    if (isImage(mimeType)) return PhotoIcon;
    if (isVideo(mimeType)) return VideoCameraIcon;
    return DocumentIcon;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleMediaClick = (attachment) => {
    if (isImage(attachment.mime_type) || isVideo(attachment.mime_type)) {
      setSelectedMedia(attachment);
      setShowLightbox(true);
    } else {
      // For other file types, download
      window.open(attachment.file_path, '_blank');
    }
  };

  const handleDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_path;
    link.download = attachment.original_name || attachment.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (e, attachment) => {
    e.stopPropagation();
    
    if (!onDelete) return;
    
    if (!window.confirm(`Are you sure you want to delete "${attachment.original_name || attachment.filename}"?`)) {
      return;
    }
    
    setDeleting(attachment.id);
    
    try {
      await onDelete(attachment.id);
    } catch (error) {
      console.error('Error deleting attachment:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {attachments.map((attachment) => {
          const Icon = getFileIcon(attachment.mime_type);
          
          return (
            <div
              key={attachment.id}
              className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => handleMediaClick(attachment)}
            >
              {/* Thumbnail or Preview */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {isImage(attachment.mime_type) ? (
                  <img
                    src={attachment.file_path}
                    alt={attachment.original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : isVideo(attachment.mime_type) ? (
                  <>
                    <video
                      src={attachment.file_path}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <VideoCameraIcon className="h-12 w-12 text-white" />
                    </div>
                  </>
                ) : (
                  <Icon className="h-12 w-12 text-gray-400" />
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    {(isImage(attachment.mime_type) || isVideo(attachment.mime_type)) && (
                      <span className="text-white text-sm font-medium">View</span>
                    )}
                  </div>
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" title={attachment.original_name}>
                      {attachment.original_name || attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(attachment.file_size)}
                    </p>
                    {attachment.uploaded_by_name && (
                      <p className="text-xs text-gray-400 mt-1">
                        By: {attachment.uploaded_by_name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(attachment);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    {allowDelete && onDelete && (
                      <button
                        onClick={(e) => handleDelete(e, attachment)}
                        disabled={deleting === attachment.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        {deleting === attachment.id ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal for Images and Videos */}
      <Modal
        isOpen={showLightbox}
        onClose={() => {
          setShowLightbox(false);
          setSelectedMedia(null);
        }}
        title={selectedMedia?.original_name || selectedMedia?.filename}
        size="4xl"
      >
        {selectedMedia && (
          <div className="space-y-4">
            {/* Media Display */}
            <div className="bg-black rounded-lg flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '70vh' }}>
              {isImage(selectedMedia.mime_type) ? (
                <img
                  src={selectedMedia.file_path}
                  alt={selectedMedia.original_name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : isVideo(selectedMedia.mime_type) ? (
                <video
                  src={selectedMedia.file_path}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </div>

            {/* File Info */}
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">File name:</span>
                <p className="font-medium text-gray-900 mt-1">{selectedMedia.original_name || selectedMedia.filename}</p>
              </div>
              <div>
                <span className="text-gray-600">File size:</span>
                <p className="font-medium text-gray-900 mt-1">{formatFileSize(selectedMedia.file_size)}</p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium text-gray-900 mt-1">{selectedMedia.mime_type}</p>
              </div>
              {selectedMedia.uploaded_by_name && (
                <div>
                  <span className="text-gray-600">Uploaded by:</span>
                  <p className="font-medium text-gray-900 mt-1">{selectedMedia.uploaded_by_name}</p>
                </div>
              )}
              {selectedMedia.created_at && (
                <div>
                  <span className="text-gray-600">Uploaded:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {new Date(selectedMedia.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        <Modal.Footer>
          <button
            onClick={() => handleDownload(selectedMedia)}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={() => {
              setShowLightbox(false);
              setSelectedMedia(null);
            }}
            className="btn-primary"
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MediaViewer;
