"use client";

import { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ProfileHeader } from "./profile-header";
import { useSelector } from "react-redux";
import passwordFormSchema from "@/validations/change-password.scehma";

const PasswordSettingsForm = () => {
  const user = useSelector((state) => state.auth.user);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmedPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // await changePassword(data.newPassword, data.confirmedPassword);
      // reset();
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  return (
    <>
      <ProfileHeader
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
        profilePicture={user?.profilePicture}
        showUploadOnHover={false}
      />

      <form
        id="password-settings-form"
        onSubmit={handleSubmit(onSubmit)}
        className=" w-full mt-8"
      >
        <div className=" ">
          <div className="mb-8 border-b pb-8 border-dashed">
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <>
                  <div className="flex max-w-3xl  items-center justify-between">
                    <label className="w-full text-lg font-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...field}
                      placeholder="Enter your current password"
                      error={errors.currentPassword?.message}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            />
          </div>

          <div className="mb-8 border-b pb-8 border-dashed">
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <>
                  <div className="flex max-w-3xl  items-center justify-between">
                    <label className="w-full text-lg font-medium">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...field}
                      placeholder="Enter a new password"
                      error={errors.newPassword?.message}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            />
          </div>

          <div className="mb-8 border-b pb-8 border-dashed">
            <Controller
              name="confirmedPassword"
              control={control}
              render={({ field }) => (
                <>
                  <div className="flex max-w-3xl items-center justify-between">
                    <label className="w-full text-lg font-medium">
                      {" "}
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...field}
                      placeholder="Re-enter your new password"
                      error={errors.confirmedPassword?.message}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="flex w-auto items-center justify-end gap-3">
            <button type="button" variant="outline">
              Cancel
            </button>
            <button type="submit" variant="solid" isLoading={loading}>
              Update Password
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default PasswordSettingsForm;
