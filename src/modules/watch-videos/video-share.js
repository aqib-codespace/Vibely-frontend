"use client";
import React from "react";
import { Avatar, Button, Input } from "rizzui";
import { useSelector } from "react-redux";
import { FileVideo } from "lucide-react";
import { IoIosSend } from "react-icons/io";

export default function VideoShare({ onOpenUploadModal }) {
  const user = useSelector((state) => state.auth.user);
  const fullName = user?.firstName + " " + user?.lastName || "";

  return (
    <div className="bg-white rounded-lg  sm:mx-4 mb-3 shadow p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
        <Avatar
          src={user?.profilePicture?.url || "/avatar.webp"}
          name={fullName}
          className="text-white border h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
        />
        <div className="flex-1 flex  w-full sm:w-auto gap-2">
          <Input
            placeholder="Share a video with your friends..."
            readOnly
            onClick={() => onOpenUploadModal()}
            className="cursor-pointer w-full rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
          />
          <Button
            onClick={() => onOpenUploadModal()}
            className="bg-gray-800 hover:bg-gray-900 whitespace-nowrap text-white flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base py-1.5 sm:py-2"
          >
            <FileVideo className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Share Video</span>
            <IoIosSend className="w-5 h-5 sm:hidden inline " />
          </Button>
        </div>
      </div>
    </div>
  );
}
