"use client";
import { useCallback } from "react";
import { likePostApi, UnLikePostApi } from "@/app/api/feedApis";
import { throttle } from "lodash";
import toast from "react-hot-toast";

export const usePostLike = (setPosts, currentUserId) => {
  const handlePostLike = useCallback(
    throttle(async (postId, isLiked) => {
      // Prevent multiple simultaneous calls for the same post
      const requestKey = `like_${postId}`;
      if (window.activeRequests && window.activeRequests.has(requestKey)) {
        console.log("Request already in progress for post:", postId);
        return;
      }

      // Track active requests
      if (!window.activeRequests) {
        window.activeRequests = new Set();
      }
      window.activeRequests.add(requestKey);

      try {
        console.log(`${isLiked ? "Unliking" : "Liking"} post:`, postId);

        // Optimistic update
        setPosts((prevPosts) => {
          const updatedPosts = prevPosts.map((post) => {
            if (post._id === postId) {
              if (isLiked) {
                return {
                  ...post,
                  likes: post.likes.filter(
                    (like) => like._id !== currentUserId
                  ),
                };
              } else {
                if (!post.likes.some((like) => like._id === currentUserId)) {
                  return {
                    ...post,
                    likes: [...post.likes, { _id: currentUserId }],
                  };
                }
              }
            }
            return post;
          });
          return updatedPosts;
        });

        // Make API call
        if (isLiked) {
          await UnLikePostApi(postId);
          console.log("Successfully unliked post:", postId);
        } else {
          await likePostApi(postId);
          console.log("Successfully liked post:", postId);
        }
      } catch (error) {
        console.error("Error toggling post like:", error);
        toast.error(`Failed to ${isLiked ? "unlike" : "like"} post`);

        // Rollback optimistic update on error
        setPosts((prevPosts) => {
          const rollbackPosts = prevPosts.map((post) => {
            if (post._id === postId) {
              if (isLiked) {
                // Add the like back
                if (!post.likes.some((like) => like._id === currentUserId)) {
                  return {
                    ...post,
                    likes: [...post.likes, { _id: currentUserId }],
                  };
                }
              } else {
                // Remove the like
                return {
                  ...post,
                  likes: post.likes.filter(
                    (like) => like._id !== currentUserId
                  ),
                };
              }
            }
            return post;
          });
          return rollbackPosts;
        });
      } finally {
        // Remove from active requests
        window.activeRequests.delete(requestKey);
        console.log("Removed request from queue for post:", postId);
      }
    }, 500), // 500ms throttle to prevent rapid clicks
    [setPosts, currentUserId]
  );

  return handlePostLike;
};
