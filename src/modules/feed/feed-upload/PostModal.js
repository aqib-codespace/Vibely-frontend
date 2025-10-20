'use client";';
import React, { useState, useRef, useEffect } from "react";
import { Avatar } from "rizzui";
import { RxCross2 } from "react-icons/rx";
import { actionButtons } from "./action-btns";
import { CreatePostApi } from "@/app/api/feedApis";
import EmojiPicker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import RichTextEditor from "@/components/tiptap-editor/tiptap";

export default function PostModal({
  open,
  onClose,
  onSubmit,
  user,
  initialContent = "",
  initialMedia = [],
  isEditMode = false,
  FetchAllFeeds,
}) {
  const [content, setContent] = useState(initialContent);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState(initialMedia);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (isEditMode) {
      setContent(initialContent || "");
      setExistingMedia(initialMedia || []);
      setUploadedFiles([]);
    }
  }, [initialContent, initialMedia, isEditMode, open]);

  if (!open) return null;

  const handleActionClick = (label) => {
    if (label === "Image / Videos" && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (label === "Mention") {
      if (editorRef.current?.insertMention) {
        editorRef.current.insertMention();
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => {
      const allFiles = [...prev, ...files].slice(0, 4);
      return allFiles;
    });
    e.target.value = "";
  };

  const handleRemoveFile = (idx) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleRemoveExistingMedia = (idx) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !content.trim() &&
      uploadedFiles.length === 0 &&
      existingMedia.length === 0
    ) {
      setError("Please add some content or media.");
      return;
    }

    setLoading(true);

    if (isEditMode) {
      try {
        if (onSubmit) {
          await onSubmit(content, uploadedFiles, existingMedia);
        }
        FetchAllFeeds && FetchAllFeeds();
        if (onClose) onClose();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to update post.");
      } finally {
        setLoading(false);
      }
    } else {
      const formData = new FormData();
      formData.append("content", content);
      uploadedFiles.forEach((file) => {
        formData.append("media", file);
      });
      try {
        await CreatePostApi(formData);
        setContent("");
        setUploadedFiles([]);
        FetchAllFeeds && FetchAllFeeds();
        if (onClose) onClose();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to create post.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/40 bg-opacity-90">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
        <button
          className="absolute cursor-pointer top-7 right-7 bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <RxCross2 />
        </button>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 mb-4">
            {user ? (
              <Avatar
                src={user.profilePicture?.url || user.avatar || "/avatar.webp"}
                name={
                  user.name ||
                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  "User"
                }
                className="border"
              />
            ) : (
              <Avatar src="/avatar.webp" name="User" />
            )}
            <div>
              <div className="font-semibold text-gray-800">
                {user?.name ||
                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  "User"}
              </div>
            </div>
          </div>
          <div className="w-full rounded p-3 mb-2 bg-gray-50">
            <RichTextEditor
              content={content}
              setContent={setContent}
              ref={editorRef}
            />

            <div className="mb-2 justify-end flex items-center gap-2">
              <button
                type="button"
                className="emoji-btn text-2xl cursor-pointer text-yellow-500 bg-yellow-100 rounded-full p-1 hover:bg-yellow-200"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                disabled={loading}
                aria-label="Show emoji picker"
              >
                <MdEmojiEmotions className="" />
              </button>
              {showEmojiPicker && (
                <div className="absolute w-full max-w-md z-50 mt-2">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setContent((prev) => prev + emojiData.emoji);
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
            {isEditMode && existingMedia.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-4 justify-start items-center max-h-40 overflow-y-auto">
                {existingMedia.map((media, idx) => (
                  <div key={media._id || idx} className="relative group">
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={media.name || "media"}
                        className="w-56 h-32 object-cover rounded border shadow"
                      />
                    ) : media.type === "video" ? (
                      <video
                        src={media.url}
                        controls
                        className="w-56 h-32 object-cover rounded border shadow"
                      />
                    ) : null}
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-gray-100 rounded-full p-1 shadow text-gray-700 hover:text-red-600"
                      onClick={() => handleRemoveExistingMedia(idx)}
                      title="Remove"
                      disabled={loading}
                    >
                      <RxCross2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-4 justify-start items-center max-h-40 overflow-y-auto">
                {uploadedFiles.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative group">
                      {file.type.startsWith("image") ? (
                        <img
                          src={url}
                          alt={file.name}
                          className="w-56 h-32 object-cover rounded border shadow"
                        />
                      ) : file.type.startsWith("video") ? (
                        <video
                          src={url}
                          controls
                          className="w-56 h-32 object-cover rounded border shadow"
                        />
                      ) : null}
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-gray-100 rounded-full p-1 shadow text-gray-700 hover:text-red-600"
                        onClick={() => handleRemoveFile(idx)}
                        title="Remove"
                        disabled={loading}
                      >
                        <RxCross2 />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
          <div className="post-action-row flex gap-6 mb-4">
            {actionButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                className="action-btn flex items-center cursor-pointer gap-1 text-gray-600 px-3 py-2 rounded hover:bg-gray-100 transition"
                onClick={() => handleActionClick(btn.label)}
                disabled={loading}
              >
                {React.createElement(btn.icon, {
                  size: 20,
                  style: btn.iconColor ? { color: btn.iconColor } : undefined,
                })}
                {btn.label}
              </button>
            ))}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,video/*"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-gray-800 cursor-pointer text-white px-6 w-full py-2 rounded font-semibold shadow hover:bg-gray-900 transition"
              disabled={loading}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Sharing..."
                : isEditMode
                ? "Update Post"
                : "Share Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
