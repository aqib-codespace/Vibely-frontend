"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { highlightSearchTerms } from "@/utils/html-utils";

const PostsSearchResults = ({ posts = [], searchQuery = "" }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const postId = post._id;
        const content = post.content;
        const likesCount = post.likesCount || 0;
        const createdAt = post.createdAt;
        const hasMedia = post.media && post.media.length > 0;

        const author = post.author || {};
        const authorName = `${author.firstName || ""} ${
          author.lastName || ""
        }`.trim();
        const authorUsername = author.userName;
        const authorImage = author.profilePicture?.url || "/avatar.webp";

        return (
          <Link
            key={postId}
            href={`/post/${postId}`}
            className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center mb-1.5">
              <div className="relative h-6 w-6 rounded-full overflow-hidden">
                <Image
                  src={authorImage}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="ml-2 text-xs font-medium">{authorName}</span>
              <span className="mx-1 text-gray-400 text-xs">•</span>
              <span className="text-gray-400 text-xs">
                {formatDate(createdAt)}
              </span>
            </div>

            <div className="flex gap-3">
              {hasMedia && (
                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={post.media[0]?.url || "/not-found.png"}
                    alt="Post media"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <p className="text-sm line-clamp-2">
                  {highlightSearchTerms(content, searchQuery)}
                </p>

                <div className="flex items-center gap-4 mt-1.5">
                  <div className="flex items-center text-xs text-gray-500">
                    <Heart className="h-3 w-3 mr-1" />
                    <span>{likesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PostsSearchResults;
