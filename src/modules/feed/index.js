"use client";
import React, { useEffect, useState, useCallback } from "react";
import PostShare from "./feed-upload/post-share";
import FeedPostCard from "./feed-view/post-card";
import { getAllPostsApi } from "@/app/api/feedApis";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "rizzui";
import { throttle } from "lodash";

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

const Feed = () => {
  const { isMobile, isTablet } = useResponsive();
  const [feedPosts, setFeedPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isMobile) {
      setLimit(5);
    } else if (isTablet) {
      setLimit(8);
    } else {
      setLimit(10);
    }
  }, [isMobile, isTablet]);

  const fetchAllFeeds = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        const response = await getAllPostsApi(pageNum, limit);

        const processedPosts = (response?.feeds || []).map((post) => {
          return post;
        });

        if (pageNum === 1) {
          setFeedPosts(processedPosts);
        } else {
          setFeedPosts((prev) => {
            const existingIds = new Set(prev.map((post) => post._id));
            const uniqueNewPosts = processedPosts.filter(
              (post) => !existingIds.has(post._id)
            );
            return [...prev, ...uniqueNewPosts];
          });
        }

        setTotalPages(response.totalPages || 0);
        setHasMore(pageNum < (response.totalPages || 0));
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const fetchMoreData = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllFeeds(nextPage);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchAllFeeds(1);
  }, [limit]);

  const refreshFeed = () => {
    setPage(1);
    fetchAllFeeds(1);
  };

  return (
    <>
      <div className="w-full max-w-full">
        <style jsx global>{`
          /* Clamp styles */
          .post-content.line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            max-height: 4.5em;
          }

          /* Default mobile styles */
          @media (max-width: 640px) {
            .post-content:not(.expanded) {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
              max-height: 4.5em;
            }
          }

          /* Expanded state - overrides any clamp */
          .post-content.expanded {
            display: block !important;
            -webkit-line-clamp: unset !important;
            max-height: none !important;
            overflow: visible !important;
          }

          /* Transition for smooth expansion/collapse */
          .post-content {
            transition: max-height 0.3s ease-out;
          }
        `}</style>
        <PostShare FetchAllFeeds={refreshFeed} />
        <div className={`mt-3 md:mt-4`} />
        <InfiniteScroll
          dataLength={feedPosts.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-lg shadow bg-white py-6">
              <Loader variant="threeDot" size="sm" className="text-gray-900" />
              <p className="text-gray-600 text-sm font-medium">
                Fetching the latest posts for you...
              </p>
            </div>
          }
          endMessage={
            feedPosts.length > 0 &&
            page > 1 &&
            !hasMore &&
            !loading && (
              <div className="text-center py-6 bg-white rounded-lg shadow text-gray-600">
                <p className="text-lg font-semibold">
                  🎉 You’re all caught up!
                </p>
                <p className="text-sm mt-1">
                  Add more friends or follow new people to see fresh posts.
                </p>
              </div>
            )
          }
          scrollThreshold={0.8}
          scrollableTarget="feed-scroll"
        >
          <FeedPostCard
            FetchAllFeeds={() => fetchAllFeeds(1)}
            setFeedPosts={setFeedPosts}
            feedPosts={feedPosts}
          />
        </InfiniteScroll>
      </div>
    </>
  );
};

export default Feed;
