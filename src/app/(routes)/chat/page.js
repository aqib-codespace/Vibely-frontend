import Header from "@/app/layout/header";
import Layout from "@/app/layout/layout";
import ChatMainPage from "@/modules/chat";
import React from "react";

const page = ({ searchParams }) => {
  const activeTab = searchParams?.tab || "friends";

  return (
    <>
      <Header />
      <div className="mt-23">
        <ChatMainPage activeTab={activeTab} />
      </div>
    </>
  );
};

export default page;
