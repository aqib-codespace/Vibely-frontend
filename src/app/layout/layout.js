import React from "react";
import Header from "./header";
import Sidebar from "./sidebar";

import MessagesSection from "./chat";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <Sidebar />

      <div className="flex justify-center items-start min-h-screen">
        <main
          id="feed-scroll"
          className="w-full mt-32 md:mt-28 overflow-y-auto custom-scrollbar-hidden min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-7rem)] h-[calc(100vh-8rem)] md:h-[calc(100vh-7rem)] md:ml-[18rem] mx-4 md:mr-4"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
