"use client";
import { getPostsByUserIdApi } from "@/app/api/feedApis";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ProfileHeader } from "./profile-header";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "rizzui";
import { RxCross2 } from "react-icons/rx";
import ContentLoader from "@/components/ContentLoader";

const ProfilePhotos = () => {
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const user = useSelector((state) => state.auth.user);

  const fetchPosts = async (pageNum = 1) => {
    if (!user || !user.id) return;

    try {
      setLoading(pageNum === 1);
      const response = await getPostsByUserIdApi(user.id, pageNum, limit);

      let newPosts;
      if (pageNum === 1) {
        newPosts = response?.feeds || [];
        setPosts(newPosts);
      } else {
        newPosts = response?.feeds || [];
        setPosts((prev) => [...prev, ...newPosts]);
      }

      const extractedPhotos = [];
      newPosts.forEach((post) => {
        if (post.media && post.media.length > 0) {
          post.media.forEach((media) => {
            if (media.type === "image") {
              extractedPhotos.push({
                ...media,
                postId: post._id,
                createdAt: post.createdAt,
                user: post.user,
                content: post.content,
              });
            }
          });
        }
      });

      if (pageNum === 1) {
        setPhotos(extractedPhotos);
      } else {
        setPhotos((prev) => [...prev, ...extractedPhotos]);
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
    });
  };

  return (
    <>
      <ProfileHeader
        title={`${user?.firstName || ""} ${user?.lastName || ""}`}
        description={user?.bio || ""}
        profilePicture={user?.profilePicture?.url}
        showUploadOnHover={true}
      >
        <div className="pb-4 sm:pb-8 min-h-screen px-2 sm:px-0">
          <div className="flex items-center mb-4 sm:mb-6">
            <span className="bg-blue-50 text-blue-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 mt-2 sm:mt-4 rounded-sm">
              {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
            </span>
          </div>

          {loading && page === 1 ? (
            <ContentLoader message="Loading photos..." />
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-10 bg-gray-50 rounded-xl border border-gray-100">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 font-medium text-base sm:text-lg px-4 text-center">
                No photos to display
              </p>
              <p className="text-gray-500 mt-1 text-sm sm:text-base px-4 text-center">
                Photos from your posts will appear here
              </p>
            </div>
          ) : (
            <div id="photosScrollContainer" className="overflow-y-auto">
              <InfiniteScroll
                dataLength={photos.length}
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
                      That is all of your photos!
                    </p>
                  </div>
                }
                scrollableTarget="photosScrollContainer"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={`${photo._id || photo.public_id}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo.url}
                        alt="User photo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1 sm:p-2">
                        <p className="text-white text-xs">
                          {formatDate(photo.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            </div>
          )}
        </div>
      </ProfileHeader>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-gray-100 bg-opacity-75 z-[9999999] flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-lg sm:max-w-2xl md:max-w-4xl max-h-[95vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-full p-1 sm:p-2 shadow-md z-10"
              onClick={() => setSelectedPhoto(null)}
            >
              <RxCross2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center bg-black">
                <img
                  src={selectedPhoto.url}
                  alt="Full size photo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-3 sm:p-4 bg-white">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <img
                    src={
                      selectedPhoto.user?.profilePicture?.url || "/avatar.webp"
                    }
                    alt="Profile"
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-medium text-sm sm:text-base text-gray-800">
                      {selectedPhoto.user?.firstName}{" "}
                      {selectedPhoto.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(selectedPhoto.createdAt)}
                    </p>
                  </div>
                </div>
                {selectedPhoto.content && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <div
                      className="text-gray-700 prose prose-sm max-w-none text-xs sm:text-sm"
                      dangerouslySetInnerHTML={{
                        __html: selectedPhoto.content,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePhotos;
