"use client";
import React, { useState, useEffect } from "react";
import { FaPlay } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const MediaGallery = ({ messages = [], selectedFriend, currentUser }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const extractMedia = () => {
      const media = [];

      messages.forEach((msg) => {
        if (msg.media || msg.file) {
          const fileData = msg.media || msg.file;

          const isImage =
            fileData.type?.startsWith("image/") ||
            fileData.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
          const isVideo =
            fileData.type?.startsWith("video/") ||
            fileData.url?.match(/\.(mp4|webm|avi|mov)$/i);

          if (isImage || isVideo) {
            const isUserMessage =
              msg.sender?._id === currentUser?._id || msg.sender === "user";

            media.push({
              id: msg._id || msg.id,
              type: isImage ? "image" : "video",
              url: fileData.url,
              name: fileData.name || "Media file",
              timestamp: msg.createdAt || msg.timestamp,
              sender: isUserMessage ? currentUser : selectedFriend,
              isUserMessage: isUserMessage,
            });
          }
        }
      });

      media.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setMediaFiles(media);
    };

    extractMedia();
  }, [messages, currentUser, selectedFriend]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openModal = (media) => {
    setSelectedMedia(media);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const navigateMedia = (direction) => {
    const currentIndex = mediaFiles.findIndex(
      (media) => media.id === selectedMedia.id
    );
    let newIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % mediaFiles.length;
    } else {
      newIndex = currentIndex === 0 ? mediaFiles.length - 1 : currentIndex - 1;
    }

    setSelectedMedia(mediaFiles[newIndex]);
  };

  if (mediaFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No Media Files</p>
          <p className="mt-2 text-sm">
            No images or videos have been shared in this chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white  rounded-lg overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaFiles.map((media) => (
            <div
              key={media.id}
              className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-200 bg-gray-100 pb-[100%] h-0"
              onClick={() => openModal(media)}
            >
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={media.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0">
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                      <FaPlay className="text-white h-7 w-7" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-gray-300 bg-opacity-40 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10"
              onClick={() => setSelectedMedia(null)}
            >
              <RxCross2 />
            </button>
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <div className="w-full h-[70vh] flex items-center justify-center bg-black">
                {selectedMedia.type === "image" ? (
                  <img
                    src={selectedMedia.url}
                    alt="Full size photo"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    className="max-w-full max-h-full"
                    controls
                    autoPlay
                  />
                )}
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={
                      selectedMedia.sender?.profilePicture?.url ||
                      "/avatar.webp"
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {selectedMedia.isUserMessage
                        ? "You"
                        : `${selectedMedia.sender?.firstName || ""} ${
                            selectedMedia.sender?.lastName || ""
                          }`.trim()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(selectedMedia.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
