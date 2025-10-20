"use client";
import { GetFriends } from "@/app/api/friends";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ProfileHeader } from "./profile-header";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "rizzui";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ContentLoader from "@/components/ContentLoader";

const ProfileFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const route = useRouter();
  console.log("friends component rendered", friends);
  const user = useSelector((state) => state.auth.user);

  const fetchFriends = async (pageNum = 1) => {
    if (!user || !user.id) return;

    try {
      setLoading(pageNum === 1);
      const response = await GetFriends(pageNum, limit);

      console.log("GetFriends API response:", response);

      const friendsList = response.data || [];

      if (pageNum === 1) {
        setFriends(friendsList);
      } else {
        setFriends((prev) => [...prev, ...friendsList]);
      }

      // Update pagination based on the response structure
      setHasMore(response.hasMore || false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setLoading(false);
    }
  };

  const fetchMoreData = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFriends(nextPage);
    }
  };

  useEffect(() => {
    console.log("ProfileFriends component mounted, user:", user);
    if (user && user.id) {
      fetchFriends(1);
    }
  }, [user]);

  return (
    <>
      <ProfileHeader
        title={`${user.firstName} ${user.lastName}`}
        description={user.bio}
        profilePicture={user?.profilePicture?.url}
        showUploadOnHover={true}
      >
        <div className="pb-4 sm:pb-8 min-h-screen px-2 sm:px-0">
          <div className="flex items-center mb-4 sm:mb-6">
            <span className="bg-blue-50 text-blue-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 mt-2 sm:mt-4 rounded-sm">
              {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
            </span>
          </div>

          {loading && page === 1 ? (
            <ContentLoader message="Loading your friends..." />
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-10 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 font-medium text-base sm:text-lg px-4 text-center">
                You have no friends yet.
              </p>
              <p className="text-gray-500 mt-1 text-sm sm:text-base px-4 text-center">
                Connect with others to expand your network!
              </p>
            </div>
          ) : (
            <div id="friendsScrollContainer" className="overflow-y-auto">
              <InfiniteScroll
                dataLength={friends.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={
                  <div className="text-center py-4 flex justify-center">
                    <Loader
                      variant="threeDot"
                      size="sm"
                      className="text-blue-500"
                    />
                  </div>
                }
                endMessage={
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm font-medium">
                      That is all of your friends!
                    </p>
                  </div>
                }
                scrollableTarget="friendsScrollContainer"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={friend.profilePicture?.url || "/avatar.webp"}
                        alt={`${friend.firstName} ${friend.lastName}`}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate">
                          {friend.firstName} {friend.lastName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          @{friend.userName || "username"}
                        </p>
                        {friend.bio && (
                          <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 line-clamp-1 hidden sm:block">
                            {friend.bio}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/profile/${friend._id}`}
                        className="ml-auto bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            </div>
          )}
        </div>
      </ProfileHeader>
    </>
  );
};

export default ProfileFriends;
