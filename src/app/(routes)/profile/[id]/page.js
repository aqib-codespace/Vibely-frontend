"use client";
import Layout from "@/app/layout/layout";
import FriendsProfilePage from "@/modules/friends/friends-profile";
import { useParams } from "next/navigation";
import React from "react";

const FriendsProfile = () => {
  const { id } = useParams();
  return (
    <>
      <Layout>
        <FriendsProfilePage id={id} />
      </Layout>
    </>
  );
};

export default FriendsProfile;
