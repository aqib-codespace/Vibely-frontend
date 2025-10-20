import { fetchVideoById } from "@/app/api/vidoes";
import React, { useEffect, useState } from "react";
import VideoCards from "./video-cards";

const SingleVideoView = ({ id }) => {
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideoData = async (videoId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchVideoById(videoId);
      setVideoData(response.data);
    } catch (error) {
      console.error("Error fetching video data:", error);
      setError("Failed to load video data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVideoData(id);
    }
  }, [id]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading video...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <>
      {videoData ? (
        <div className="p-4 mt-24">
          <VideoCards videos={[videoData]} />
        </div>
      ) : (
        <div className="p-4 text-center">No video found</div>
      )}
    </>
  );
};

export default SingleVideoView;
