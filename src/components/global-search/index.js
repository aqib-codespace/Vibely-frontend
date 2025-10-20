"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import {
  globalSearchApi,
  getSearchSuggestionsApi,
} from "@/app/api/globalSearch";

import UsersSearchResults from "./results/users-results";
import PostsSearchResults from "./results/posts-results";
import VideosSearchResults from "./results/videos-results";
import MarketplaceSearchResults from "./results/marketplace-results";

const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState({
    users: [],
    hashtags: [],
    recent: [],
  });
  const [results, setResults] = useState({
    users: [],
    posts: [],
    videos: [],
    marketplace: [],
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    hasMore: false,
  });
  const [totalResults, setTotalResults] = useState(0);
  const [responseTime, setResponseTime] = useState(null);

  const searchRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  useOnClickOutside(searchRef, () => {
    setIsOpen(false);
    setShowSuggestions(false);
  });

  useEffect(() => {
    if (searchQuery && searchQuery.length > 1 && searchQuery.length < 3) {
      fetchSearchSuggestions(searchQuery);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 1) {
      setIsLoading(true);
      fetchSearchResults(debouncedSearchTerm, "all", sortBy).then(() => {
        setIsLoading(false);
        setIsOpen(true);
        setShowSuggestions(false);
      });
    } else {
      setIsOpen(false);
      setResults({
        users: [],
        posts: [],
        videos: [],
        marketplace: [],
      });
    }
  }, [debouncedSearchTerm, sortBy]);

  const fetchSearchSuggestions = async (query) => {
    try {
      const suggestionData = await getSearchSuggestionsApi(query, 5);
      setSuggestions(suggestionData);

      if (
        suggestionData.users.length > 0 ||
        suggestionData.hashtags.length > 0
      ) {
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setShowSuggestions(false);
    }
  };

  const fetchSearchResults = async (
    query,
    type = "all",
    sortMethod = "relevance"
  ) => {
    try {
      const typeMapping = {
        all: "all",
        people: "users",
        posts: "feed",
        videos: "videos",
        marketplace: "marketplace",
      };

      const apiType = typeMapping[type] || "all";

      const searchData = await globalSearchApi(
        query,
        apiType,
        pagination.page,
        pagination.limit,
        sortMethod
      );

      setResults({
        users: searchData.users || [],
        posts: searchData.posts || [],
        videos: searchData.videos || [],
        marketplace: searchData.marketplace || [],
      });

      setTotalResults(searchData.totalResults || 0);
      setPagination({
        page: searchData.pagination?.page || 1,
        limit: searchData.pagination?.limit || 10,
        hasMore: searchData.pagination?.hasMore || false,
      });

      if (searchData.meta?.responseTime) {
        setResponseTime(searchData.meta.responseTime);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults({
        users: [],
        posts: [],
        videos: [],
        marketplace: [],
      });
      setTotalResults(0);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setIsLoading(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsOpen(false);
    setShowSuggestions(false);
    setResults({
      users: [],
      posts: [],
      videos: [],
      marketplace: [],
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text || suggestion.username);
    setShowSuggestions(false);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setPagination({
      ...pagination,
      page: 1,
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const getTotalResultsCount = () => {
    return (
      totalResults ||
      results.users.length +
        results.posts.length +
        results.videos.length +
        results.marketplace.length
    );
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="text-gray-500 h-5 w-5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.length >= 1) {
              setIsOpen(true);
            } else if (searchQuery.length > 0 && searchQuery.length < 2) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Search anything... "
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-100"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
            ) : (
              <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            )}
          </button>
        )}
      </div>

      {showSuggestions && searchQuery && !isOpen && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2 min-h-[100px]">
          {suggestions.users.length > 0 && (
            <div className="px-3 py-1">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">
                Suggestions
              </h4>
              {suggestions.users.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                  onClick={() => handleSuggestionClick(user)}
                >
                  {user.avatar && (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3">
                      <Image
                        src={user.avatar}
                        alt={user.text}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{user.text}</p>
                    {user.username && (
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {suggestions.hashtags.length > 0 && (
            <div className="px-3 py-1 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">
                Trending
              </h4>
              {suggestions.hashtags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                  onClick={() => handleSuggestionClick(tag)}
                >
                  <div className="text-blue-500 mr-2">#</div>
                  <p className="text-sm">{tag.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isOpen && searchQuery.length >= 1 && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden min-h-[400px] max-h-[80vh] overflow-y-auto global-search-dropdown">
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
            <Tabs
              defaultValue={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">
                  Results for &quot;{searchQuery}&quot;
                </h3>
                {responseTime && (
                  <span className="text-xs text-gray-400">{responseTime}</span>
                )}
              </div>

              <TabsList className="grid grid-cols-5 w-full rounded-md bg-white border-b border-gray-200">
                <TabsTrigger value="all" className="text-center pb-2 px-1">
                  All ({getTotalResultsCount()})
                </TabsTrigger>
                <TabsTrigger value="people" className="text-center pb-2 px-1">
                  People ({results.users.length})
                </TabsTrigger>
                <TabsTrigger value="posts" className="text-center pb-2 px-1">
                  Posts ({results.posts.length})
                </TabsTrigger>
                <TabsTrigger value="videos" className="text-center pb-2 px-1">
                  Videos ({results.videos.length})
                </TabsTrigger>
                <TabsTrigger
                  value="marketplace"
                  className="text-center pb-2 px-1"
                >
                  Market ({results.marketplace.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex justify-end mt-2">
                <div className="relative flex items-center text-xs">
                  <SlidersHorizontal className="h-3 w-3 mr-1" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-transparent text-gray-700 font-medium border-0 focus:outline-none focus:ring-0 pr-4 py-0 text-xs"
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="recent">Most Recent</option>
                    {activeTab === "marketplace" && (
                      <>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                      </>
                    )}
                    {(activeTab === "posts" || activeTab === "videos") && (
                      <option value="popular">Most Popular</option>
                    )}
                    {activeTab === "videos" && (
                      <option value="most_liked">Most Liked</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <TabsContent value="all" className="space-y-4">
                  {getTotalResultsCount() === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">
                        No results found for &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  ) : (
                    <>
                      {results.users.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 mb-2 flex justify-between">
                            People
                            <Link
                              href={`/friends?search=${searchQuery}`}
                              className="text-blue-500 text-xs"
                            >
                              See all
                            </Link>
                          </h4>
                          <UsersSearchResults
                            users={results.users.slice(0, 3)}
                          />
                        </div>
                      )}

                      {results.posts.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 mb-2 flex justify-between">
                            Posts
                            <Link
                              href={`/post?search=${searchQuery}`}
                              className="text-blue-500 text-xs"
                            >
                              See all
                            </Link>
                          </h4>
                          <PostsSearchResults
                            posts={results.posts.slice(0, 2)}
                            searchQuery={searchQuery}
                          />
                        </div>
                      )}

                      {results.videos.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 mb-2 flex justify-between">
                            Videos
                            <Link
                              href={`/watch-videos?search=${searchQuery}`}
                              className="text-blue-500 text-xs"
                            >
                              See all
                            </Link>
                          </h4>
                          <VideosSearchResults
                            videos={results.videos.slice(0, 2)}
                          />
                        </div>
                      )}

                      {results.marketplace.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 mb-2 flex justify-between">
                            Marketplace
                            <Link
                              href={`/marketplace?search=${searchQuery}`}
                              className="text-blue-500 text-xs"
                            >
                              See all
                            </Link>
                          </h4>
                          <MarketplaceSearchResults
                            items={results.marketplace.slice(0, 2)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="people">
                  <UsersSearchResults users={results.users} />
                </TabsContent>

                <TabsContent value="posts">
                  <PostsSearchResults
                    posts={results.posts}
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="videos">
                  <VideosSearchResults videos={results.videos} />
                </TabsContent>

                <TabsContent value="marketplace">
                  <MarketplaceSearchResults items={results.marketplace} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
