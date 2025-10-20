import { axiosPrivateApi } from "@/config/request";

export const globalSearchApi = async (
  query,
  type = "all",
  page = 1,
  limit = 10,
  sortBy = "relevance",
  filters = {}
) => {
  try {
    const params = {
      q: query,
      type,
      page,
      limit,
      sortBy,
    };

    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    const response = await axiosPrivateApi.get("/search/global", { params });

    if (response.data && response.data.success) {
      const data = response.data.data;

      return {
        query: data.query,
        searchType: data.searchType,
        users: data.categories?.users?.items || [],
        posts: data.categories?.posts?.items || [],
        videos: data.categories?.videos?.items || [],
        marketplace: data.categories?.products?.items || [],
        totalResults: data.totalResults || 0,
        pagination: {
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || limit,
          hasMore: data.pagination?.hasMore || false,
        },
        meta: response.data.meta,
      };
    }

    throw new Error("Failed to fetch search results");
  } catch (error) {
    console.error(
      "Error performing global search:",
      error?.response?.data || error.message
    );

    return {
      query: query,
      searchType: type,
      users: [],
      posts: [],
      videos: [],
      marketplace: [],
      totalResults: 0,
      pagination: {
        page: page,
        limit: limit,
        hasMore: false,
      },
    };
  }
};

export const getSearchSuggestionsApi = async (query, limit = 5) => {
  try {
    const response = await axiosPrivateApi.get("/search/suggestions", {
      params: { q: query, limit },
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error("Failed to fetch search suggestions");
  } catch (error) {
    console.error(
      "Error getting search suggestions:",
      error?.response?.data || error.message
    );

    return {
      users: [],
      hashtags: [],
      recent: [],
    };
    F;
  }
};
