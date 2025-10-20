"use client";

import React from "react";

const Loader = ({ size = "md", variant = "default", className = "" }) => {
  let sizeClass = "";

  switch (size) {
    case "xs":
      sizeClass = "w-4 h-4";
      break;
    case "sm":
      sizeClass = "w-6 h-6";
      break;
    case "md":
      sizeClass = "w-8 h-8";
      break;
    case "lg":
      sizeClass = "w-10 h-10";
      break;
    case "xl":
      sizeClass = "w-12 h-12";
      break;
    default:
      sizeClass = "w-8 h-8";
  }

  if (variant === "threeDot") {
    return (
      <div className={`flex gap-1 ${className}`}>
        <div
          className={`animate-bounce ${sizeClass} rounded-full bg-blue-500 mx-1`}
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className={`animate-bounce ${sizeClass} rounded-full bg-blue-500 mx-1`}
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className={`animate-bounce ${sizeClass} rounded-full bg-blue-500 mx-1`}
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClass} ${className}`}
    ></div>
  );
};

export default Loader;
