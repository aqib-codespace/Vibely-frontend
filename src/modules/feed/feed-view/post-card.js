"use client";
import { deletePostApi } from "@/app/api/feedApis";
import React, { useState, useEffect } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import toast from "react-hot-toast";
import { ActionIcon, Dropdown } from "rizzui";
import PostModal from "../feed-upload/PostModal";
import { updateFeedPostApi } from "@/app/api/feedApis";
import { CgComment } from "react-icons/cg";
import { PiShareFat } from "react-icons/pi";
import ShareModal from "../share-modal";
import CustomVideoPlayer from "@/components/video-player";
import { usePostLike } from "@/hooks/usePostLike";
import { throttle } from "lodash";

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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white text-xl sm:text-2xl hover:text-gray-300 z-20 bg-black bg-opacity-50 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {/* Navigation buttons - positioned outside image area */}
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

        {/* Image container */}
        <div className="flex items-center justify-center w-full h-full px-12 sm:px-16 py-16">
          {images && images[currentIndex] && (
            <img
              src={images[currentIndex].url}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>

        {/* Image counter */}
        {images && images.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm sm:text-base bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentIndex + 1} of {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = throttle(() => {
      setWindowSize({
        width: window.innerWidth,
      });
    }, 200);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isMobile: windowSize.width < 640,
    isTablet: windowSize.width >= 640 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
  };
};

const FeedPostCard = ({ feedPosts, setFeedPosts, FetchAllFeeds }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const { isMobile, isTablet } = useResponsive();

  const handlePostLike = usePostLike(setFeedPosts, currentUser._id);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPostData, setEditPostData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePostData, setSharePostData] = useState(null);
  const [imageModal, setImageModal] = useState({
    open: false,
    images: [],
    currentIndex: 0,
  });

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

  const SubmitHandler = async (updatedContent, updatedFiles, existingMedia) => {
    try {
      const formData = new FormData();
      formData.append("content", updatedContent);
      formData.append(
        "mediaToKeep",
        JSON.stringify(
          existingMedia && existingMedia.length > 0
            ? existingMedia.map((m) => m.public_id)
            : []
        )
      );
      if (updatedFiles && updatedFiles.length > 0) {
        updatedFiles.forEach((file) => {
          formData.append("media", file);
        });
      }
      await updateFeedPostApi(editPostData._id, formData);
      toast.success("Post updated successfully");
      setEditModalOpen(false);
      setEditPostData(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update post");
    }
  };

  const HandleDelete = async () => {
    if (!deletePostId) return;
    setDeleteLoading(true);
    try {
      const response = await deletePostApi(deletePostId);
      toast.success(response?.message || "Post deleted successfully");
      setDeleteModalOpen(false);
      setDeletePostId(null);
      FetchAllFeeds();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <div>
      {editModalOpen && (
        <PostModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditPostData(null);
          }}
          FetchAllFeeds={FetchAllFeeds}
          onSubmit={SubmitHandler}
          user={editPostData?.user}
          initialContent={editPostData?.content}
          initialMedia={editPostData?.media}
          isEditMode={true}
        />
      )}

      <ImageModal
        isOpen={imageModal.open}
        images={imageModal.images}
        currentIndex={imageModal.currentIndex}
        onClose={closeImageModal}
        onNext={nextImage}
        onPrev={prevImage}
      />

      {shareModalOpen && sharePostData && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSharePostData(null);
          }}
          postId={sharePostData._id}
          content={sharePostData.content}
        />
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-400/50 bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center relative">
            <div className="flex flex-col items-center">
              <span className="bg-red-100 rounded-full p-3 mb-3">
                <MdDeleteOutline className="text-red-500 h-8 w-8" />
              </span>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                Delete Post?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className="flex gap-3 w-full justify-center">
                <button
                  className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeletePostId(null);
                  }}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 flex items-center justify-center min-w-[90px]"
                  onClick={HandleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <span className="loader border-white border-t-transparent">
                      Deleting...
                    </span>
                  ) : (
                    <>
                      <MdDeleteOutline className="mr-2 h-5 w-5" /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedPosts.map((post) => {
        const { user, content, media, likes, createdAt } = post;
        const profilePic = user?.profilePicture?.url;
        const fullName =
          user?.firstName + " " + user?.lastName || "Unknown User";
        const likeCount = likes?.length || 0;
        const isLikedByCurrentUser =
          currentUser && likes?.some((like) => like._id === currentUser._id);

        return (
          <div key={post._id} className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex items-center mb-3">
              <img
                src={profilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover mr-3 border"
              />
              <div>
                <div className="font-semibold text-gray-800">{fullName}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(createdAt)}
                </div>
              </div>
              {currentUser?._id === user?._id && (
                <div className="ml-auto text-gray-700  rounded-full cursor-pointer">
                  <Dropdown placement="bottom-end">
                    <Dropdown.Trigger>
                      <ActionIcon
                        variant="outline"
                        className=" border-none  cursor-pointer"
                        rounded="full"
                      >
                        <BsThreeDotsVertical className="h-5 w-5" />
                      </ActionIcon>
                    </Dropdown.Trigger>
                    <Dropdown.Menu className="divide-y">
                      <div className="my-2">
                        <Dropdown.Item>
                          <div
                            onClick={() => {
                              setEditPostData(post);
                              setEditModalOpen(true);
                            }}
                            className="flex items-center"
                          >
                            <MdOutlineEdit className="mr-2 h-4 w-4" />
                            Edit
                          </div>
                        </Dropdown.Item>
                      </div>

                      <div
                        onClick={() => {
                          setDeleteModalOpen(true);
                          setDeletePostId(post._id);
                        }}
                        className="mt-2 "
                      >
                        <Dropdown.Item>
                          <MdDeleteOutline className="mr-2 h-4 w-4" />
                          Delete
                        </Dropdown.Item>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              )}
            </div>
            {content && (
              <div className="mb-3">
                <div
                  className={`prose max-w-none text-gray-700 post-content ${
                    content.length > 150 ? "line-clamp-3" : ""
                  }`}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
                {content.length > 150 && (
                  <div className="mt-1">
                    <button
                      className="text-blue-500 text-sm font-medium"
                      onClick={(e) => {
                        const contentElement =
                          e.target.parentElement.previousElementSibling;
                        const isExpanded =
                          contentElement.classList.contains("expanded");

                        if (isExpanded) {
                          contentElement.classList.remove("expanded");
                          contentElement.classList.add("line-clamp-3");
                          e.target.textContent = "See more";
                        } else {
                          contentElement.classList.add("expanded");
                          contentElement.classList.remove("line-clamp-3");
                          e.target.textContent = "See less";
                        }
                      }}
                    >
                      See more
                    </button>
                  </div>
                )}
              </div>
            )}

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
                  onClick={() => handlePostLike(post._id, isLikedByCurrentUser)}
                  className={
                    isLikedByCurrentUser
                      ? "text-red-500 cursor-pointer"
                      : "hover:text-red-500 cursor-pointer"
                  }
                >
                  {isLikedByCurrentUser ? (
                    <FaHeart className="h-5 w-5" />
                  ) : (
                    <FaRegHeart className="h-5 w-5" />
                  )}
                </div>
                <span className="hover:text-blue-500 cursor-pointer">
                  <span className="hidden sm:inline">{likeCount} Likes</span>
                  <span className="sm:hidden">{likeCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CgComment className="h-5 w-5" />
                <span className="hover:text-blue-500 cursor-pointer hidden sm:inline">
                  Comments
                </span>
              </div>
              <div
                className="flex items-center gap-2 hover:text-blue-500 cursor-pointer"
                onClick={() => {
                  setSharePostData(post);
                  setShareModalOpen(true);
                }}
              >
                <PiShareFat className="h-5 w-5" />
                <span className="hidden sm:inline">Share</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeedPostCard;
