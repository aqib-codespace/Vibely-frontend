"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Plus, Video, X, FileVideo, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import videoUploadSchema from "@/validations/video-upload-schema";
import { uploadVideo } from "@/app/api/vidoes";
import { toast } from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import RichTextEditor from "@/components/tiptap-editor/tiptap";

const VideoUpload = ({ refreshVideos, open, setOpen }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [formStep, setFormStep] = useState(0);
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!uploading) {
      setUploadProgress(0);
    }
  }, [uploading]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(videoUploadSchema),
    defaultValues: {
      title: "",
      tags: "",
    },
  });

  const handleUpload = useCallback(
    async (formData) => {
      if (files.length === 0) return;

      try {
        setUploading(true);
        const videoData = {
          ...formData,
          file: files[0],
        };

        console.log("Uploading video with data:", videoData);

        const response = await uploadVideo(videoData, (progress) => {
          setUploadProgress(Math.min(progress * 0.9, 90));
        });

        setUploadProgress(90);

        if (typeof toast !== "undefined") {
          toast.success("Video uploaded successfully!");
        } else {
          console.log("Video uploaded successfully!");
        }

        setFiles([]);
        setFormStep(0);
        setContent("");
        reset();

        setUploadProgress(100);

        setTimeout(() => {
          setOpen(false);
          setPreviewVideo(null);
          setUploading(false);
          setUploadProgress(0);

          if (refreshVideos && typeof refreshVideos === "function") {
            refreshVideos();
          }
        }, 500);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [files, reset, refreshVideos, setOpen]
  );

  const toggleVideoPreview = useCallback(
    (file) => {
      if (previewVideo && previewVideo.file === file) {
        setPreviewVideo(null);
      } else {
        const videoUrl = URL.createObjectURL(file);
        setPreviewVideo({ file, url: videoUrl });
      }
    },
    [previewVideo]
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      const videoFiles = acceptedFiles.filter((file) =>
        file.type.startsWith("video/")
      );

      if (videoFiles.length > 0) {
        setFiles([videoFiles[0]]);
        toggleVideoPreview(videoFiles[0]);
      }
      setDragActive(false);
    },
    [toggleVideoPreview]
  );

  const removeFile = (index) => {
    const fileToRemove = files[index];

    setFiles((files) => files.filter((_, i) => i !== index));
    if (previewVideo && previewVideo.file === fileToRemove) {
      setPreviewVideo(null);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    maxFiles: 1,
    multiple: false,
  });

  const handleSelectFiles = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            setFormStep(0);
            setContent("");
            setShowEmojiPicker(false);
            reset();
          }
          setOpen(value);
        }}
      >
        <DialogContent
          className={cn(
            "bg-gray-100 text-gray-800 border-none p-0 flex flex-col md:flex-row overflow-hidden",
            previewVideo ? "sm:max-w-5xl" : "sm:max-w-md md:max-w-xl"
          )}
        >
          <div className={cn("p-4", previewVideo ? "flex-1" : "w-full")}>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">
                {formStep === 0 ? "Upload Video" : "Video Details"}
              </DialogTitle>
            </DialogHeader>

            {formStep === 0 ? (
              <div className="my-6">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all duration-300",
                    dragActive
                      ? "border-gray-600 bg-gray-500/10"
                      : "border-gray-600 hover:border-gray-600 hover:bg-gray-200"
                  )}
                >
                  <input {...getInputProps()} ref={inputRef} />

                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-gray-800 rounded-full">
                      <FileVideo className="h-8 w-8 text-white" />
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium">
                        Drag and drop a video file to upload
                      </h3>
                      <p className="text-sm text-gray-500">
                        Only one video can be uploaded at a time
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSelectFiles}
                      className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-800 rounded-md text-sm font-medium transition-colors"
                    >
                      Select video
                    </button>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium">Selected video</h4>
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className={cn(
                            "flex items-center justify-between rounded-md bg-gray-200 p-3",
                            previewVideo?.file === file &&
                              "ring-2 ring-gray-800 bg-gray-100"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Video className="h-5 w-5 text-gray-800" />
                            <div className="truncate max-w-[200px]">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => toggleVideoPreview(file)}
                              className={cn(
                                "p-1.5 rounded-full mr-2 text-gray-800 transition-colors",
                                previewVideo?.file === file
                                  ? "bg-gray-200 text-gray-800"
                                  : "hover:bg-gray-200 hover:text-gray-800"
                              )}
                              title={
                                previewVideo?.file === file
                                  ? "Hide preview"
                                  : "Preview video"
                              }
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1.5 rounded-full hover:bg-red-200 text-gray-800 hover:text-red-800 transition-colors"
                              title="Remove video"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(handleUpload)}
                className="my-6 space-y-5"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register("title")}
                    placeholder="Enter video title"
                    className={cn(
                      "block w-full rounded border border-gray-300 bg-white px-3 py-2   sm:text-sm",
                      errors.title &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full rounded p-3 bg-gray-50 border border-gray-300">
                    <RichTextEditor content={content} setContent={setContent} />

                    <div className="mt-2 justify-end flex items-center gap-2">
                      <button
                        type="button"
                        className="emoji-btn text-2xl cursor-pointer text-yellow-500 bg-yellow-100 rounded-full p-1 hover:bg-yellow-200"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        disabled={uploading}
                        aria-label="Show emoji picker"
                      >
                        <MdEmojiEmotions />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute w-full max-w-md z-50 mt-2">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              const updatedContent = content + emojiData.emoji;
                              setContent(updatedContent);
                              setShowEmojiPicker(false);
                            }}
                            width="100%"
                            height="200px"
                            searchDisabled
                            skinTonesDisabled
                            previewConfig={{ showPreview: false }}
                            lazyLoadEmojis
                          />
                          <button
                            className="absolute cursor-pointer -top-1 -right-1 bg-gray-100 p-1 rounded-full text-red-400 hover:text-red-600"
                            onClick={() => setShowEmojiPicker(false)}
                            aria-label="Close"
                          >
                            <RxCross2 />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {content.length < 10 && (
                    <p className="text-sm text-red-500 mt-1">
                      Description must be at least 10 characters
                    </p>
                  )}
                </div>
              </form>
            )}

            <DialogFooter className="flex justify-between sm:justify-between gap-2">
              {formStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setFormStep(0)}
                  disabled={uploading}
                  className="w-full sm:w-auto px-4 py-2 bg-transparent border border-gray-600 rounded-md text-sm font-medium transition-colors hover:bg-gray-200"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setFiles([]);
                    reset();
                    setContent("");
                    setFormStep(0);
                    setPreviewVideo(null);
                  }}
                  disabled={uploading}
                  className={cn(
                    "w-full sm:w-auto px-4 py-2 bg-transparent border border-gray-600 rounded-md text-sm font-medium transition-colors",
                    uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-200"
                  )}
                >
                  Cancel
                </button>
              )}

              {formStep === 0 ? (
                <button
                  type="button"
                  onClick={() => files.length > 0 && setFormStep(1)}
                  disabled={files.length === 0 || uploading}
                  className={cn(
                    "w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    files.length === 0 || uploading
                      ? "bg-gray-800 text-gray-100 cursor-not-allowed opacity-70"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  )}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    console.log("Current content before submit:", content);
                    console.log("Content length:", content.length);
                    handleSubmit((formData) => {
                      const dataWithDescription = {
                        ...formData,
                        description: content,
                      };
                      console.log(
                        "Form data being submitted:",
                        dataWithDescription
                      );
                      handleUpload(dataWithDescription);
                    })();
                  }}
                  disabled={uploading || content.length < 10}
                  className={cn(
                    "w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    uploading || content.length < 10
                      ? "bg-gray-800 text-gray-100 cursor-not-allowed opacity-70"
                      : "bg-gray-800 hover:bg-gray-900 text-white"
                  )}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              )}
            </DialogFooter>
          </div>

          {previewVideo && (
            <div className="flex-1 bg-gray-100 flex flex-col transition-all">
              <div className=" flex flex-col justify-center items-center h-full p-5">
                <div className="flex-1 flex items-center justify-center bg-gray-100">
                  <video
                    src={previewVideo.url}
                    controls
                    controlsList="nodownload"
                    className="max-w-full rounded-lg max-h-[500px] object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoUpload;
