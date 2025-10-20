"use client";
import { SendFriendRequest, searchUsersApi } from "@/app/api/friends";
import { getAllUsersApi } from "@/app/api/userApis";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from "@/components/ui/loader";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa6";

const AllPeoples = ({
  incomingRequests = [],
  outgoingRequests = [],
  friendsList = [],
  fetchFriendRequests,
  refreshAfterAction,
  hasMore = true,
  loading = false,
  fetchMoreData,
  page = 1,
  searchQuery = "",
}) => {
  const [users, setUsers] = useState([]);
  const [sentRequests, setSentRequests] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [localHasMore, setLocalHasMore] = useState(true);
  const limit = 10;
  const currentUser = useSelector((state) => state.auth.user);

  const fetchAllUsers = async (pageNum = 1, append = false) => {
    try {
      if (!currentUser?.id || loading) {
        return;
      }

      setIsLoading(true);
      const response = searchQuery.trim()
        ? await searchUsersApi(searchQuery, pageNum, limit)
        : await getAllUsersApi(pageNum, limit);

      const excludeIds = [
        currentUser.id,
        currentUser._id,
        ...incomingRequests
          .map((req) => req.senderId?._id || req.senderId)
          .filter(Boolean),
        ...outgoingRequests
          .map((req) => req.receiverId?._id || req.receiverId)
          .filter(Boolean),
        ...friendsList
          .map((friend) => friend?._id || friend?.id)
          .filter(Boolean),
      ];

      let filteredUsers;

      if (searchQuery.trim()) {
        filteredUsers = response?.data.filter((user) => {
          const userId = user?._id || user?.id;
          return (
            userId && userId !== currentUser.id && userId !== currentUser._id
          );
        });
      } else {
        filteredUsers = response?.data.filter((user) => {
          const userId = user?._id || user?.id;
          return userId && !excludeIds.includes(userId);
        });
      }

      setTotalPages(response?.totalPages || 1);
      setLocalHasMore(response?.hasMore || false);

      if (append) {
        setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
      } else {
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      currentUser?.id &&
      Array.isArray(incomingRequests) &&
      Array.isArray(outgoingRequests) &&
      Array.isArray(friendsList)
    ) {
      fetchAllUsers(1, false);
    }
  }, [
    currentUser?.id,
    incomingRequests,
    outgoingRequests,
    friendsList,
    searchQuery,
  ]);

  const loadMoreUsers = () => {
    if (page < totalPages && !isLoading && !loading) {
      fetchAllUsers(page + 1, true);
      if (fetchMoreData) fetchMoreData();
    }
  };

  const handleSendFriendRequest = async (receiverId) => {
    try {
      if (!currentUser?.id) {
        toast.error("You must be logged in to send friend requests");
        return;
      }

      setSentRequests((prev) => ({
        ...prev,
        [receiverId]: { status: "pending", type: "sent" },
      }));
      setUsers((users) =>
        users.filter((user) => (user._id || user.id) !== receiverId)
      );
      await SendFriendRequest({
        senderId: currentUser.id,
        receiverId,
      });
      if (refreshAfterAction) {
        await refreshAfterAction();
      }

      if (fetchFriendRequests) {
        await fetchFriendRequests();
      }

      toast.success("Friend request sent successfully");
    } catch (error) {
      console.error("Error sending friend request:", error);
      setSentRequests((prev) => {
        const updated = { ...prev };
        delete updated[receiverId];
        return updated;
      });
      toast.error(
        error?.response?.data?.message || "Failed to send friend request"
      );
    }
  };

  if (!currentUser?.id) {
    return null;
  }

  const showLoading = isLoading || loading;
  const emptyState = (
    <div className="text-gray-500 min-h-[40vh] sm:min-h-[50vh] flex bg-gray-50 flex-col justify-center items-center gap-2 w-full py-6 sm:py-10 px-4">
      <HiOutlineEmojiHappy className="text-gray-800 h-12 w-12 sm:h-16 sm:w-16" />
      <span className="max-w-xs sm:max-w-md mx-auto text-center text-sm sm:text-base">
        No users are currently available.
        <br />
        Please check back later or refresh the page to see new people.
      </span>
    </div>
  );

  return (
    <InfiniteScroll
      dataLength={users.length}
      next={loadMoreUsers}
      hasMore={localHasMore && hasMore && !showLoading}
      loader={
        <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-lg shadow bg-white py-4 sm:py-6 my-2 sm:my-4">
          <Loader size="sm" variant="threeDot" className="text-gray-700" />
          <p className="text-gray-600 text-xs sm:text-sm font-medium">
            Finding more people...
          </p>
        </div>
      }
      endMessage={
        users.length > 0 && page > 1 && !localHasMore && !hasMore ? (
          <div className="text-center py-4 sm:py-6 bg-white rounded-lg text-gray-600 my-2 sm:my-4">
            <p className="text-base sm:text-lg font-semibold">
              👋 You have reached the end! Check back later for more people.
            </p>
          </div>
        ) : null
      }
      scrollThreshold={0.8}
      className="w-full"
    >
      <div className="flex flex-col gap-4">
        {showLoading ? (
          <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
            <Loader size="md" className="border-gray-300 border-t-gray-800" />
            <p className="text-gray-500 text-sm sm:text-base">
              Discovering people...
            </p>
          </div>
        ) : users.length === 0 ? (
          emptyState
        ) : (
          users.map((user) => {
            const userId = user._id || user.id;
            const fullName = `${user.firstName || ""} ${
              user.lastName || ""
            }`.trim();
            const username = user.userName || user.username || "username";

            return (
              <div
                key={userId}
                className="flex flex-row justify-between rounded-lg px-3 sm:px-4 py-3 w-full items-center bg-gray-50 hover:bg-gray-100 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link href={`/profile/${userId}`}>
                    <img
                      src={user.profilePicture?.url || "/avatar.webp"}
                      alt={fullName || username}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div>
                    <Link href={`/profile/${userId}`} className="">
                      <div className="text-base sm:text-lg text-gray-800 font-medium">
                        {fullName || username}
                      </div>
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500">
                      @{username}
                    </p>
                  </div>
                </div>
                <div className="ml-auto sm:ml-0">
                  {sentRequests[userId] ? (
                    <button
                      disabled
                      className="px-3 sm:px-4 py-1 rounded text-sm sm:text-base bg-gray-400 text-white transition-colors cursor-not-allowed"
                    >
                      {sentRequests[userId].status === "accepted"
                        ? "Friends"
                        : sentRequests[userId].status === "pending"
                        ? "Request Sent"
                        : "Request " + sentRequests[userId].status}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendFriendRequest(userId)}
                      disabled={isLoading}
                      className={`px-3 sm:px-4 py-1 rounded text-sm sm:text-base cursor-pointer bg-gray-800 text-white hover:bg-gray-900 transition-colors ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="md:inline hidden">Add Friend</span>
                      <span className="md:hidden inline">
                        <FaUserPlus className="h-5 w-5" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </InfiniteScroll>
  );
};

export default AllPeoples;
