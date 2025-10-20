import Header from "@/app/layout/header";
import MarketplaceChatMainPage from "@/modules/marketPlace/marketplace-chat";
import React from "react";

const MarketplaceChatPage = () => {
  return (
    <>
      <Header />
      <div className="mt-24">
        <MarketplaceChatMainPage />
      </div>
    </>
  );
};

export default MarketplaceChatPage;
