import Header from "@/app/layout/header";
import ProfilePosts from "@/modules/profile-setting/profile-post";
import React from "react";

const ProfilePostPage = () => {
  return (
    <>
      <div>
        <Header />
        <ProfilePosts />
      </div>
    </>
  );
};

export default ProfilePostPage;
