"use client";
import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useRouter } from "next/navigation";

const MobileNotificationButton = () => {
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const handleClick = () => {
    router.push("/notifications");
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
    >
      <IoMdNotificationsOutline className="h-6 w-6 text-gray-700" />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] font-medium">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default MobileNotificationButton;
