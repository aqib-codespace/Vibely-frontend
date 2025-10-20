"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import loginSchema from "@/validations/signin-schema";
import Image from "next/image";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signInApi } from "../api/auth";
import { FaArrowLeftLong, FaEye, FaEyeSlash } from "react-icons/fa6";
import { AuthRightSide } from "@/components/auth/AuthShared";

const SignInForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await dispatch(signInApi(data));
      console.log("Sign in result:", result);
      if (result.type === "users/signIn/fulfilled") {
        toast.success("User signed in successfully!");

        const redirectPath = localStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin");
          router.push(redirectPath);
        } else {
          router.push("/");
        }
      } else {
        const errorMessage = result.payload || "Sign in failed";

        if (
          errorMessage.toLowerCase().includes("email not verified") ||
          errorMessage.toLowerCase().includes("verify your email")
        ) {
          toast.error("Please verify your email address before signing in.");
          localStorage.setItem("verificationEmail", data.email);
          router.push("/verify-email");
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error signing in user:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Sign in failed";

      if (
        errorMessage.toLowerCase().includes("email not verified") ||
        errorMessage.toLowerCase().includes("verify your email")
      ) {
        toast.error("Please verify your email address before signing in.");
        localStorage.setItem("verificationEmail", data.email);
        router.push("/verify-email");
      } else {
        toast.error("Error signing in: " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center bg-white px-4 md:px-16">
        <div className="w-full ">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8 -ml-2">
              <button className=" cursor-pointer rounded-lg transition-colors text-gray-600">
                <Image src="/logo.png" alt="Logo" width={180} height={50} />
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sign In To Continue.
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <label className="font-medium">Email</label>
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

            <div className="relative">
              <label className="font-medium ">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="*******"
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4  bottom-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <a
                href="/forget-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign In
                  <FaArrowLeftLong className="ml-2 transform rotate-180" />
                </div>
              )}
            </button>
            <div className="text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex  w-full bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 relative overflow-hidden">
        <AuthRightSide />
      </div>
    </div>
  );
};

export default SignInForm;
