"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PersonalInfoTab from "./personal-info-tab";
import PasswordTab from "./password-tab";
import { useSelector } from "react-redux";

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("details");
  const user = useSelector((state) => state.auth.user);

  const tabs = [
    {
      id: "details",
      label: "Personal Info",
    },
    {
      id: "password",
      label: "Password & Security",
    },
  ];

  const TabComponents = {
    details: PersonalInfoTab,
    password: PasswordTab,
  };

  return (
    <div className="min-h-screen bg-white  py-8">
      <div className=" w-[94%] mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Account Settings
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 mb-8">
            <TabsList className="h-auto p-0 bg-transparent space-x-8">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-0 py-3 border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-900 font-medium bg-transparent rounded-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => {
            const TabComponent = TabComponents[tab.id];
            return (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="mt-0 focus-visible:outline-none"
              >
                <TabComponent />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default AccountSettings;
