"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { Loader } from "rizzui";
import { BiImageAdd } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { IoIosCamera } from "react-icons/io";
import { uploadCoverPhotoApi } from "@/app/api/userApis";
import { setUser } from "@/store/authSlice";

const UploadCoverImage = ({ coverImage }) => {
  const [preview, setPreview] = useState(coverImage?.url || coverImage);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const coverImage = acceptedFiles[0];
      const formData = new FormData();
      formData.append("coverImage", coverImage);

      setPreview(URL.createObjectURL(coverImage));
      setLoading(true);
      try {
        const response = await uploadCoverPhotoApi(formData);
        toast.success("Cover Image uploaded successfully");
        if (response?.data) {
          dispatch(
            setUser({
              ...user,
              coverImage: {
                url: response?.data?.url || "",
                public_id: response?.data?.public_id || "",
              },
            })
          );
        }
      } catch (error) {
        toast.error("Error uploading Cover Image");
        console.error("Error uploading Cover Image:", error);
      } finally {
        setLoading(false);
      }
    },
    [uploadCoverPhotoApi, user, dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full h-64 flex justify-center items-center text-center cursor-pointer relative group ${
        isDragActive ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative  w-full">
          <img
            src={typeof preview === "string" ? preview : preview?.url}
            alt="Profile Picture"
            className="w-full object-contain"
          />
          {loading && (
            <Loader
              variant="spinner"
              size="xl"
              className="absolute text-white top-12 left-10"
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col  justify-center items-center">
          <BiImageAdd size={40} className="text-blue-700" />
        </div>
      )}
      <div className="absolute flex items-center rounded-sm bg-gray-50 gap-2  bottom-3 right-4 p-1  border border-gray-300">
        <IoIosCamera className="h-6 w-6" />
        <p className="text-xs md:block hidden">Edit Cover Image</p>
        <p className="text-xs block md:hidden">Edit </p>
      </div>
    </div>
  );
};

export default UploadCoverImage;
