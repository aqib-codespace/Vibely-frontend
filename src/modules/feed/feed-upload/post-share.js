"use client";
import React, { useState } from "react";
import { Avatar, Button, Input } from "rizzui";
import PostModal from "./PostModal";
import { useSelector } from "react-redux";
import { actionButtons } from "./action-btns";
import { IoIosSend } from "react-icons/io";

export default function PostShare({ FetchAllFeeds }) {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const fullName = user?.firstName + "" + user?.lastName || "";

  const handleSubmit = (data) => {
    setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={user?.profilePicture?.url || "/avatar.webp"}
          name={fullName}
          className="text-white border"
        />
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="What's on your mind?"
            readOnly
            onClick={() => setModalOpen(true)}
            className="cursor-pointer w-full rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          />
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-gray-800 hover:bg-gray-900 cursor-pointer whitespace-nowrap text-white"
          >
            <span className="hidden sm:inline">Share Post</span>
            <span className="sm:hidden ">
              <IoIosSend className="h-5 w-5" />
            </span>
          </Button>
        </div>
      </div>
      <div className="post-action-row flex justify-around sm:justify-start sm:gap-12 mt-2">
        {actionButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            className="action-btn flex items-center cursor-pointer gap-1 text-gray-600"
            onClick={() => setModalOpen(true)}
            title={btn.label}
          >
            {React.createElement(btn.icon, {
              size: 20,
              style: btn.iconColor ? { color: btn.iconColor } : undefined,
            })}
            <span className=" sm:inline">{btn.label}</span>
          </button>
        ))}
      </div>
      <PostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        user={{
          avatar: user?.profilePicture?.url,
          name: fullName,
        }}
        FetchAllFeeds={FetchAllFeeds}
        onImage={() => setDropzoneOpen(true)}
      />
    </div>
  );
}
