"use client";
import { getPostByIdApi } from "@/app/api/feedApis";
import Header from "@/app/layout/header";
import PostCard from "@/components/PostCard";
import FeedPostCard from "@/modules/feed/feed-view/post-card";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const PostPage = () => {
  const { id } = useParams();
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPostData = async () => {
      setLoading(true);
      try {
        const response = await getPostByIdApi(id);
        setPostData(response.feed);
      } catch (error) {
        console.error("Error fetching post data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  return (
    <>
      <Header />
      <div className="mt-28 mx-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading post...</div>
          </div>
        ) : postData ? (
          <PostCard post={postData} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">
              Post not found or could not be loaded
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PostPage;
