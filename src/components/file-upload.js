import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const getPreview = (file) => {
  const url = URL.createObjectURL(file);
  if (file.type.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={file.name}
        className="max-w-full max-h-52 rounded shadow"
      />
    );
  }
  if (file.type.startsWith("video/")) {
    return (
      <video
        src={url}
        controls
        className="max-w-full max-h-52 rounded shadow"
      />
    );
  }
  return <span className="text-sm text-gray-700">{file.name}</span>;
};

export default function FileUpload({ onFiles }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles(acceptedFiles);
      if (onFiles) onFiles(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? "bg-gray-100 border-blue-400"
            : "bg-white border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500 font-semibold">Drop the files here ...</p>
        ) : (
          <p className="text-gray-600">
            Drag & drop files here, or click to select files
          </p>
        )}
      </div>
      <div className="mt-4 flex gap-4 flex-wrap">
        {files.map((file) => (
          <div key={file.name} className="min-w-[120px]">
            {getPreview(file)}
          </div>
        ))}
      </div>
    </div>
  );
}
