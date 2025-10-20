"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import resetPasswordSchema from "@/validations/reset-password-schema";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong, FaEye, FaEyeSlash } from "react-icons/fa6";
import { AuthRightSide } from "@/components/auth/AuthShared";
import { resetPasswordApi } from "../api/userApis";

const ResetPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    const storedCode = localStorage.getItem("resetCode");

    if (!storedEmail || !storedCode) {
      toast.error("Please complete the verification process first");
      router.push("/forget-password");
      return;
    }

    setEmail(storedEmail);
    setResetCode(storedCode);
  }, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const resetData = {
        email: email,
        code: resetCode,
        confirmPassword: data.confirmPassword,
        newPassword: data.password,
      };

      await resetPasswordApi(resetData);
      toast.success("Password reset successfully!");
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetCode");

      router.push("/signin");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center bg-white px-6 md:px-16">
        <div className="w-full ">
          <div className="mb-8">
            <div className="flex items-center  mb-8 -ml-2">
              <button
                onClick={() => router.push("/otp-verify")}
                className="cursor-pointer rounded-lg hover:bg-gray-100 p-2 transition-colors text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeftLong size={20} />
              </button>
              <Image src="/logo.png" alt="Logo" width={180} height={50} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 mb-6">
              Enter your new password to complete the reset process.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <label className="font-medium text-gray-700 block mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="font-medium text-gray-700 block mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
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
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
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

export default ResetPasswordForm;
