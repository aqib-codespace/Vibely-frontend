import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserStats, setStatsLoading } from "@/store/authSlice";
import { getCurrentUserStatsApi } from "@/app/api/userApis";

export const useUserStats = () => {
  const dispatch = useDispatch();
  const { user, userStats, statsLoading } = useSelector((state) => state.auth);

  const fetchUserStats = async (force = false) => {
    // Only fetch if we don't have stats or if forced
    if (
      !force &&
      (userStats.friendsCount > 0 ||
        userStats.postsCount > 0 ||
        userStats.likesCount > 0)
    ) {
      return;
    }

    if (!user?._id) return;

    try {
      dispatch(setStatsLoading(true));
      const stats = await getCurrentUserStatsApi();
      dispatch(
        setUserStats({
          friendsCount: stats?.data?.friendsCount || 0,
          postsCount: stats?.data?.postsCount || 0,
          likesCount: stats?.data?.likesCount || 0,
          followingCount: stats?.data?.followingCount || 0,
        })
      );
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      dispatch(setStatsLoading(false));
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user?._id]);

  return {
    userStats,
    statsLoading,
    refreshStats: () => fetchUserStats(true),
  };
};
