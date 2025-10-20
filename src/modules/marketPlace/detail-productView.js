"use client";

import { deleteProductById, fetchProductById } from "@/app/api/marketPlace";
import { getUserByIdApi } from "@/app/api/userApis";
import React, { useEffect, useState, useRef } from "react";
import { ActionIcon, Button, Dropdown } from "rizzui";
import toast from "react-hot-toast";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { FaRegBookmark } from "react-icons/fa";
import { MdOutlineMessage } from "react-icons/md";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import {
  FaArrowLeftLong,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";
import MarketplaceChatButton from "@/components/MarketplaceChatButton";

const SlickSlider = dynamic(() => import("react-slick"), { ssr: false });
const ProductUpload = dynamic(() => import("./create-product"), { ssr: false });

const ProductDetailView = ({ id }) => {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);

  const {
    name,
    price,
    images = [],
    userId,
    createdAt,
    description,
    category,
  } = product || {};

  const fetchProductDetails = async (productId) => {
    try {
      const response = await fetchProductById(productId);
      const item = response?.item || null;
      setProduct(item);
      if (item?.userId?._id) {
        try {
          const userRes = await getUserByIdApi(item.userId._id);
          setSellerInfo(userRes?.data || null);
        } catch (e) {
          setSellerInfo(null);
        }
      } else {
        setSellerInfo(null);
      }
    } catch (error) {
      setProduct(null);
      setSellerInfo(null);
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchProductDetails(id);
    }
  }, [id]);

  const handleDeleteProduct = async () => {
    if (!product?._id) return;
    setDeleteLoading(true);
    try {
      await deleteProductById(product._id);
      toast.success("Product deleted successfully");
      router.push("/marketplace");
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-500">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-500">Product not found.</div>
      </div>
    );
  }

  const isOwner = Boolean(
    currentUser &&
      (currentUser._id === userId?._id ||
        currentUser._id === userId ||
        currentUser.id === userId?._id)
  );
  const seller = userId?.firstName || userId?.userName || "Unknown";
  const sellerFull =
    userId?.firstName && userId?.lastName
      ? `${userId.firstName} ${userId.lastName}`
      : seller;
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const PrevArrow = ({ className, style, onClick }) => {
    return (
      <button
        aria-label="Previous"
        onClick={onClick}
        className="hidden md:flex absolute z-20 top-1/2 -translate-y-1/2 left-[-56px] md:left-[-72px] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 shadow items-center justify-center text-gray-700 hover:bg-white"
      >
        <FaChevronLeft />
      </button>
    );
  };

  const NextArrow = ({ className, style, onClick }) => {
    return (
      <button
        aria-label="Next"
        onClick={onClick}
        className="hidden md:flex absolute z-20 top-1/2 -translate-y-1/2 right-[-56px] md:right-[-72px] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 shadow items-center justify-center text-gray-700 hover:bg-white"
      >
        <FaChevronRight />
      </button>
    );
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: images.length > 1,
    adaptiveHeight: true,
    autoplay: images.length > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true,
          swipeToSlide: true,
        },
      },
    ],
  };

  return (
    <div className="min-h-[90vh]  mt-20 relative w-full flex flex-col md:flex-row bg-black/80">
      <div className="md:w-2/3 w-full flex items-center justify-center min-h-[500px] bg-gray-100/90 relative">
        <Button
          onClick={() => router.back()}
          className="absolute cursor-pointer flex items-center gap-2 top-10 sm:top-6 sm:left-5 left-7 bg-gray-800 text-white"
        >
          <FaArrowLeftLong />
          Marketplace
        </Button>
        <div className="w-full max-w-2xl mx-auto">
          {images.length > 1 ? (
            <div className="relative px-8 md:px-12">
              <SlickSlider {...sliderSettings}>
                {images.map((img, idx) => (
                  <div
                    key={img._id || idx}
                    className="flex items-center justify-center sm:h-[500px] h-[300px] bg-black rounded-lg overflow-hidden px-6 md:px-12"
                  >
                    <img
                      src={img.url}
                      alt={name}
                      className="object-contain w-full h-full"
                      loading="lazy"
                    />
                  </div>
                ))}
              </SlickSlider>
            </div>
          ) : (
            <div className="w-full sm:h-[500px] h-[300px] bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={images[0]?.url || "/not-found.png"}
                alt={name}
                className="object-contain w-full h-full"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      <div className="md:w-1/3 w-full bg-white min-h-[500px] flex flex-col shadow-xl px-6 py-8 gap-6 relative z-10">
        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
              <span className="text-blue-600 font-bold text-xl">${price}</span>
            </div>
            {isOwner && (
              <div className="ml-auto text-gray-700 bg-gray-100 p-1 rounded-lg cursor-pointer">
                <Dropdown placement="bottom-end">
                  <Dropdown.Trigger>
                    <ActionIcon
                      variant="outline"
                      className={` border-none  cursor-pointer`}
                      rounded="full"
                    >
                      <HiOutlineDotsHorizontal className="h-5 w-5" />
                    </ActionIcon>
                  </Dropdown.Trigger>
                  <Dropdown.Menu className="border-none shadow w-44 bg-gray-50 ">
                    <div className="my-2 border-b">
                      <Dropdown.Item>
                        <div
                          onClick={() => setEditModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-gray-100 rounded-md cursor-pointer"
                        >
                          <MdOutlineEdit className="h-4 w-4 text-gray-500" />
                          Edit
                        </div>
                      </Dropdown.Item>
                    </div>
                    <div className="my-2">
                      <Dropdown.Item>
                        <div
                          onClick={() => {
                            setDeleteModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-gray-100 rounded-md cursor-pointer text-red-600"
                        >
                          <MdDeleteOutline className="h-4 w-4 text-red-500" />
                          Delete
                        </div>
                      </Dropdown.Item>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">Listed on {date}</div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-base text-gray-800 font-semibold">
            Description
          </div>
          <div className="text-gray-700 text-sm whitespace-pre-line break-words">
            {description}
          </div>
        </div>

        <div className="mt-4 border-t pt-4 flex flex-col gap-2">
          <div className="text-base text-gray-800 font-semibold">Seller</div>
          <div className="flex items-center gap-3">
            {sellerInfo?.profilePicture ? (
              <img
                src={sellerInfo.profilePicture.url}
                alt={sellerFull}
                className="w-12 h-12 rounded-full object-cover border"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl font-bold border">
                {sellerFull?.[0] || "?"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-gray-900 font-semibold">{sellerFull}</span>
              {sellerInfo?.userName && (
                <span className="text-gray-500 text-xs">
                  @{sellerInfo.userName}
                </span>
              )}
            </div>
          </div>
          {sellerInfo?.bio && (
            <div className="text-gray-600 text-xs mt-1">{sellerInfo.bio}</div>
          )}
          <div className="flex gap-2 mt-3">
            {!isOwner && (
              <MarketplaceChatButton
                productId={product?._id}
                sellerId={userId?._id || userId}
                sellerName={sellerInfo?.firstName}
                productName={name}
                className="flex-1"
              />
            )}

            {!isOwner && (
              <button className="p-2 border rounded-lg hover:bg-gray-100 text-gray-500">
                <FaRegBookmark size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-100/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white flex flex-col justify-center items-center rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Delete Product
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* edit modal - reuse create modal in edit mode */}
      <ProductUpload
        FetchProducts={() => fetchProductDetails(product?._id)}
        open={editModalOpen}
        setOpen={setEditModalOpen}
        isEdit={true}
        editData={product}
      />
    </div>
  );
};

export default ProductDetailView;
