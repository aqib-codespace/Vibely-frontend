import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import clsx from "clsx";
import { removeChatWallpaperApi } from "@/app/api/chat";

const PREDEFINED_WALLPAPERS = [
  "/wallpapers/bg-1.jpg",
  "/wallpapers/bg-2.jpg",
  "/wallpapers/bg.png",
  "/wallpapers/bg-3.jpg",
];

const PREDEFINED_GRADIENTS = [
  {
    id: "g2",
    css: "linear-gradient(135deg, #000428, #004e92)",
    label: "Deep Space",
  },
  {
    id: "g3",
    css: "linear-gradient(135deg, #141E30, #243B55)",
    label: "Dark Horizon",
  },
  {
    id: "g4",
    css: "linear-gradient(135deg, #200122, #6f0000)",
    label: "Crimson Night",
  },
  {
    id: "g5",
    css: "linear-gradient(135deg, #000000, #434343)",
    label: "Carbon",
  },
  {
    id: "g6",
    css: "linear-gradient(135deg, #FF0099, #493240)",
    label: "Neon Rose",
  },
  {
    id: "g7",
    css: "linear-gradient(135deg, #8E2DE2, #4A00E0)",
    label: "Purple Neon",
  },
  {
    id: "g8",
    css: "linear-gradient(135deg, #00c6ff, #0072ff)",
    label: "Electric Blue",
  },
  {
    id: "g9",
    css: "linear-gradient(135deg, #ff6a00, #ee0979)",
    label: "Neon Sunset",
  },
  {
    id: "g10",
    css: "linear-gradient(135deg, #00F260, #0575E6)",
    label: "Cyber Green",
  },
];

export default function WallpaperSelector({
  initialWallpaper = null,
  onPreview,
  onClose,
  handleResetWallpaper,
}) {
  const [tab, setTab] = useState("wallpapers");
  const [selectedWallpaper, setSelectedWallpaper] = useState(
    initialWallpaper || null
  );
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedGradient, setSelectedGradient] = useState(null);

  useEffect(() => {
    setSelectedWallpaper(initialWallpaper || null);
    setSelectedGradient(null);
    setUploadedFile(null);
  }, [initialWallpaper]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const previewUrl = URL.createObjectURL(file);
      setUploadedFile(file);
      setSelectedWallpaper(previewUrl);
      setSelectedGradient(null);
      onPreview?.({ type: "wallpaper", value: previewUrl, file });
      onClose?.();
    },
    [onPreview, onClose]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSelectPredefined = (url) => {
    setUploadedFile(null);
    setSelectedWallpaper(url);
    setSelectedGradient(null);
    onPreview?.({ type: "wallpaper", value: url });
    onClose?.();
  };

  const handleSelectGradient = (gradCss) => {
    setSelectedGradient(gradCss);
    setSelectedWallpaper(null);
    setUploadedFile(null);

    onPreview?.({ type: "color", value: gradCss });
    onClose?.();
  };

  const handlePreviewClick = () => {
    if (uploadedFile && selectedWallpaper) {
      onPreview?.({
        type: "wallpaper",
        value: selectedWallpaper,
        file: uploadedFile,
      });
      onClose?.();
      return;
    }
    if (selectedWallpaper) {
      onPreview?.({ type: "wallpaper", value: selectedWallpaper });
      onClose?.();
      return;
    }
    if (selectedGradient) {
      onPreview?.({ type: "color", value: selectedGradient });
      onClose?.();
      return;
    }
  };

  return (
    <div className="p-4 flex flex-col">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("wallpapers")}
          className={clsx(
            "flex-1 cursor-pointer py-2 rounded text-sm font-medium",
            tab === "wallpapers" ? "bg-blue-600 text-white" : "bg-gray-100"
          )}
        >
          Wallpapers
        </button>
        <button
          onClick={() => setTab("colors")}
          className={clsx(
            "flex-1 py-2 cursor-pointer  rounded text-sm font-medium",
            tab === "colors" ? "bg-blue-600 text-white" : "bg-gray-100"
          )}
        >
          Colors
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-4">
        {tab === "wallpapers" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {PREDEFINED_WALLPAPERS.map((url) => (
                <div
                  key={url}
                  className={clsx(
                    "rounded overflow-hidden border-2 cursor-pointer transition-all",
                    selectedWallpaper === url
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-transparent hover:border-gray-300"
                  )}
                  onClick={() => handleSelectPredefined(url)}
                >
                  <img
                    src={url}
                    alt="Wallpaper"
                    className="w-full h-28 object-cover"
                  />
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Or upload your own</h3>
              {!uploadedFile ? (
                <div
                  {...getRootProps()}
                  className="p-5 border-2 border-dashed rounded cursor-pointer text-center text-gray-500 hover:border-blue-400"
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <MdCloudUpload className="text-3xl" />
                    <p className="text-sm">Click or drag an image to upload</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedWallpaper}
                    alt="uploaded"
                    className="w-full h-36 object-cover rounded"
                  />
                  <button
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                    onClick={() => {
                      setUploadedFile(null);
                      setSelectedWallpaper(null);
                    }}
                  >
                    <MdDelete className="text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "colors" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {PREDEFINED_GRADIENTS.map((g) => (
                <div
                  key={g.id}
                  className={clsx(
                    "h-20 rounded cursor-pointer border-2",
                    selectedGradient === g.css
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-transparent hover:border-gray-300"
                  )}
                  style={{ background: g.css }}
                  onClick={() => handleSelectGradient(g.css)}
                  title={g.label}
                />
              ))}
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">
                Custom color
              </label>
              <input
                type="color"
                value={
                  selectedGradient && selectedGradient.startsWith("#")
                    ? selectedGradient
                    : "#ffffff"
                }
                onChange={(e) => {
                  setSelectedGradient(e.target.value);
                  setSelectedWallpaper(null);
                  setUploadedFile(null);
                }}
                className="w-full h-12 rounded cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                Pick a solid color (will be used as background).
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={handleResetWallpaper}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Reset Wallpaper
        </button>

        <button
          onClick={handlePreviewClick}
          disabled={!selectedWallpaper && !selectedGradient && !uploadedFile}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Preview
        </button>
      </div>
    </div>
  );
}
