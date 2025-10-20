"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import signupSchema from "@/validations/signup-schema";
import Image from "next/image";
import { signUpApi } from "../api/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong, FaEye, FaEyeSlash } from "react-icons/fa6";
import { AuthRightSide } from "@/components/auth/AuthShared";

const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await signUpApi(data);

      localStorage.setItem("verificationEmail", data.email);

      if (response.success) {
        toast.success(
          response.message ||
            "Registration successful! Please check your email for verification code."
        );
        router.push("/verify-email");
      } else {
        if (response.emailError) {
          toast.warning(response.message);
          router.push("/verify-email");
        } else {
          toast.success("User registered successfully!");
          router.push("/signin");
        }
      }
    } catch (error) {
      console.error("Error registering user:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";

      if (errorMessage.toLowerCase().includes("already exists")) {
        toast.error("User already exists. Please try signing in instead.");
      } else if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("verification")
      ) {
        localStorage.setItem("verificationEmail", data.email);
        router.push("/verify-email");
        toast.warning(
          "Please verify your email address to complete registration."
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center bg-white px-6 md:px-12">
        <div className="w-full ">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8 -ml-2">
              <button className=" cursor-pointer rounded-lg transition-colors text-gray-600">
                <Image src="/logo.png" alt="Logo" width={180} height={50} />
              </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sign Up To Get Started
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="font-medium">First Name</label>
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="e.g. Daniel"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="font-medium">Last Name</label>
                <input
                  type="text"
                  {...register("lastName")}
                  placeholder="e.g. Ahmadi"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="font-medium">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="e.g. daniel@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="font-medium">Username</label>
                <input
                  type="text"
                  {...register("userName")}
                  placeholder="e.g. danielahmadi123"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="font-medium">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="*******"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4  bottom-3  text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="font-medium">Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="*******"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4  bottom-3  text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing Up...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign Up
                  <FaArrowLeftLong className="ml-2 transform rotate-180" />
                </div>
              )}
            </button>

            <div className="text-sm text-center text-gray-600 mt-4">
              Already have an account?{" "}
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

export default SignUpForm;
