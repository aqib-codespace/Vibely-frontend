"use client";
import React, { useMemo, useRef, useState } from "react";
import CustomVideoPlayer from "@/components/video-player";
import { Share2, ThumbsUp, UserPlus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toggleVideoSaveApi } from "@/app/api/vidoes";
import Link from "next/link";
import {
  MdBookmark,
  MdDeleteOutline,
  MdOutlineBookmarkBorder,
  MdOutlineEdit,
} from "react-icons/md";
import ShareModal from "./share-modal";
import { ActionIcon, Dropdown } from "rizzui";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { useVideoLike } from "@/hooks/useVideoLike";

const VideoCard = ({ video, handleDelete, setVideos }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Use the centralized video like hook
  const handleVideoLike = useVideoLike(setVideos, currentUser._id);

  const hasUserLikedVideo = useMemo(() => {
    if (!currentUser || !currentUser._id || !Array.isArray(video.likes)) {
      return false;
    }
    return video.likes.includes(currentUser._id);
  }, [video.likes, currentUser]);

  const hasUserSavedVideo = useMemo(() => {
    if (!currentUser || !currentUser._id || !Array.isArray(video.isSaved)) {
      return false;
    }
    return video.isSaved.includes(currentUser._id);
  }, [video.isSaved, currentUser]);

  const [isLiked, setIsLiked] = useState(hasUserLikedVideo);
  const [likesCount, setLikesCount] = useState(
    Array.isArray(video.likes) ? video.likes.length : 0
  );
  const [showFullDescription, setShowFullDescription] = useState(false);
  const videoRef = useRef(null);
  const [save, setSave] = useState(hasUserSavedVideo);
  const [showShareModal, setShowShareModal] = useState(false);

  const normalizedVideo = {
    id: video._id || video.id || "",
    videoUrl: video.video || video.videoUrl || video.url || "",
    caption: video.title || video.caption || "",
    views: video.views || "0",
    postedAt: video.createdAt || video.postedAt || new Date(),
    user: {
      id:
        (video.userId && video.userId._id) ||
        (video.user && video.user.id) ||
        "unknown",
      name:
        (video.userId &&
          video.userId.firstName &&
          video.userId.lastName &&
          `${video.userId.firstName} ${video.userId.lastName}`) ||
        "User",
      avatar:
        (video.userId &&
          video.userId.profilePicture &&
          video.userId.profilePicture.url) ||
        video.userAvatar ||
        (video.user && video.user.avatar) ||
        "/avatar.webp",
      isFriend: video.isFriend || (video.user && video.user.isFriend) || false,
      email: (video.userId && video.userId.email) || "",
    },
    likesData: video.likes || [],
    saveData: Array.isArray(video.isSaved) ? video.isSaved : [],
    description: video.description || "",
  };

  const handleLike = async () => {
    const currentLikedState = isLiked;
    const currentLikesCount = likesCount;

    try {
      const newLikedState = !isLiked;
      const newLikesCount = likesCount + (newLikedState ? 1 : -1);

      // Optimistic update
      setIsLiked(newLikedState);
      setLikesCount(newLikesCount);

      // Use the centralized hook
      await handleVideoLike(normalizedVideo.id, currentLikedState);
    } catch (error) {
      // Rollback on error
      setIsLiked(currentLikedState);
      setLikesCount(currentLikesCount);
      console.error("Error toggling video like:", error);
    }
  };
  const handleSave = async () => {
    try {
      const newSaveState = !save;
      setSave(newSaveState);

      const response = await toggleVideoSaveApi(normalizedVideo.id);

      if (!response || response.error) {
        setSave(!newSaveState);
        console.error("API error:", response?.error || "Unknown error");
      }
    } catch (error) {
      setSave(!save);
      console.error("Error toggling video save:", error);
    }
  };

  const stripHtml = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const truncateText = (text, limit) => {
    const plainText = stripHtml(text);
    if (plainText.length <= limit) return plainText;
    return showFullDescription ? plainText : `${plainText.slice(0, limit)}...`;
  };

  const formattedTimeAgo = formatDistanceToNow(
    typeof normalizedVideo.postedAt === "string"
      ? new Date(normalizedVideo.postedAt)
      : normalizedVideo.postedAt,
    { addSuffix: true }
  );

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0">
            <Link href={`/profile/${normalizedVideo.user.id}`}>
              <img
                src={normalizedVideo.user.avatar}
                alt={normalizedVideo.user.name}
                className="rounded-full border w-full h-full object-cover"
              />
            </Link>
          </div>

          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {normalizedVideo.user.name}
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formattedTimeAgo}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          {!normalizedVideo.user.isFriend &&
            normalizedVideo.user.id !== currentUser?._id &&
            video.userId?._id !== currentUser?._id && (
              <motion.button
                className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 text-gray-800 text-xs sm:text-sm font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus size={16} className="hidden sm:inline" />
                <span>Add Friend</span>
              </motion.button>
            )}
          {/* Only show edit/delete options to the video owner */}
          {(normalizedVideo.user.id === currentUser?._id ||
            video.userId?._id === currentUser?._id) && (
            <div className="ml-auto text-gray-700 bg-gray-100 p-1 rounded-lg cursor-pointer">
              <Dropdown placement="bottom-end">
                <Dropdown.Trigger>
                  <ActionIcon
                    variant="outline"
                    className={` border-none  cursor-pointer`}
                    rounded="full"
                  >
                    <HiOutlineDotsHorizontal className="h-5 w-5" />
                  </ActionIcon>
                </Dropdown.Trigger>
                <Dropdown.Menu className="border-none shadow w-44 bg-gray-50 ">
                  <div className="my-2 border-b">
                    <Dropdown.Item>
                      <div
                        // onClick={() => setEditModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-gray-100 rounded-md cursor-pointer"
                      >
                        <MdOutlineEdit className="h-4 w-4 text-gray-500" />
                        Edit
                      </div>
                    </Dropdown.Item>
                  </div>
                  <div className="my-2">
                    <Dropdown.Item>
                      <div
                        onClick={() => {
                          setDeleteModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-gray-100 rounded-md cursor-pointer text-red-600"
                      >
                        <MdDeleteOutline className="h-4 w-4 text-red-500" />
                        Delete
                      </div>
                    </Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 sm:px-4 pb-3">
        <h2 className="font-medium text-gray-900 mb-1.5 text-sm sm:text-base">
          {normalizedVideo.caption}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
          {truncateText(normalizedVideo.description, 120)}
          {stripHtml(normalizedVideo.description).length > 120 && (
            <button
              className="ml-1 text-gray-800  font-medium"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? "Show less" : "Read more"}
            </button>
          )}
        </p>
      </div>

      <div className="relative bg-black w-full">
        <CustomVideoPlayer src={normalizedVideo.videoUrl} />
      </div>

      <div className="p-2 sm:p-4 flex items-center justify-between flex-wrap sm:flex-nowrap gap-1 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors",
            isLiked
              ? "bg-gray-100 text-blue-600 "
              : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300"
          )}
        >
          <ThumbsUp size={16} fill={isLiked ? "currentColor" : "none"} />
          <span className="font-medium text-xs sm:text-sm">{likesCount}</span>
        </button>

        <button
          onClick={handleSave}
          className={cn(
            "flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors",
            save
              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400"
              : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300"
          )}
        >
          {save ? (
            <MdBookmark size={20} />
          ) : (
            <MdOutlineBookmarkBorder size={20} />
          )}
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
        >
          <Share2 size={16} />
          <span className="font-medium text-xs sm:text-sm">
            {normalizedVideo.shares}
          </span>
        </button>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoId={normalizedVideo.id}
        title={normalizedVideo.caption}
        description={normalizedVideo.description}
      />
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          handleDelete(normalizedVideo.id);
          setDeleteModalOpen(false);
        }}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </motion.div>
  );
};

const VideoCards = ({ videos = [], handleDeleteVideo, setVideos }) => {
  console.log("Rendering VideoCards with videos:", videos);
  return (
    <div className="mx-auto md:px-4">
      <div className="grid grid-cols-1  gap-4">
        {videos.map((video) => (
          <VideoCard
            key={video._id || video.id}
            video={video}
            handleDelete={handleDeleteVideo}
            setVideos={setVideos}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoCards;
