import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters.js';

const FileUploader = ({
  onFileSelect,
  accept = { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
  maxSize = 10 * 1024 * 1024, // 10MB
  label = 'Drop your resume here or click to browse',
  sublabel = 'Supports PDF, DOC, DOCX (Max 10MB)',
  uploading = false,
  progress = 0,
  uploaded = false,
  className = '',
}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected.length) {
      const err = rejected[0]?.errors[0];
      if (err?.code === 'file-too-large') setError('File is too large. Max 10MB allowed.');
      else if (err?.code === 'file-invalid-type') setError('Invalid file type. Use PDF, DOC, or DOCX.');
      else setError('File upload failed. Please try again.');
      return;
    }
    if (accepted[0]) {
      setFile(accepted[0]);
      onFileSelect?.(accepted[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError('');
    onFileSelect?.(null);
  };

  return (
    <div className={className}>
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-200 hover:border-primary/50 bg-slate-50/50 hover:bg-primary/2'}
          ${file || uploaded ? 'border-accent bg-accent/5' : ''}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {uploaded || (file && !uploading) ? (
            <motion.div key="uploaded" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                <CheckCircle size={28} className="text-accent" />
              </div>
              <div>
                <p className="font-semibold text-text">{file?.name || 'File uploaded'}</p>
                {file && <p className="text-sm text-text-muted mt-1">{formatFileSize(file.size)}</p>}
              </div>
              <button onClick={removeFile} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                <X size={12} /> Remove file
              </button>
            </motion.div>
          ) : uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <File size={28} className="text-primary" />
              </div>
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-light font-medium">{file?.name}</span>
                  <span className="text-primary font-semibold">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
              <motion.div
                animate={isDragActive ? { scale: 1.2 } : { scale: 1 }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                <Upload size={28} />
              </motion.div>
              <div>
                <p className="font-semibold text-text">{isDragActive ? 'Release to upload' : label}</p>
                <p className="text-sm text-text-muted mt-1">{sublabel}</p>
              </div>
              {!isDragActive && (
                <span className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium">Browse Files</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {error && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-2 font-medium">
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FileUploader;
