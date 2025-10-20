"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import AllPeoples from "./allPeoples";
import FriendsTab from "./friends-tab";
import {
  GetFriends,
  GetReceivedRequests,
  GetSentRequests,
  AcceptFriendRequest,
  RejectFriendRequest,
  CancelFriendRequest,
} from "@/app/api/friends";
import { IoIosPeople } from "react-icons/io";
import { FaUserCheck, FaUserClock } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { RiUserSharedFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BsEmojiLaughing } from "react-icons/bs";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";

const PublicFriends = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [loading, setLoading] = useState({
    discover: false,
    friends: false,
    requests: false,
    sent: false,
  });
  const [page, setPage] = useState({
    discover: 1,
    friends: 1,
    requests: 1,
    sent: 1,
  });
  const [hasMore, setHasMore] = useState({
    discover: true,
    friends: true,
    requests: true,
    sent: true,
  });
  const [totalPages, setTotalPages] = useState({
    discover: 1,
    friends: 1,
    requests: 1,
    sent: 1,
  });
  const limit = 10;

  const currentUser = useSelector((state) => state.auth.user);

  const fetchFriends = async (pageNum = 1, append = false) => {
    try {
      if (!currentUser?.id) return;

      setLoading((prev) => ({ ...prev, friends: true }));

      const response = await GetFriends(pageNum, limit, searchQuery);

      setTotalPages((prev) => ({
        ...prev,
        friends: Math.ceil(response.data.length / limit) || 1,
      }));
      setHasMore((prev) => ({ ...prev, friends: response.hasMore }));

      if (append) {
        setFriends((prev) => [...prev, ...response.data]);
      } else {
        setFriends(response.data);
      }

      setLoading((prev) => ({ ...prev, friends: false }));
    } catch (error) {
      console.error("Error fetching friends:", error);
      setLoading((prev) => ({ ...prev, friends: false }));
      toast.error("Failed to load friends");
    }
  };

  const fetchReceivedRequests = async (pageNum = 1, append = false) => {
    try {
      if (!currentUser?.id) return;

      setLoading((prev) => ({ ...prev, requests: true }));

      const response = await GetReceivedRequests(pageNum, limit);

      setTotalPages((prev) => ({
        ...prev,
        requests: Math.ceil(response.data.length / limit) || 1,
      }));
      setHasMore((prev) => ({ ...prev, requests: response.hasMore }));

      if (append) {
        setFriendRequests((prev) => [...prev, ...response.data]);
      } else {
        setFriendRequests(response.data);
      }

      setLoading((prev) => ({ ...prev, requests: false }));
    } catch (error) {
      console.error("Error fetching received requests:", error);
      setLoading((prev) => ({ ...prev, requests: false }));
      toast.error("Failed to load friend requests");
    }
  };

  const fetchSentRequests = async (pageNum = 1, append = false) => {
    try {
      if (!currentUser?.id) return;

      setLoading((prev) => ({ ...prev, sent: true }));

      const response = await GetSentRequests(pageNum, limit);

      setTotalPages((prev) => ({
        ...prev,
        sent: Math.ceil(response.data.length / limit) || 1,
      }));
      setHasMore((prev) => ({ ...prev, sent: response.hasMore }));

      if (append) {
        setSentRequests((prev) => [...prev, ...response.data]);
      } else {
        setSentRequests(response.data);
      }

      setLoading((prev) => ({ ...prev, sent: false }));
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      setLoading((prev) => ({ ...prev, sent: false }));
      toast.error("Failed to load sent requests");
    }
  };

  const fetchTabData = async (tabName, pageNum = 1, append = false) => {
    switch (tabName) {
      case "friends":
        return fetchFriends(pageNum, append);
      case "requests":
        return fetchReceivedRequests(pageNum, append);
      case "sent":
        return fetchSentRequests(pageNum, append);
      case "discover":
        setLoading((prev) => ({ ...prev, discover: true }));

        try {
          if (searchQuery.trim()) {
            await fetchFriends(1, false);
          } else {
            await Promise.all([
              fetchFriends(1, false),
              fetchReceivedRequests(1, false),
              fetchSentRequests(1, false),
            ]);
          }
          return Promise.resolve();
        } catch (error) {
          console.error("Error loading discover tab data:", error);
          toast.error("Failed to load data");
          return Promise.reject(error);
        } finally {
          setLoading((prev) => ({ ...prev, discover: false }));
        }
      default:
        return Promise.resolve();
    }
  };

  const refreshTabData = (tabName) => {
    setPage((prev) => ({ ...prev, [tabName]: 1 }));
    return fetchTabData(tabName, 1, false);
  };

  const fetchMoreData = (tabName) => {
    if (page[tabName] < totalPages[tabName] && !loading[tabName]) {
      const nextPage = page[tabName] + 1;
      setPage((prev) => ({ ...prev, [tabName]: nextPage }));
      fetchTabData(tabName, nextPage, true);
    }
  };

  const [dataLoaded, setDataLoaded] = useState({
    discover: false,
    friends: false,
    requests: false,
    sent: false,
  });

  const handleTabChange = (tabValue) => {
    if (tabValue === activeTab) return;

    setActiveTab(tabValue);

    if (!dataLoaded[tabValue]) {
      setPage((prev) => ({ ...prev, [tabValue]: 1 }));

      setDataLoaded((prev) => ({ ...prev, [tabValue]: true }));

      fetchTabData(tabValue, 1, false);
    }
  };

  const isMounted = useRef(false);

  useEffect(() => {
    const initializeData = async () => {
      if (!currentUser?.id) return;

      setActiveTab("discover");

      setLoading((prev) => ({ ...prev, discover: true }));

      try {
        await Promise.all([
          fetchFriends(1, false),
          fetchReceivedRequests(1, false),
          fetchSentRequests(1, false),
        ]);

        setDataLoaded({
          discover: true,
          friends: true,
          requests: true,
          sent: true,
        });
      } catch (error) {
        console.error("Error initializing friends data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading((prev) => ({ ...prev, discover: false }));
      }
    };

    if (!isMounted.current) {
      isMounted.current = true;
      initializeData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setPage((prev) => ({ ...prev, [activeTab]: 1 }));

      const timer = setTimeout(() => {
        if (activeTab === "friends") {
          fetchFriends(1, false);
        } else if (activeTab === "discover") {
          fetchTabData("discover", 1, false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleCancelRequest = async (requestId) => {
    try {
      setLoading((prev) => ({ ...prev, sent: true }));
      await CancelFriendRequest(requestId);

      await refreshTabData("sent");
      toast.success("Friend request cancelled");
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      toast.error("Failed to cancel friend request");
      setLoading((prev) => ({ ...prev, sent: false }));
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setLoading((prev) => ({ ...prev, requests: true }));
      await AcceptFriendRequest(requestId);
      await Promise.all([
        refreshTabData("requests"),
        refreshTabData("friends"),
      ]);
      toast.success("Friend request accepted");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
      setLoading((prev) => ({ ...prev, requests: false }));
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setLoading((prev) => ({ ...prev, requests: true }));
      await RejectFriendRequest(requestId);
      await refreshTabData("requests");
      toast.success("Friend request rejected");
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject friend request");
      setLoading((prev) => ({ ...prev, requests: false }));
    }
  };

  return (
    <div className="w-full bg-white px-2 sm:px-4 rounded-lg min-h-screen">
      <Tabs
        defaultValue="discover"
        className="w-full"
        onValueChange={handleTabChange}
      >
        <div className="top-0 py-3 sm:py-4 mb-4 flex flex-col sm:flex-row justify-between bg-white w-full z-50 sticky gap-3">
          <TabsList className="flex flex-nowrap overflow-x-auto hide-scrollbar justify-start gap-1 sm:gap-2 w-full sm:w-auto">
            <TabsTrigger
              value="discover"
              className="px-3 sm:px-4 py-2 whitespace-nowrap"
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <IoIosPeople className="h-5 w-5 text-gray-800" />
                <span className="sm:inline">Discover People</span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="px-3 sm:px-4 py-2 whitespace-nowrap"
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <FaUserCheck className="h-5 w-5 text-gray-800" />
                <span className="sm:inline">My Friends</span>{" "}
                {friends.length > 0 && `(${friends.length})`}
                {loading.friends && (
                  <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"></span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="px-3 sm:px-4 py-2 whitespace-nowrap"
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <FaUserClock className="h-5 w-5 text-gray-800" />
                <span className="sm:inline">Requests</span>{" "}
                {friendRequests.length > 0 && `(${friendRequests.length})`}
                {loading.requests && (
                  <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"></span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="px-3 sm:px-4 py-2 whitespace-nowrap"
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <RiUserSharedFill className="h-5 w-5 text-gray-800" />
                <span className="sm:inline">Sent</span>{" "}
                {sentRequests.length > 0 && `(${sentRequests.length})`}
                {loading.sent && (
                  <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"></span>
                )}
              </span>
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search friends..."
              className="pl-10 pr-4 py-1.5 border bg-gray-50 border-gray-200 rounded-lg focus:outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <TabsContent value="discover">
          <div>
            {loading.discover ? (
              <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-gray-300 border-t-gray-800"></div>
                <p className="text-gray-500 text-sm sm:text-base">
                  Loading people...
                </p>
              </div>
            ) : (
              <AllPeoples
                incomingRequests={friendRequests}
                outgoingRequests={sentRequests}
                friendsList={friends}
                fetchFriendRequests={() => fetchTabData("discover", 1, false)}
                refreshAfterAction={() => {
                  return Promise.all([
                    refreshTabData("requests"),
                    refreshTabData("sent"),
                  ]);
                }}
                loading={loading.discover}
                hasMore={hasMore.discover}
                fetchMoreData={() => fetchMoreData("discover")}
                page={page.discover}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="friends">
          <InfiniteScroll
            dataLength={friends.length}
            next={() => fetchMoreData("friends")}
            hasMore={hasMore.friends}
            loader={
              <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-lg shadow bg-white py-4 sm:py-6 my-2">
                <div className="flex gap-1">
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Loading more friends...
                </p>
              </div>
            }
            endMessage={
              friends.length > 0 && page.friends > 1 && !hasMore.friends ? (
                <div className="text-center py-4 sm:py-6 bg-white rounded-lg shadow text-gray-600 my-2">
                  <p className="text-base sm:text-lg font-semibold">
                    🎉You are all caught up! Add more people to see more friends
                  </p>
                </div>
              ) : null
            }
            scrollThreshold={0.8}
            className="w-full"
          >
            {loading.friends && friends.length === 0 ? (
              <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full border-4 border-t-transparent w-10 h-10 sm:w-12 sm:h-12"></div>
                <p className="text-gray-500 text-sm sm:text-base">
                  Loading your friends...
                </p>
              </div>
            ) : (
              <FriendsTab friends={friends} />
            )}
          </InfiniteScroll>
        </TabsContent>

        <TabsContent value="requests">
          <InfiniteScroll
            dataLength={friendRequests.length}
            next={() => fetchMoreData("requests")}
            hasMore={hasMore.requests}
            loader={
              <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-lg shadow bg-white py-4 sm:py-6 my-2">
                <div className="flex gap-1">
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Loading more requests...
                </p>
              </div>
            }
            endMessage={
              friendRequests.length > 0 &&
              page.requests > 1 &&
              !hasMore.requests ? (
                <div className="text-center py-4 sm:py-6 bg-white rounded-lg shadow text-gray-600 my-2">
                  <p className="text-base sm:text-lg font-semibold">
                    ✅ All caught up. More requests will show when people add
                    you.
                  </p>
                </div>
              ) : null
            }
            scrollThreshold={0.8}
            className="w-full"
          >
            <div className="mb-8">
              {loading.requests && friendRequests.length === 0 ? (
                <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full border-4 border-t-transparent w-10 h-10 sm:w-12 sm:h-12"></div>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Loading friend requests...
                  </p>
                </div>
              ) : friendRequests.length === 0 ? (
                <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
                  <BsEmojiLaughing className="h-12 w-12 sm:h-16 sm:w-16" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    You do not have any pending friend requests.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {friendRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex flex-col sm:flex-row justify-between rounded-lg px-3 sm:px-4 py-3 w-full items-start sm:items-center bg-gray-50 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${request.senderId._id}`}>
                          <img
                            src={
                              request.senderId.profilePicture?.url ||
                              "/avatar.webp"
                            }
                            alt={`${request.senderId.firstName} ${request.senderId.lastName}`}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                            loading="lazy"
                          />
                        </Link>
                        <div>
                          <div className="text-base sm:text-lg text-gray-800">
                            {request.senderId.firstName}{" "}
                            {request.senderId.lastName}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Sent{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          disabled={loading.requests}
                          className={`px-3 sm:px-4 py-1 text-sm sm:text-base cursor-pointer rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors flex-1 sm:flex-initial ${
                            loading.requests
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          disabled={loading.requests}
                          className={`px-3 sm:px-4 py-1 text-sm sm:text-base rounded cursor-pointer bg-gray-800 text-white hover:bg-gray-900 transition-colors flex-1 sm:flex-initial ${
                            loading.requests
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfiniteScroll>
        </TabsContent>

        <TabsContent value="sent">
          <InfiniteScroll
            dataLength={sentRequests.length}
            next={() => fetchMoreData("sent")}
            hasMore={hasMore.sent}
            loader={
              <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-lg shadow bg-white py-4 sm:py-6 my-2">
                <div className="flex gap-1">
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="animate-bounce w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-800 mx-1"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Loading more sent requests...
                </p>
              </div>
            }
            endMessage={
              sentRequests.length > 0 && page.sent > 1 && !hasMore.sent ? (
                <div className="text-center py-4 sm:py-6 bg-white rounded-lg shadow text-gray-600 my-2">
                  <p className="text-base sm:text-lg font-semibold">
                    ✅ You have seen all sent requests!
                  </p>
                </div>
              ) : null
            }
            scrollThreshold={0.8}
            className="w-full"
          >
            <div className="mb-8">
              {loading.sent && sentRequests.length === 0 ? (
                <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full border-4 border-t-transparent w-10 h-10 sm:w-12 sm:h-12"></div>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Loading sent requests...
                  </p>
                </div>
              ) : sentRequests.length === 0 ? (
                <div className="text-center p-4 sm:p-6 min-h-[40vh] sm:min-h-[50vh] flex flex-col gap-3 sm:gap-4 justify-center items-center bg-gray-50 rounded-lg">
                  <BsEmojiLaughing className="h-12 w-12 sm:h-16 sm:w-16" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    You do not have any sent friend requests.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sentRequests.map((request) => (
                    <div key={request._id} className="bg-gray-50 rounded-lg">
                      <div className="p-3 sm:p-4 justify-between flex flex-row w-full items-center gap-3 sm:gap-0">
                        <div className="flex items-center w-full gap-3">
                          <Link href={`/profile/${request.receiverId._id}`}>
                            <img
                              src={
                                request.receiverId.profilePicture?.url ||
                                "/avatar.webp"
                              }
                              alt={`${request.receiverId.firstName} ${request.receiverId.lastName}`}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-blue-200"
                              loading="lazy"
                            />
                          </Link>
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg">
                              {request.receiverId.firstName}{" "}
                              {request.receiverId.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                              <span>
                                Sent{" "}
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div
                          onClick={() => handleCancelRequest(request._id)}
                          className={` whitespace-nowrap cursor-pointer flex  ${
                            loading.sent ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <span className="text-sm md:block hidden bg-gray-100 text-gray-800 px-3 py-2 rounded-lg font-medium">
                            {loading.sent ? "Cancelling..." : "Cancel Request"}
                          </span>
                          <span className="text-sm md:hidden block bg-gray-100 text-gray-800 p-2 rounded-lg font-medium">
                            {loading.sent ? (
                              "..."
                            ) : (
                              <FaUserClock className="h-5 w-5" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfiniteScroll>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicFriends;
