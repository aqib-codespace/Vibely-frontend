"use client";
import { getPostsByUserIdApi, deletePostApi } from "@/app/api/feedApis";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ProfileHeader } from "./profile-header";
import InfiniteScroll from "react-infinite-scroll-component";
import { ActionIcon, Dropdown, Loader } from "rizzui";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import toast from "react-hot-toast";
import PostModal from "../feed/feed-upload/PostModal";
import { updateFeedPostApi } from "@/app/api/feedApis";
import ContentLoader from "@/components/ContentLoader";
import { usePostLike } from "@/hooks/usePostLike";

const ProfilePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  // Use the centralized post like hook
  const handlePostLike = usePostLike(setPosts, user._id);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPostData, setEditPostData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);

  const fetchPosts = async (pageNum = 1) => {
    if (!user || !user.id) return;

    try {
      setLoading(pageNum === 1);
      const response = await getPostsByUserIdApi(user.id, pageNum, limit);

      if (pageNum === 1) {
        setPosts(response?.feeds || []);
      } else {
        setPosts((prev) => [...prev, ...(response?.feeds || [])]);
      }

      setTotalPages(response.totalPages || 1);
      setHasMore(pageNum < (response.totalPages || 1));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const fetchMoreData = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [user]);

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
      fetchPosts(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update post");
    }
  };

  const HandleDelete = async () => {
    if (!deletePostId) return;
    setDeleteLoading(true);
    try {
      await deletePostApi(deletePostId);
      toast.success("Post deleted successfully");
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== deletePostId)
      );
      setDeleteModalOpen(false);
      setDeletePostId(null);
    } catch (error) {
      toast.error("Failed to delete post");
      console.error("Error deleting post:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <ProfileHeader
        title={`${user.firstName} ${user.lastName}`}
        description={user.bio}
        profilePicture={user?.profilePicture?.url}
        showUploadOnHover={true}
      >
        <div className="pb-4 sm:pb-8 mt-4 sm:mt-8 min-h-screen">
          {loading && page === 1 ? (
            <ContentLoader message="Loading your posts..." />
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-10 bg-gray-50 rounded-xl border border-gray-100 mx-2 sm:mx-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 font-medium text-base sm:text-lg px-4 text-center">
                You have not posted anything yet.
              </p>
              <p className="text-gray-500 mt-1 text-sm sm:text-base px-4 text-center">
                Share your thoughts or photos with your friends!
              </p>
            </div>
          ) : (
            <div
              id="postsScrollContainer"
              className="overflow-y-auto px-2 sm:pr-2"
            >
              <InfiniteScroll
                dataLength={posts.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={
                  <div className="text-center py-4 flex justify-center">
                    <Loader
                      variant="threeDot"
                      size="sm"
                      className="text-blue-500"
                    />
                  </div>
                }
                endMessage={
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm font-medium">
                      That is all of your posts!
                    </p>
                  </div>
                }
                scrollableTarget="postsScrollContainer"
              >
                <div className="flex flex-col gap-4">
                  {posts.map((post) => (
                    <div key={post._id} className="relative">
                      <PostCard post={post} onLikeToggle={handlePostLike} />

                      {post.user?._id === user.id && (
                        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                          <Dropdown
                            className="z-10"
                            trigger={
                              <ActionIcon
                                size="sm"
                                variant="text"
                                className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200"
                              >
                                <BsThreeDotsVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                              </ActionIcon>
                            }
                          >
                            <div className="p-1 min-w-[140px]">
                              <button
                                onClick={() => {
                                  setEditPostData(post);
                                  setEditModalOpen(true);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-100 rounded-md text-left"
                              >
                                <MdOutlineEdit className="h-4 w-4 text-gray-500" />
                                Edit Post
                              </button>
                              <button
                                onClick={() => {
                                  setDeletePostId(post._id);
                                  setDeleteModalOpen(true);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs sm:text-sm hover:bg-gray-100 rounded-md text-left"
                              >
                                <MdDeleteOutline className="h-4 w-4 text-red-500" />
                                Delete Post
                              </button>
                            </div>
                          </Dropdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            </div>
          )}
        </div>
      </ProfileHeader>

      {editModalOpen && (
        <PostModal
          modalOpen={editModalOpen}
          setModalOpen={setEditModalOpen}
          isEdit={true}
          editData={editPostData}
          SubmitHandler={SubmitHandler}
        />
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Delete Post
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletePostId(null);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={HandleDelete}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Loader
                      size="sm"
                      variant="spinnerDot"
                      className="text-white"
                    />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePosts;
