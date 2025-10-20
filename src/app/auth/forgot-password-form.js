"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import forgotPasswordSchema from "@/validations/forgot-password-schema";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { AuthRightSide } from "@/components/auth/AuthShared";
import { forgetPasswordApi } from "../api/userApis";

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgetPasswordApi(data);
      toast.success("Reset code sent to your email!");
      localStorage.setItem("resetEmail", data.email);
      router.push("/otp-verify");
    } catch (error) {
      console.error("Error sending reset code:", error);
      toast.error("Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center bg-white px-6 md:px-16">
        <div className="w-full ">
          <div className="mb-8">
            <div className="flex items-center  mb-8 -ml-2">
              <button
                onClick={() => router.push("/signin")}
                className="cursor-pointer rounded-lg hover:bg-gray-100 p-2 transition-colors text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeftLong size={20} />
              </button>
              <Image src="/logo.png" alt="Logo" width={180} height={50} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600 mb-6">
              Enter your email address and we&apos;ll send you a verification code to
              reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <label className="font-medium text-gray-700 block mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="e.g. john@example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 cursor-pointer text-white py-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Code...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Send Reset Code
                  <FaArrowRightLong className="ml-2" />
                </div>
              )}
            </button>

            <div className="text-sm text-center text-gray-600">
              Remember your password?{" "}
              <a
                href="/signin"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign In
              </a>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex w-full bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 relative overflow-hidden">
        <AuthRightSide />
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
