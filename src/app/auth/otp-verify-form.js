"use client";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import otpVerifySchema from "@/validations/otp-verify-schema";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { AuthRightSide } from "@/components/auth/AuthShared";
import { verifyOtpApi } from "../api/userApis";

const OtpVerifyForm = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const otpRefs = useRef([]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(otpVerifySchema),
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      toast.error("Please request a reset code first");
      router.push("/forget-password");
      return;
    }
    setEmail(storedEmail);

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pastedValue = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pastedValue.length && index + i < 6; i++) {
        newOtp[index + i] = pastedValue[i];
      }
      setOtp(newOtp);
      setValue("otp", newOtp.join(""));
      const nextIndex = Math.min(index + pastedValue.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setValue("otp", newOtp.join(""));
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await verifyOtpApi({ email, code: data.otp });
      toast.success("OTP verified! You can now reset your password.");
      localStorage.setItem("resetCode", data.otp);
      router.push("/reset-password");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setResendLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("New verification code sent!");
      setResendTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setValue("otp", "");
      otpRefs.current[0]?.focus();

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center bg-white px-6 md:px-16">
        <div className="w-full">
          <div className="mb-8">
            <div className="flex items-center  mb-8 -ml-2">
              <button
                onClick={() => router.push("/forget-password")}
                className="cursor-pointer rounded-lg hover:bg-gray-100 p-2 transition-colors text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeftLong size={20} />
              </button>
              <Image src="/logo.png" alt="Logo" width={180} height={50} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a 6-digit verification code to{" "}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="font-medium text-gray-700 block mb-4">
                Enter Verification Code
              </label>
              <div className="flex justify-between gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="md:w-16 md:h-12 w-10 h-10 text-center text-xl font-semibold bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    maxLength={6}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="text-red-500 text-sm">{errors.otp.message}</p>
              )}
            </div>

            <button
              disabled={loading || otp.join("").length !== 6}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Verify OTP
                  <FaArrowRightLong className="ml-2" />
                </div>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn&apos;t receive the code?
              </p>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend available in {formatTime(resendTimer)}
                </p>
              )}
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

export default OtpVerifyForm;
