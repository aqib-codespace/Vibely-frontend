import React, { useEffect, useState } from "react";
import ProductCard from "./products-card";
import { getUserProducts } from "@/app/api/marketPlace";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "rizzui";
import { useSelector } from "react-redux";

const MyProducts = ({ uploadModalOpen, setUploadModalOpen }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const FetchProducts = async (pageNum = 1) => {
    setLoading(true);
    if (pageNum === 1) setPage(1);
    try {
      const response = await getUserProducts(user?._id, pageNum, limit);
      if (pageNum === 1) {
        setProducts(response.items || []);
      } else {
        setProducts((prev) => [...prev, ...(response.items || [])]);
      }
      setTotalPages(response.totalPages);
      setHasMore(pageNum < response.totalPages);
    } catch (error) {
      setHasMore(false);
      console.error("Error fetching my products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      FetchProducts(nextPage);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (user?._id) FetchProducts(1);
  }, [user?._id]);

  return (
    <div>
      <InfiniteScroll
        dataLength={products.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="text-center w-full flex flex-col gap-2 justify-center items-center rounded-2xl shadow bg-white py-10 mt-4">
            <Loader variant="threeDot" size="md" className="text-gray-500" />
            <p className="text-gray-600 text-base font-medium">
              Fetching more products...
            </p>
          </div>
        }
        endMessage={
          <div className="text-center w-full py-10 bg-white rounded-2xl shadow text-gray-600 mt-4">
            <p className="text-xl font-bold mb-1">
              🎉 You’ve seen all your products!
            </p>
            <p className="text-base">Create more to grow your shop.</p>
          </div>
        }
        scrollThreshold={0.8}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-10">
          {products.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      </InfiniteScroll>
      {!loading && products.length === 0 && (
        <div className="text-center py-24 text-gray-500 text-lg flex flex-col items-center gap-8">
          <img
            src="/not-found.png"
            alt="No products"
            className="w-40 h-40 opacity-60 mb-2"
          />
          <div className="text-2xl font-bold text-gray-700">
            No products found
          </div>
          <div className="text-base text-gray-500 mb-2">
            Start by creating your first product!
          </div>
          <button
            className="px-7 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-full font-bold shadow-xl transition-all text-lg"
            onClick={() => setUploadModalOpen(true)}
          >
            + Create Product
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
