import Header from "@/app/layout/header";
import ProductDetailView from "@/modules/marketPlace/detail-productView";
import React from "react";

const page = ({ params }) => {
  const { id } = params;

  return (
    <>
      <Header />
      <ProductDetailView id={id} />
    </>
  );
};

export default page;
