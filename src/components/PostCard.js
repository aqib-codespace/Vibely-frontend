"use client";
import React, { useState, useEffect } from "react";
import CustomVideoPlayer from "./video-player";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { CgComment } from "react-icons/cg";
import { PiShareFat } from "react-icons/pi";
import { useSelector } from "react-redux";

const MediaGallery = ({ media, isMobile, openImageModal }) => {
  if (media.length === 1) {
    return (
      <div className="relative w-full">
        {media[0].type === "image" ? (
          <div
            className="relative w-full aspect-[4/3] max-h-[500px] overflow-hidden rounded-lg border border-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openImageModal(media, 0)}
          >
            <img
              src={media[0].url}
              alt="Post media"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video max-h-[400px] overflow-hidden rounded-lg border border-gray-100">
            <CustomVideoPlayer src={media[0].url} />
          </div>
        )}
      </div>
    );
  }

  if (media.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 h-[300px] sm:h-[350px]">
        {media.map((item, index) => (
          <div
            key={item._id}
            className="relative overflow-hidden rounded-lg border border-gray-100"
          >
            {item.type === "image" ? (
              <div
                className="w-full h-full cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => openImageModal(media, index)}
              >
                <img
                  src={item.url}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-full h-full">
                <CustomVideoPlayer src={item.url} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (media.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 h-[300px] sm:h-[350px]">
        <div className="relative overflow-hidden rounded-lg border border-gray-100">
          {media[0].type === "image" ? (
            <div
              className="w-full h-full cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openImageModal(media, 0)}
            >
              <img
                src={media[0].url}
                alt="Post media 1"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-full">
              <CustomVideoPlayer src={media[0].url} />
            </div>
          )}
        </div>

        <div className="grid grid-rows-2 gap-1">
          {media.slice(1, 3).map((item, index) => (
            <div
              key={item._id}
              className="relative overflow-hidden rounded-lg border border-gray-100"
            >
              {item.type === "image" ? (
                <div
                  className="w-full h-full cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => openImageModal(media, index + 1)}
                >
                  <img
                    src={item.url}
                    alt={`Post media ${index + 2}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-full">
                  <CustomVideoPlayer src={item.url} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (media.length >= 4) {
    const visibleMedia = isMobile ? media.slice(0, 4) : media.slice(0, 4);
    const remainingCount = media.length - visibleMedia.length;

    return (
      <div className="grid grid-cols-2 gap-1 h-[300px] sm:h-[350px]">
        {visibleMedia.map((item, index) => (
          <div
            key={item._id}
            className="relative overflow-hidden rounded-lg border border-gray-100"
          >
            {item.type === "image" ? (
              <div
                className="relative w-full h-full cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => openImageModal(media, index)}
              >
                <img
                  src={item.url}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {index === visibleMedia.length - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      +{remainingCount} more
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full">
                <CustomVideoPlayer src={item.url} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const ImageModal = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[99999] flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white text-xl sm:text-2xl hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {images && images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl sm:text-4xl hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all hover:bg-opacity-70"
            >
              ❮
            </button>
            <button
              onClick={onNext}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl sm:text-4xl hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all hover:bg-opacity-70"
            >
              ❯
            </button>
          </>
        )}

        <div className="flex items-center justify-center w-full h-full px-12 sm:px-16 py-16">
          {images && images[currentIndex] && (
            <img
              src={images[currentIndex].url}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>

        {images && images.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm sm:text-base bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentIndex + 1} of {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, onLikeToggle = null }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [isMobile, setIsMobile] = useState(false);
  const [imageModal, setImageModal] = useState({
    open: false,
    images: [],
    currentIndex: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openImageModal = (images, index = 0) => {
    setImageModal({
      open: true,
      images: images.filter((item) => item.type === "image"),
      currentIndex: index,
    });
  };

  const closeImageModal = () => {
    setImageModal({ open: false, images: [], currentIndex: 0 });
  };

  const nextImage = () => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const prevImage = () => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0
          ? prev.images.length - 1
          : prev.currentIndex - 1,
    }));
  };

  const { user, content, media, likes, createdAt } = post;
  const profilePic = user?.profilePicture?.url || "/avatar.webp";
  const fullName = user?.firstName + " " + user?.lastName || "Unknown User";
  const likeCount = likes?.length || 0;
  const isLikedByCurrentUser =
    currentUser && likes?.some((like) => like._id === currentUser?._id);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLikeClick = () => {
    if (onLikeToggle) {
      onLikeToggle(post._id, isLikedByCurrentUser);
    }
  };

  return (
    <div className="bg-white rounded-xl z-[999999999] border shadow p-4 mb-6">
      <ImageModal
        isOpen={imageModal.open}
        images={imageModal.images}
        currentIndex={imageModal.currentIndex}
        onClose={closeImageModal}
        onNext={nextImage}
        onPrev={prevImage}
      />

      <div className="flex items-center mb-3">
        <img
          src={profilePic}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover mr-3 border"
        />
        <div>
          <div className="font-semibold text-gray-800">{fullName}</div>
          <div className="text-xs text-gray-500">{formatDate(createdAt)}</div>
        </div>
      </div>

      <div
        className="mb-3 prose max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {media && media.length > 0 && (
        <div className="mb-3">
          <MediaGallery
            media={media}
            isMobile={isMobile}
            openImageModal={openImageModal}
          />
        </div>
      )}

      <div className="flex items-center px-2 justify-between text-gray-500 text-sm border-t pt-3">
        <div className="flex items-center gap-3">
          <div
            onClick={handleLikeClick}
            className={`${
              isLikedByCurrentUser ? "text-red-500" : "hover:text-red-500"
            } cursor-pointer`}
          >
            {isLikedByCurrentUser ? (
              <FaHeart className="h-4 w-4" />
            ) : (
              <FaRegHeart className="h-4 w-4" />
            )}
          </div>
          <span className="hover:text-blue-500 cursor-pointer">
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CgComment />
          <span className="hover:text-blue-500 cursor-pointer">Comments</span>
        </div>
        <div className="flex items-center gap-2">
          <PiShareFat />
          <span className="hover:text-blue-500 cursor-pointer">Share</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
