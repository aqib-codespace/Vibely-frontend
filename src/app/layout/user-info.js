import React from "react";
import { PiSealCheckFill } from "react-icons/pi";
import { useSelector } from "react-redux";
import { Avatar } from "rizzui";
import { useRouter } from "next/navigation";
import { useUserStats } from "@/hooks/useUserStats";

export default function UserInfo() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const { userStats, statsLoading } = useUserStats();
  const fullName = user?.firstName + " " + user?.lastName;

  const handleCardClick = () => {
    if (user?._id) {
      router.push(`/profile-setting/posts`);
    }
  };
  return (
    <div
      className="bg-white rounded-xl w-64 shadow-sm p-3 mb-4 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
      onClick={handleCardClick}
    >
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex gap-4 mb-4 items-center">
          <Avatar
            src={user?.profilePicture?.url || "/avatar.webp"}
            name={fullName || ""}
            className="text-white ring-2 ring-blue-100"
          />
          <div className="">
            <div className="flex whitespace-nowrap gap-2 items-center ">
              <span className="font-semibold text-md text-gray-800">
                {fullName}
              </span>
              <PiSealCheckFill className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-gray-500 flex gap-3 items-center text-sm">
              @{user?.userName}
            </span>
          </div>
        </div>
        <div className="flex justify-between w-full mt-3">
          <div className="text-center flex-1">
            <div className="font-semibold text-base text-gray-800">
              {statsLoading ? "..." : userStats.friendsCount.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs">Friends</div>
          </div>
          <div className="text-center flex-1">
            <div className="font-semibold text-base text-gray-800">
              {statsLoading ? "..." : userStats.postsCount.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs">Posts</div>
          </div>
          <div className="text-center flex-1">
            <div className="font-semibold text-base text-gray-800">
              {statsLoading ? "..." : userStats.likesCount.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs">Likes</div>
          </div>
        </div>
        {/* <div className="text-center mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            View Profile →
          </span>
        </div> */}
      </div>
    </div>
  );
}
