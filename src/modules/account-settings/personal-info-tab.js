"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, Textarea } from "rizzui";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/authSlice";
import { updateUserProfileApi } from "@/app/api/userApis";
import profileFormSchema from "@/validations/profile-scehma";
import toast from "react-hot-toast";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

const statusOptions = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "In a relationship", value: "in_a_relationship" },
  { label: "It's complicated", value: "its_complicated" },
];

const PersonalInfoTab = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      userName: user?.userName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      gender: user?.gender || "",
      status: user?.status || "",
      dateOfBirth: user?.dateOfBirth || "",
      address: user?.address || "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateUserProfileApi(data);

      const updatedUser = { ...user, ...data };
      dispatch(setUser(updatedUser));
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const watchedValues = watch();
  const hasChanges = Object.keys(watchedValues).some(
    (key) => watchedValues[key] !== (user?.[key] || "")
  );

  return (
    <div className=" bg-white">
      <div className="mb-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Personal Info</h2>
        </div>
        <p className="text-gray-600">
          Update your photo and personal details here
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex my-8 w-full items-center justify-between gap-6">
          <label className="text-md w-full md:w-1/4 font-semibold text-gray-900">
            Full Name
          </label>

          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Muhammad"
                    error={errors.firstName?.message}
                    className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Aqib"
                    error={errors.lastName?.message}
                    className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex my-8 w-full items-center justify-between gap-6">
          <label className="text-md w-full md:w-1/4 font-semibold text-gray-900">
            User Name
          </label>
          <div className="space-y-2 w-full">
            <Controller
              name="userName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="aqibdev"
                  error={errors.userName?.message}
                  className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}
            />
          </div>
        </div>
        <div className="flex my-8 w-full items-center justify-between gap-6">
          <label className="text-md w-full md:w-1/4 font-semibold text-gray-900">
            Email
          </label>
          <div className="space-y-2 w-full">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="aqib@dev.com"
                    type="email"
                    readOnly
                    error={errors.email?.message}
                    className="w-full h-12   border-gray-300"
                  />
                </div>
              )}
            />
          </div>
        </div>
        <div className="flex my-8 w-full items-center justify-between gap-6">
          <label className="text-md w-full md:w-1/4 font-semibold text-gray-900">
            Gender
          </label>
          <div className="space-y-2 w-full">
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={genderOptions}
                  placeholder="Male"
                  value={genderOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(option) => field.onChange(option?.value || "")}
                  className="w-full"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      height: "48px",
                      minHeight: "48px",
                      borderColor: "#d1d5db",
                      "&:hover": { borderColor: "#3b82f6" },
                      "&:focus-within": {
                        borderColor: "#3b82f6",
                        boxShadow: "0 0 0 1px #3b82f6",
                      },
                    }),
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className="flex my-8 w-full items-center justify-between gap-6">
          <label className="text-md w-full md:w-1/4 font-semibold text-gray-900">
            Status
          </label>
          <div className="space-y-2 w-full">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={statusOptions}
                  placeholder="It's complicated"
                  value={statusOptions.find(
                    (option) => option.value === field.value
                  )}
                  onChange={(option) => field.onChange(option?.value || "")}
                  className="w-full"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      height: "48px",
                      minHeight: "48px",
                      borderColor: "#d1d5db",
                      "&:hover": { borderColor: "#3b82f6" },
                      "&:focus-within": {
                        borderColor: "#3b82f6",
                        boxShadow: "0 0 0 1px #3b82f6",
                      },
                    }),
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className="flex my-8 w-full items-center justify-between gap-6">
          <label className="text-md w-full md:w-1/4 font-semibold text-gray-900">
            Date of Birth
          </label>
          <div className="space-y-2 w-full">
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  placeholder="mm/dd/yyyy"
                  error={errors.dateOfBirth?.message}
                  className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}
            />
          </div>
        </div>
        <div className="flex my-8 w-full items-center justify-between gap-6">
          <label className="text-md w-full md:w-1/4 font-semibold text-gray-900">
            Address
          </label>
          <div className="space-y-2 w-full">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Shah Din Road"
                  error={errors.address?.message}
                  className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}
            />
          </div>
        </div>
        <div className="flex my-8 w-full items-center justify-between gap-6">
          <label className="text-md w-full md:w-1/4 font-semibold text-gray-900">
            Bio
          </label>
          <div className="space-y-2 w-full">
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="A short bio of yourself"
                  rows={4}
                  error={errors.bio?.message}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              )}
            />
          </div>
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
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>Save Changes</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoTab;
