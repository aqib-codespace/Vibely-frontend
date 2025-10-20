import Header from "@/app/layout/header";
import AccountSettings from "@/modules/account-settings";
import React from "react";

const AccountSettingsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <AccountSettings />
      </div>
    </div>
  );
};

export default AccountSettingsPage;
