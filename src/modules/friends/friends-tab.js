"use client";
import React from "react";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FaUser } from "react-icons/fa6";
import Link from "next/link";
import { BsEmojiLaughing } from "react-icons/bs";
import Loader from "@/components/ui/loader";

const FriendsTab = ({ friends, loading = false }) => {
  if (loading) {
    return (
      <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
        <Loader size="md" className="border-gray-300 border-t-gray-800" />
        <p className="text-gray-500 text-sm sm:text-base">
          Loading your friends...
        </p>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
        <BsEmojiLaughing className="h-12 w-12 sm:h-16 sm:w-16" />
        <p className="text-gray-500 text-sm sm:text-base">
          You do not have any friends yet.
        </p>
      </div>
    );
  }
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 gap-4">
        {friends.map((friend) => (
          <div key={friend._id || friend.id} className="bg-gray-50 rounded-lg">
            <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link href={`/profile/${friend?._id || friend.id}`}>
                  <img
                    src={friend.profilePicture?.url || "/avatar.webp"}
                    alt={`${friend.firstName || ""} ${friend.lastName || ""}`}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-800"
                    loading="lazy"
                  />
                </Link>
                <div>
                  <Link
                    href={`/profile/${friend?._id || friend.id}`}
                    className=""
                  >
                    <h3 className="font-semibold text-base sm:text-lg">
                      {friend.firstName || ""} {friend.lastName || ""}
                    </h3>
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-500">
                    @{friend.username || "username"}
                  </p>
                </div>
              </div>
              <div className="gap-2 sm:gap-4 flex justify-between sm:justify-end w-full sm:w-auto">
                <Link
                  href={`/profile/${friend?._id || friend.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base flex-1 sm:flex-initial justify-center sm:justify-start"
                >
                  <FaUser className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  href={`/chat/${friend?._id || friend.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 sm:py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm sm:text-base flex-1 sm:flex-initial justify-center sm:justify-start"
                >
                  <BiMessageSquareDetail className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Chat</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsTab;
