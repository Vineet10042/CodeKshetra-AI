import { useParams, NavLink } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient'

function AdminUpload() {

  const { problemId } = useParams();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  // Upload video
  const onSubmit = async (data) => {
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      if (uploadMode === 'link') {
        const metadataResponse = await axiosClient.post('/video/save', {
          problemId: problemId,
          secureUrl: data.youtubeLink,
          isYouTube: true,
          duration: 0
        });

        setUploadedVideo(metadataResponse.data.videoSolution);
        reset(); 
      } else {
        const file = data.videoFile[0];
      // Step 1: Get upload signature from backend
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Step 2: Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      // Step 3: Upload directly to Cloudinary
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Save video metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

        setUploadedVideo(metadataResponse.data.videoSolution);
        reset(); // Reset form after successful upload
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.error || err.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm border-b px-4 mb-4">
        <NavLink to="/" className="btn btn-ghost text-xl">CodeKshetra AI</NavLink>
      </div>
      <div className="max-w-md mx-auto p-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Upload Video</h2>

            <div className="tabs tabs-boxed mb-6 justify-center">
              <a 
                className={`tab ${uploadMode === 'file' ? 'tab-active' : ''}`} 
                onClick={() => { setUploadMode('file'); clearErrors(); }}
              >
                Upload File
              </a>
              <a 
                className={`tab ${uploadMode === 'link' ? 'tab-active' : ''}`} 
                onClick={() => { setUploadMode('link'); clearErrors(); }}
              >
                YouTube Link
              </a>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {uploadMode === 'file' ? (
                <>
                  {/* File Input */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Choose video file</span>
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      {...register('videoFile', {
                        required: uploadMode === 'file' ? 'Please select a video file' : false,
                        validate: {
                          isVideo: (files) => {
                            if (uploadMode !== 'file') return true;
                            if (!files || !files[0]) return 'Please select a video file';
                            const file = files[0];
                            return file.type.startsWith('video/') || 'Please select a valid video file';
                          },
                          fileSize: (files) => {
                            if (uploadMode !== 'file') return true;
                            if (!files || !files[0]) return true;
                            const file = files[0];
                            const maxSize = 100 * 1024 * 1024; // 100MB
                            return file.size <= maxSize || 'File size must be less than 100MB';
                          }
                        }
                      })}
                      className={`file-input file-input-bordered w-full ${errors.videoFile ? 'file-input-error' : ''}`}
                      disabled={uploading}
                    />
                    {errors.videoFile && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.videoFile.message}</span>
                      </label>
                    )}
                  </div>
                </>
              ) : (
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Paste YouTube Link</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register('youtubeLink', {
                      required: uploadMode === 'link' ? 'Please enter a YouTube link' : false,
                      pattern: {
                        value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
                        message: 'Please enter a valid YouTube link'
                      }
                    })}
                    className={`input input-bordered w-full ${errors.youtubeLink ? 'input-error' : ''}`}
                    disabled={uploading}
                  />
                  {errors.youtubeLink && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.youtubeLink.message}</span>
                    </label>
                  )}
                </div>
              )}

              {/* Selected File Info */}
              {uploadMode === 'file' && selectedFile && (
                <div className="alert alert-info">
                  <div>
                    <h3 className="font-bold">Selected File:</h3>
                    <p className="text-sm">{selectedFile.name}</p>
                    <p className="text-sm">Size: {formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={uploadProgress}
                    max="100"
                  ></progress>
                </div>
              )}

              {/* Error Message */}
              {errors.root && (
                <div className="alert alert-error">
                  <span>{errors.root.message}</span>
                </div>
              )}

              {/* Success Message */}
              {uploadedVideo && (
                <div className="alert alert-success">
                  <div>
                    <h3 className="font-bold">Upload Successful!</h3>
                    <p className="text-sm">Duration: {formatDuration(uploadedVideo.duration)}</p>
                    <p className="text-sm">Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="card-actions justify-end">
                <button
                  type="submit"
                  disabled={uploading}
                  className={`btn btn-primary ${uploading ? 'loading' : ''}`}
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}


export default AdminUpload;