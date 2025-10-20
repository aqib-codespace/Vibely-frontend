"use client";
import React, { useEffect, useState } from "react";
import Header from "@/app/layout/header";
import { getUserByIdApi, getUserStatsApi } from "@/app/api/userApis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaHeartCircleXmark,
  FaHandHoldingHeart,
  FaArrowLeftLong,
  FaArrowLeft,
  FaVideo,
  FaPlay,
} from "react-icons/fa6";
import { CiLocationOn } from "react-icons/ci";
import { TbHeartHandshake } from "react-icons/tb";
import { GiOppositeHearts } from "react-icons/gi";
import { BsGenderMale } from "react-icons/bs";
import { IoFemaleOutline, IoHeartDislikeCircleOutline } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { PiSealCheckFill } from "react-icons/pi";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { getPostByIdApi, getPostsByUserIdApi } from "@/app/api/feedApis";
import PostCard from "@/components/PostCard";
import { useSelector } from "react-redux";
import { usePostLike } from "@/hooks/usePostLike";
import { Button } from "rizzui";
import { useRouter } from "next/navigation";
import { VscFeedback } from "react-icons/vsc";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { HiOutlinePhotograph } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";

const FriendsProfilePage = ({ id }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);
  const route = useRouter();

  // Use the centralized post like hook
  const handlePostLike = usePostLike(setPosts, currentUser._id);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getUserByIdApi(id);

        try {
          const statsData = await getUserStatsApi(id);
          setUser({
            ...data?.data,
            stats: statsData?.data,
          });
        } catch (statsError) {
          console.error("Failed to fetch user stats:", statsError);
          setUser(data?.data);
        }
      } catch (err) {
        setError("Failed to load user profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const getFeedPostsByUserId = async (userId) => {
    try {
      const response = await getPostsByUserIdApi(userId);
      setPosts(response?.feeds || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  };

  useEffect(() => {
    if (user && user._id) {
      getFeedPostsByUserId(user._id);
    }
  }, [user]);

  const getGenderIcon = (gender) => {
    switch ((gender || "male").toLowerCase()) {
      case "male":
        return <BsGenderMale className="text-blue-500 h-5 w-5" />;
      case "female":
        return <IoFemaleOutline className="text-pink-500 h-5 w-5" />;
      default:
        return <LuUser className="text-gray-500 h-5 w-5" />;
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || "single").toLowerCase()) {
      case "single":
        return <FaHeartCircleXmark className="text-gray-500 h-5 w-5" />;
      case "married":
        return <GiOppositeHearts className="text-pink-500 h-5 w-5" />;
      case "in_a_relationship":
        return <TbHeartHandshake className="text-red-500 h-5 w-5" />;
      case "it's_complicated":
        return <IoHeartDislikeCircleOutline className="text-red-500 h-5 w-5" />;
      default:
        return <FaHandHoldingHeart className="text-gray-500 h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 pt-20">
          <div className="flex items-center justify-center h-96">
            <div className="animate-pulse flex flex-col items-center space-y-6 w-full">
              <div className="rounded-full bg-gray-200 h-32 w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex flex-col w-full space-y-3">
                <div className="h-20 bg-gray-200 rounded w-full"></div>
                <div className="h-20 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <main className=" mx-auto md:px-4  pb-10">
        <Button
          onClick={() => route.back()}
          variant="outline"
          className="px-4 flex cursor-pointer items-center gap-4 mb-4"
        >
          <FaArrowLeft />
          <p>Back</p>
        </Button>
        <div className="relative w-full h-56 rounded-xl  mb-24 bg-gradient-to-r from-blue-500 to-purple-500">
          {user.coverImage?.url ? (
            <img
              src={user.coverImage.url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-75"></div>
          )}

          <div className="absolute flex justify-center items-center w-full  z-[999]  -bottom-16 ">
            <div className="w-32 h-32 rounded-full  border-4 border-white bg-white shadow-lg overflow-hidden">
              <img
                src={user.profilePicture?.url || "/avatar.webp"}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <PiSealCheckFill className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-500 mt-2">@{user.userName || "username"}</p>
          <p className="mt-4 text-gray-700 max-w-lg mx-auto">
            {user.bio || "No bio available"}
          </p>

          <div className="flex justify-center mt-6">
            <div className="bg-white rounded-xl shadow-sm px-8 py-4">
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">
                    {user.stats?.friendsCount?.toLocaleString() || "0"}
                  </div>
                  <div className="text-gray-500 text-sm">Friends</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">
                    {user.stats?.postsCount?.toLocaleString() ||
                      posts?.length ||
                      "0"}
                  </div>
                  <div className="text-gray-500 text-sm">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">
                    {user.stats?.likesCount?.toLocaleString() || "0"}
                  </div>
                  <div className="text-gray-500 text-sm">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(user.status)}
                  <div>
                    <p className="text-sm text-gray-500">Relationship Status</p>
                    <p className="text-gray-800 font-medium capitalize">
                      {user.status?.replace(/_/g, " ") || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getGenderIcon(user.gender)}
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-gray-800 font-medium capitalize">
                      {user.gender || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <LiaBirthdayCakeSolid className="text-orange-500 h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Birthday</p>
                    <p className="text-gray-800 font-medium">
                      {user.dob || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CiLocationOn className="text-red-500 h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-800 font-medium">
                      {user.address || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full mb-2 bg-white  ">
                <TabsTrigger value="posts" className=" py-4">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="photos" className=" py-4">
                  Photos
                </TabsTrigger>
                <TabsTrigger value="videos" className=" py-4">
                  Videos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts">
                <div className=" bg-white rounded-xl shadow-sm space-y-6">
                  {posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onLikeToggle={handlePostLike}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <MdOutlineEmojiEmotions className="h-16 w-16 text-gray-800" />

                      <h3 className="text-lg font-medium text-gray-700">
                        No Posts yet !!
                      </h3>
                      <p className="text-gray-500 mt-2 px-4 max-w-md">
                        {user.firstName} has not shared any Post yet. Check back
                        later!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="photos">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {posts &&
                  posts.some(
                    (post) =>
                      post.media &&
                      post.media.some((item) => item.type === "image")
                  ) ? (
                    <div className="grid sm:grid-cols-2  gap-4">
                      {posts.flatMap((post) =>
                        post.media
                          ?.filter((item) => item.type === "image")
                          .map((image, idx) => (
                            <div
                              key={`${post._id}-${idx}`}
                              className="group relative rounded-lg overflow-hidden cursor-pointer"
                              onClick={() =>
                                setSelectedPhoto({
                                  ...image,
                                  post: post,
                                  user: post.user,
                                })
                              }
                            >
                              <img
                                src={image.url}
                                alt={`Photo by ${user.firstName}`}
                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                <div className="p-3 w-full text-white">
                                  <p className="text-sm truncate">
                                    {post.content?.substring(0, 30) || "Photo"}
                                  </p>
                                  <p className="text-xs opacity-80">
                                    {new Date(
                                      post.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <HiOutlinePhotograph className="h-16 w-16 mb-4 text-gray-800" />
                      <h3 className="text-lg font-medium text-gray-700">
                        No photos yet
                      </h3>
                      <p className="text-gray-500 mt-2 max-w-md">
                        {user.firstName} has not shared any photos yet. Check
                        back later!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="videos">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {posts &&
                  posts.some(
                    (post) =>
                      post.media &&
                      post.media.some((item) => item.type === "video")
                  ) ? (
                    <div className="grid grid-cols-1 gap-4">
                      {posts.flatMap((post) =>
                        post.media
                          ?.filter((item) => item.type === "video")
                          .map((video, idx) => (
                            <div
                              key={`${post._id}-${idx}`}
                              className="rounded-lg overflow-hidden bg-gray-800"
                            >
                              <div className="aspect-video relative">
                                {video.thumbnail ? (
                                  <img
                                    src={video.thumbnail}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover opacity-80"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                    <FaVideo />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-12 w-12 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm hover:bg-white/50 transition-all"
                                  >
                                    <FaPlay className="text-white" />
                                  </a>
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="text-white font-medium truncate">
                                  {post.content?.substring(0, 40) || "Video"}
                                </h4>
                                <p className="text-gray-300 text-sm mt-1">
                                  {new Date(
                                    post.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FaVideo className="h-16 w-16 text-gray-800" />
                      <h3 className="text-lg font-medium text-gray-700">
                        No videos yet
                      </h3>
                      <p className="text-gray-500 mt-2 max-w-md">
                        {user.firstName} has not shared any videos yet. Check
                        back later for video content!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="about">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    About {user.firstName}
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Bio
                      </h4>
                      <p className="text-gray-700">
                        {user.bio || "No bio information available."}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Email:</span>{" "}
                          {user.email}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Location:</span>{" "}
                          {user.address || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Basic Information
                      </h4>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Birthday:</span>{" "}
                          {user.dob || "Not specified"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Gender:</span>{" "}
                          {user.gender || "Not specified"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">
                            Relationship Status:
                          </span>{" "}
                          {user.status?.replace(/_/g, " ") || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-gray-300 bg-opacity-40 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10"
              onClick={() => setSelectedPhoto(null)}
            >
              <RxCross2 />
            </button>
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <div className="w-full h-[70vh] flex items-center justify-center bg-black">
                <img
                  src={selectedPhoto.url}
                  alt="Full size photo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={
                      selectedPhoto.user?.profilePicture?.url || "/avatar.webp"
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {selectedPhoto.user?.firstName}{" "}
                      {selectedPhoto.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        selectedPhoto.post?.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedPhoto.post?.content && (
                  <p className="text-gray-700 mt-2">
                    {selectedPhoto.post.content.length > 150
                      ? selectedPhoto.post.content.substring(0, 150) + "..."
                      : selectedPhoto.post.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FriendsProfilePage;
