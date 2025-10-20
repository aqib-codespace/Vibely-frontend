"use client";
import ChatMainPage from "@/modules/chat";
import Header from "@/app/layout/header";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

const SingleUserChaat = () => {
  const { id } = useParams();
  const search = useSearchParams();
  const product = search?.get("product") || null;
  const productName = search?.get("productName") || null;

  return (
    <>
      <Header />
      <div className="mt-24 ">
        <ChatMainPage
          userId={id}
          productRef={{ id: product, name: productName }}
        />
      </div>
    </>
  );
};

export default SingleUserChaat;
