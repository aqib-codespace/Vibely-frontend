"use client";
import { PiSealCheckFill } from "react-icons/pi";
import UploadProfilePicture from "./upload";
import ProfileSettingsNav from "./navigation";
import { useSelector } from "react-redux";
import UploadCoverImage from "./cover-upload";
import { FaHandHoldingHeart, FaHeartCircleXmark } from "react-icons/fa6";
import { CiLocationOn } from "react-icons/ci";
import { TbHeartHandshake } from "react-icons/tb";
import { GiOppositeHearts } from "react-icons/gi";
import { BsGenderMale } from "react-icons/bs";
import { IoFemaleOutline, IoHeartDislikeCircleOutline } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { useUserStats } from "@/hooks/useUserStats";

export function ProfileHeader({
  title,
  description,
  profilePicture,
  showUploadOnHover = false,
  children,
}) {
  const user = useSelector((state) => state.auth.user);
  const { userStats, statsLoading } = useUserStats();

  const getGenderIcon = (gender) => {
    switch ((gender || "male").toLowerCase()) {
      case "male":
        return <BsGenderMale />;
      case "female":
        return <IoFemaleOutline />;
      default:
        return <LuUser />;
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || "single").toLowerCase()) {
      case "single":
        return <FaHeartCircleXmark />;
      case "married":
        return <GiOppositeHearts className="text-pink-500" />;
      case "in_a_relationship":
        return <TbHeartHandshake className="text-red-500" />;
      case "it's_complicated":
        return <IoHeartDislikeCircleOutline className="text-red-500" />;
      default:
        return <FaHandHoldingHeart />;
    }
  };
  return (
    <div className="w-full  mt-16 bg-gray-50">
      <div className="w-full  md:h-64 relative">
        <UploadCoverImage coverImage={user?.coverImage?.url} />
      </div>
      <div className="relative z-10">
        <div className="bg-white flex flex-col md:flex-row px-4 sm:px-6 md:px-8 lg:px-10 py-4 md:py-8 gap-4 md:gap-10">
          <div className="flex  flex-col md:items-center md:-mt-24 -mt-16 w-full md:w-auto md:min-w-[300px] lg:min-w-[350px]">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white bg-gray-100 shadow-profilePic mb-12 md:mb-4">
              <UploadProfilePicture
                profilePicture={profilePicture}
                showUploadOnHover={showUploadOnHover}
              />
            </div>
            <div className="md:text-center">
              <div className="flex items-center md:justify-center gap-2 text-xl sm:text-2xl font-bold text-gray-900">
                {title}
                <PiSealCheckFill className="h-5 w-5 text-primary md:h-6 md:w-6" />
              </div>
              {description ? (
                <div className="text-gray-500 max-w-xs text-sm mt-1">
                  {description}
                </div>
              ) : null}
              <div className="flex md:justify-center gap-4 sm:gap-8 mt-4 sm:mt-6 mb-2">
                <div className="text-center">
                  <div className="font-bold text-base sm:text-lg">
                    {statsLoading
                      ? "..."
                      : userStats.friendsCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Friends</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-base sm:text-lg">
                    {statsLoading
                      ? "..."
                      : userStats.postsCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-base sm:text-lg">
                    {statsLoading
                      ? "..."
                      : userStats.likesCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Likes</div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 w-full">
                <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4 mb-4">
                  <div className="w-full">
                    <p className="text-xs text-left uppercase tracking-wide text-gray-800 mb-1">
                      Status
                    </p>
                    <div
                      className="flex w-full  items-center gap-2 px-3 sm:px-4 py-2 rounded 
                      bg-gray-50 text-pink-600 
                      font-medium text-xs sm:text-sm overflow-hidden"
                    >
                      {getStatusIcon(user?.status)}
                      <span className="capitalize truncate">
                        {user?.status?.replace(/_/g, " ") || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="w-full">
                    <p className="text-xs text-left uppercase tracking-wide text-gray-800 mb-1">
                      Gender
                    </p>
                    <div
                      className="flex w-full items-center gap-2 px-3 sm:px-4 py-2 rounded 
                      bg-gray-50 text-blue-600 
                      font-medium text-xs sm:text-sm overflow-hidden"
                    >
                      {getGenderIcon(user?.gender)}
                      <span className="capitalize truncate">
                        {user?.gender || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 w-full">
                  <p className="text-xs text-left uppercase tracking-wide text-gray-800 mb-1">
                    Date of Birth
                  </p>
                  <div
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded
                    bg-gray-50 text-gray-600 
                    font-medium text-xs sm:text-sm w-full overflow-hidden"
                  >
                    <LiaBirthdayCakeSolid className="flex-shrink-0" />
                    <span className="truncate">
                      {user?.dob || "Not specified"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-left uppercase tracking-wide text-gray-800 mb-1">
                    Address
                  </p>
                  <div
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded 
                    bg-gray-50 text-gray-600  
                    font-medium text-xs sm:text-sm w-full overflow-hidden"
                  >
                    <CiLocationOn className="flex-shrink-0" />
                    <span className="truncate">
                      {user?.address || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full justify-between mt-4 md:mt-0">
            <div className="overflow-x-auto pb-2">
              <ProfileSettingsNav />
            </div>
            <div className="mt-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
