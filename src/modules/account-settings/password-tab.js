"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "rizzui";
import { useSelector } from "react-redux";
import passwordFormSchema from "@/validations/change-password.scehma";
import { changePasswordApi } from "@/app/api/userApis";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Shield,
  Key,
  CheckCircle,
  AlertTriangle,
  Lock,
} from "lucide-react";

const PasswordTab = () => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const user = useSelector((state) => state.auth.user);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmedPassword: "",
    },
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await changePasswordApi({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully!");
      reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(
        error.message || "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const newPassword = watch("newPassword");

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: "", color: "" },
      { strength: 1, label: "Very Weak", color: "bg-red-500" },
      { strength: 2, label: "Weak", color: "bg-orange-500" },
      { strength: 3, label: "Fair", color: "bg-yellow-500" },
      { strength: 4, label: "Good", color: "bg-blue-500" },
      { strength: 5, label: "Strong", color: "bg-green-500" },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="  bg-white">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Password & Security
          </h2>
        </div>
        <p className="text-gray-600">
          Keep your account secure by using a strong password
        </p>
      </div>

      <form
        id="password-settings-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Lock className="w-4 h-4" />
            Current Password
          </label>
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  error={errors.currentPassword?.message}
                  className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Key className="w-4 h-4" />
            New Password
          </label>
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    {...field}
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter a new password"
                    error={errors.newPassword?.message}
                    className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CheckCircle className="w-4 h-4" />
            Confirm New Password
          </label>
          <Controller
            name="confirmedPassword"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  error={errors.confirmedPassword?.message}
                  className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 ">
          <Button
            type="button"
            variant="outline"
            className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Update Password
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordTab;
