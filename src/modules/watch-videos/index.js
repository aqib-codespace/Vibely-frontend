"use client";
import React, { useEffect, useState, useCallback } from "react";
import VideoUpload from "./video-upload";
import VideoCards from "./video-cards";
import { fetchAllVideos, deleteVideoById } from "@/app/api/vidoes";
import InfiniteScroll from "react-infinite-scroll-component";
import { Button, Loader } from "rizzui";
import { PiVideo } from "react-icons/pi";
import VideoShare from "./video-share";

const VideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const videoShareRef = React.useRef(null);

  const fetchVideos = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);
      try {
        const response = await fetchAllVideos(pageNum, limit);

        if (pageNum === 1) {
          setVideos(response?.videos || []);
        } else {
          setVideos((prev) => [...prev, ...(response?.videos || [])]);
        }

        setTotalPages(response.totalPages || 0);
        setHasMore(pageNum < (response.totalPages || 0));
      } catch (error) {
        console.error("❌ Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  const fetchMoreData = useCallback(() => {
    if (page < totalPages && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(nextPage);
    } else {
      setHasMore(false);
    }
  }, [page, totalPages, isLoading, fetchVideos]);

  const refreshVideos = useCallback(() => {
    setPage(1);
    fetchVideos(1);
  }, [fetchVideos]);

  useEffect(() => {
    fetchVideos(1);
  }, [fetchVideos]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setShowStickyHeader(!entry.isIntersecting);
    }, options);

    if (videoShareRef.current) {
      observer.observe(videoShareRef.current);
    }

    return () => {
      if (videoShareRef.current) {
        observer.unobserve(videoShareRef.current);
      }
    };
  }, []);

  const handleDeleteVideo = async (videoId) => {
    try {
      await deleteVideoById(videoId);
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video._id !== videoId)
      );
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  return (
    <div className="relative min-h-screen  " id="video-scroll">
      {/* <div
        className={`sticky -top-1  z-30 mx-4 rounded-b-lg  bg-white border-b  transition-all duration-300 transform ${
          showStickyHeader
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-3 ">
          <h1 className="text-2xl font-medium">Videos for you</h1>
          <Button
            size="lg"
            className="text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-sm"
            onClick={() => setUploadModalOpen(true)}
          >
            Create New Post
          </Button>
        </div>
      </div> */}

      <div className="mx-auto">
        <div ref={videoShareRef} className="">
          <VideoShare onOpenUploadModal={() => setUploadModalOpen(true)} />
        </div>

        {isLoading && videos.length === 0 ? (
          <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-lg shadow bg-white py-6 mb-6">
            <Loader variant="threeDot" size="sm" className="text-gray-500" />
            <p className="text-gray-600 text-sm font-medium">
              Loading videos...
            </p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center min-h-[60vh] flex flex-col items-center justify-center py-6 bg-white rounded-lg shadow text-gray-600 mb-6">
            <div className="bg-gray-100 w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full">
              <PiVideo className="h-8 w-8 text-gray-800" />
            </div>
            <p className="text-lg font-semibold">No videos available.</p>
            <p className="text-sm mt-1">
              Be the first to upload a video and be part of the community!
            </p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={videos.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-lg shadow bg-white py-6 mb-6">
                <Loader
                  variant="threeDot"
                  size="sm"
                  className="text-gray-800"
                />
                <p className="text-gray-600 text-sm font-medium">
                  Loading more videos...
                </p>
              </div>
            }
            endMessage={
              videos.length > 0 &&
              page > 1 &&
              !hasMore &&
              !isLoading && (
                <div className="text-center py-6 bg-white rounded-lg shadow text-gray-600 mb-6">
                  <p className="text-lg font-semibold">
                    🎬 That is all the videos!
                  </p>
                  <p className="text-sm mt-1">
                    Check back later for more content or upload your own.
                  </p>
                </div>
              )
            }
            scrollThreshold={0.8}
            scrollableTarget="video-scroll"
          >
            <VideoCards
              videos={videos}
              handleDeleteVideo={handleDeleteVideo}
              setVideos={setVideos}
            />
          </InfiniteScroll>
        )}
      </div>

      <VideoUpload
        refreshVideos={refreshVideos}
        open={uploadModalOpen}
        setOpen={setUploadModalOpen}
      />
    </div>
  );
};

export default VideoSection;
