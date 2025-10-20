"use client";
import Header from "@/app/layout/header";
import SingleVideoView from "@/modules/watch-videos/videoById";
import { useParams } from "next/navigation";
import React from "react";

const VideoDetailPage = () => {
  const { id } = useParams();
  return (
    <>
      <Header />
      <SingleVideoView id={id} />
    </>
  );
};

export default VideoDetailPage;
