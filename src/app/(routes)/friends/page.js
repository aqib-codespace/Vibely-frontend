import Layout from "@/app/layout/layout";
import PublicFriends from "@/modules/friends";
import React from "react";

const page = () => {
  return (
    <Layout>
      <div>
        <PublicFriends />
      </div>
    </Layout>
  );
};

export default page;
