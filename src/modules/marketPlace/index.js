"use client";

import React, { useEffect, useState } from "react";
import ProductUpload from "./create-product";
import ProductCard from "./products-card";
import { fetchAllProducts } from "@/app/api/marketPlace";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "rizzui";
import MyProducts from "./my-products";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MarketPlaceMain = () => {
  const [tab, setTab] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === "all") {
      FetchProducts(1);
    }
  }, [tab]);

  const FetchProducts = async (pageNum = 1) => {
    setLoading(true);
    if (pageNum === 1) setPage(1);
    try {
      const response = await fetchAllProducts(pageNum, limit);
      if (pageNum === 1) {
        setProducts(response.items || []);
      } else {
        setProducts((prev) => [...prev, ...(response.items || [])]);
      }
      setTotalPages(response.totalPages);
      setHasMore(pageNum < response.totalPages);
    } catch (error) {
      setHasMore(false);
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] bg-gray-50">
      <div className="sticky top-0 z-50 w-full left-0 right-0 bg-white  rounded-lg backdrop-blur border-b border-gray-100 shadow-sm">
        <div className=" px-3 sm:px-4 md:px-8 py-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4">
            <Tabs
              value={tab}
              onValueChange={setTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-white/90 border border-gray-100 rounded-full shadow flex w-full sm:w-auto gap-1 sm:gap-2 py-2 sm:py-3 ">
                <TabsTrigger
                  value="all"
                  className="flex-1 sm:flex-none px-4 sm:px-5 md:px-6 py-3 md:py-4 rounded-full text-sm sm:text-base font-semibold data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all whitespace-nowrap"
                >
                  All Products
                </TabsTrigger>
                <TabsTrigger
                  value="mine"
                  className="flex-1 sm:flex-none px-4 sm:px-5 md:px-6 py-3 md:py-4 rounded-full text-sm sm:text-base font-semibold data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all whitespace-nowrap"
                >
                  My Products
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 md:px-7 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-full font-bold transition-all text-sm sm:text-base md:text-lg shadow-md"
              onClick={() => setUploadModalOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hidden sm:inline-block"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              <span>Create Product</span>
            </button>
          </div>
        </div>
      </div>
      <ProductUpload
        open={uploadModalOpen}
        setOpen={setUploadModalOpen}
        FetchProducts={FetchProducts}
      />
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {tab === "all" && (
          <AllProductsView
            FetchProducts={FetchProducts}
            products={products}
            setProducts={setProducts}
            totalPages={totalPages}
            hasMore={hasMore}
            setHasMore={setHasMore}
            uploadModalOpen={uploadModalOpen}
            setUploadModalOpen={setUploadModalOpen}
          />
        )}
        {tab === "mine" && (
          <MyProducts
            uploadModalOpen={uploadModalOpen}
            setUploadModalOpen={setUploadModalOpen}
          />
        )}
      </div>
    </div>
  );
};

const AllProductsView = ({
  uploadModalOpen,
  setUploadModalOpen,
  FetchProducts,
  products,
  setProducts,
  totalPages,
  hasMore,
  setHasMore,
}) => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchMoreData = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      FetchProducts(nextPage);
    } else {
      setHasMore(false);
    }
  };

  return (
    <>
      <InfiniteScroll
        dataLength={products.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-lg shadow bg-white py-6">
            <Loader variant="threeDot" size="sm" className="text-gray-800" />
            <p className="text-gray-600 text-sm font-medium">
              Fetching more products...
            </p>
          </div>
        }
        endMessage={
          products.length > 0 && page>1 && !hasMore && !loading && (
          <div className="text-center absolute md:relative   bottom-10 md:bottom-0 md:mt-16  w-full py-6 bg-white rounded-lg shadow text-gray-600">
            <p className="text-lg font-semibold">
              🎉 You’ve seen all products!
            </p>
            <p className="text-sm mt-1">Check back later for new items.</p>
          </div>
          )
        }
        scrollThreshold={0.8}
      >
        <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3  gap-6">
          {products.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      </InfiniteScroll>
      {!loading && products.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-lg">
          No products found.
        </div>
      )}
    </>
  );
};

export default MarketPlaceMain;
