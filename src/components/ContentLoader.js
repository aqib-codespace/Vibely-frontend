"use client";

import React from "react";
import Loader from "@/components/ui/loader";

export const ContentLoader = ({ message = "Loading content..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <Loader className="border-blue-500" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default ContentLoader;
