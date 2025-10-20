"use client";
import React, { useEffect, useState } from "react";
import { ProfileHeader } from "./profile-header";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "rizzui";
import { fetchUsersSavedVideos } from "@/app/api/vidoes";
import ContentLoader from "@/components/ContentLoader";
import VideoCards from "../watch-videos/video-cards";

const ProfileSavedVideos = () => {
  const [savedVideos, setSavedVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const fetchUserVideos = async (pageNumber) => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const response = await fetchUsersSavedVideos(user._id, pageNumber, 10);
      if (response && response.videos) {
        if (pageNumber === 1) {
          setSavedVideos(response.videos);
        } else {
          setSavedVideos((prevVideos) => [...prevVideos, ...response.videos]);
        }
        setHasMore(pageNumber < response.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching user's saved videos:", error);
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserVideos(page);
  }, [page]);

  useEffect(() => {
    if (user?._id) {
      setPage(1);
      setSavedVideos([]);
      fetchUserVideos(1);
    }
  }, [user?._id]);
  const fetchMoreData = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <ProfileHeader
      title={`${user?.firstName || ""} ${user?.lastName || ""}`}
      description={user?.bio || ""}
      profilePicture={user?.profilePicture?.url}
      showUploadOnHover={true}
    >
      <div className="pb-8 mt-8 min-h-screen">
        {loading && page === 1 ? (
          <ContentLoader message="Loading your saved videos..." />
        ) : savedVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">
              You have not saved any videos yet
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Videos you save will appear here
            </p>
          </div>
        ) : (
          <div id="postsScrollContainer" className="overflow-y-auto pr-2">
            <InfiniteScroll
              dataLength={savedVideos.length}
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
                    {savedVideos.length > 0
                      ? "That is all of your saved videos!"
                      : "You have not saved any videos yet"}
                  </p>
                </div>
              }
              scrollableTarget="postsScrollContainer"
            >
              <div className="grid grid-cols-1  gap-4">
                <VideoCards videos={savedVideos} />
              </div>
            </InfiniteScroll>
          </div>
        )}
      </div>
    </ProfileHeader>
  );
};

export default ProfileSavedVideos;
