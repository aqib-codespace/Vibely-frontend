"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Calendar } from "lucide-react";
import { stripHtml } from "@/utils/html-utils";

const VideosSearchResults = ({ videos = [] }) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No videos found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="space-y-3">
      {videos.map((video) => {
        const videoId = video._id;
        const title = video.title;
        const description = video.description;
        const views = video.views || 0;
        const likesCount = video.likesCount || 0;
        const createdAt = video.createdAt;
        const videoUrl = video.video?.url || "";
        const thumbnailUrl = video.video?.thumbnail || "/not-found.png";

        const creator = video.creator || {};
        const creatorName = `${creator.firstName || ""} ${
          creator.lastName || ""
        }`.trim();
        const creatorUsername = creator.userName;
        const creatorImage = creator.profilePicture?.url || "/avatar.webp";

        return (
          <Link
            key={videoId}
            href={`/watch-videos/${videoId}`}
            className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex gap-3">
              <div className="relative h-20 w-32 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-white/80 flex items-center justify-center">
                    <div className="h-0 w-0 border-l-[7px] border-l-gray-800 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-0.5"></div>
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                  {Math.floor(views / 1000)}K
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-medium line-clamp-2">{title}</h4>
                {description && (
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {stripHtml(description)}
                  </p>
                )}

                <div className="flex items-center mt-1.5 justify-between">
                  <div className="flex items-center">
                    <div className="relative h-4 w-4 rounded-full overflow-hidden">
                      <Image
                        src={creatorImage}
                        alt={creatorName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="ml-1.5 text-xs text-gray-500">
                      {creatorName}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    <span>{views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    <span>{likesCount.toLocaleString()}</span>
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

export default VideosSearchResults;
