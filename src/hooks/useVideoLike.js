"use client";
import { useCallback } from "react";
import { toggleVideoLikesApi } from "@/app/api/vidoes";
import { throttle } from "lodash";
import toast from "react-hot-toast";

export const useVideoLike = (setVideos, currentUserId) => {
  const handleVideoLike = useCallback(
    throttle(async (videoId, isLiked) => {
      // Prevent multiple simultaneous calls for the same video
      const requestKey = `video_like_${videoId}`;
      if (window.activeRequests && window.activeRequests.has(requestKey)) {
        console.log("Request already in progress for video:", videoId);
        return;
      }

      // Track active requests
      if (!window.activeRequests) {
        window.activeRequests = new Set();
      }
      window.activeRequests.add(requestKey);

      try {
        console.log(`${isLiked ? "Unliking" : "Liking"} video:`, videoId);

        // Make API call (optimistic update is handled in the component)
        const response = await toggleVideoLikesApi(videoId);

        if (response && !response.error) {
          console.log("Successfully toggled video like:", videoId);

          // Update the videos list if setVideos is provided
          if (setVideos) {
            setVideos((prevVideos) => {
              return prevVideos.map((video) => {
                if (video._id === videoId || video.id === videoId) {
                  const currentLikes = Array.isArray(video.likes)
                    ? video.likes
                    : [];
                  const newLikes = isLiked
                    ? currentLikes.filter((likeId) => likeId !== currentUserId)
                    : [...currentLikes, currentUserId];

                  return {
                    ...video,
                    likes: newLikes,
                    likesCount: newLikes.length,
                  };
                }
                return video;
              });
            });
          }
        } else {
          throw new Error(response?.message || "Failed to toggle video like");
        }
      } catch (error) {
        console.error("Error toggling video like:", error);
        toast.error(`Failed to ${isLiked ? "unlike" : "like"} video`);
        throw error; // Re-throw so component can handle rollback
      } finally {
        // Remove from active requests
        window.activeRequests.delete(requestKey);
        console.log("Removed video like request from queue for:", videoId);
      }
    }, 500), // 500ms throttle to prevent rapid clicks
    [setVideos, currentUserId]
  );

  return handleVideoLike;
};
