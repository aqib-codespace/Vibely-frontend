"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { Loader } from "rizzui";
import { BiImageAdd } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { IoIosCamera } from "react-icons/io";
import { uploadProfilePictureApi } from "@/app/api/userApis";
import { setUser } from "@/store/authSlice";

const UploadProfilePicture = ({ profilePicture }) => {
  const [preview, setPreview] = useState(profilePicture?.url || profilePicture);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const profilePicture = acceptedFiles[0];
      const formData = new FormData();
      formData.append("profilePicture", profilePicture);

      setPreview(URL.createObjectURL(profilePicture));
      setLoading(true);
      try {
        const response = await uploadProfilePictureApi(formData);
        toast.success("Profile picture uploaded successfully");
        if (response?.data) {
          dispatch(
            setUser({
              ...user,
              profilePicture: {
                url: response?.data?.url || "",
                public_id: response?.data?.public_id || "",
              },
            })
          );
        }
      } catch (error) {
        toast.error("Error uploading profile picture");
        console.error("Error uploading profile picture:", error);
      } finally {
        setLoading(false);
      }
    },
    [uploadProfilePictureApi, user, dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`w-32 h-32 rounded-full flex justify-center items-center text-center cursor-pointer relative group ${
        isDragActive ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative">
          <img
            src={typeof preview === "string" ? preview : preview?.url}
            alt="Profile Picture"
            className="w-32 h-32  rounded-full object-cover mx-auto"
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
      <div className="absolute bottom-3 right-0 bg-gray-50 p-1 rounded-full border border-gray-300">
        <IoIosCamera className="h-6 w-6" />
      </div>
    </div>
  );
};

export default UploadProfilePicture;
