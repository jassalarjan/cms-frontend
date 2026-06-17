// Cloudinary Upload Utility
// Handles file uploads to Cloudinary with size validation

const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Validate file size based on file type
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export const validateFileSize = (file) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  if (isImage && file.size > IMAGE_MAX_SIZE) {
    return {
      valid: false,
      error: `Image size must be less than 10MB. Current size: ${formatFileSize(file.size)}`
    };
  }
  
  if (isVideo && file.size > VIDEO_MAX_SIZE) {
    return {
      valid: false,
      error: `Video size must be less than 100MB. Current size: ${formatFileSize(file.size)}`
    };
  }
  
  return { valid: true };
};

/**
 * Upload file to Cloudinary via backend proxy
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Upload result
 */
export const uploadToCloudinary = async (file, onProgress) => {
  try {
    // Validate file size first
    const validation = validateFileSize(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // Determine resource type
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    formData.append('resource_type', resourceType);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send request to backend upload endpoint
      xhr.open('POST', '/api/upload');
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {File[]} files - Files to upload
 * @param {Function} onProgress - Progress callback for each file
 * @returns {Promise<Object[]>} - Upload results
 */
export const uploadMultipleFiles = async (files, onProgress) => {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const result = await uploadToCloudinary(file, (progress) => {
        if (onProgress) {
          onProgress(i, progress, file.name);
        }
      });
      
      results.push({
        success: true,
        file: file.name,
        url: result.data.url,
        publicId: result.data.public_id,
        resourceType: result.data.resource_type,
        format: result.data.format,
        size: result.data.bytes,
        width: result.data.width,
        height: result.data.height,
        duration: result.data.duration // For videos
      });
    } catch (error) {
      results.push({
        success: false,
        file: file.name,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image/video)
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const response = await fetch('/api/upload/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Delete failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type limits
 * @returns {Object} - Size limits
 */
export const getFileSizeLimits = () => ({
  image: {
    maxSize: IMAGE_MAX_SIZE,
    maxSizeFormatted: '10 MB'
  },
  video: {
    maxSize: VIDEO_MAX_SIZE,
    maxSizeFormatted: '100 MB'
  }
});

/**
 * Check if file is an image
 * @param {File} file - File to check
 * @returns {boolean}
 */
export const isImage = (file) => file.type.startsWith('image/');

/**
 * Check if file is a video
 * @param {File} file - File to check
 * @returns {boolean}
 */
export const isVideo = (file) => file.type.startsWith('video/');
