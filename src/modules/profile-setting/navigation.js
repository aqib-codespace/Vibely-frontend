"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    label: "Posts",
    value: "/profile-setting/posts",
  },

  {
    label: "Friends",
    value: "/profile-setting/friends",
  },

  {
    label: "Photos",
    value: "/profile-setting/photos",
  },
  {
    label: "Saved Videos",
    value: "/profile-setting/saved-videos",
  },
];

export default function ProfileSettingsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(pathname);

  const handleTabChange = (val) => {
    setActiveTab(val);
    router.prefetch(val);
    router.push(val);
  };

  return (
    <div className="w-full">
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-full gap-2 sm:gap-3 md:gap-5 lg:gap-8 flex flex-nowrap">
            {menuItems.map((menu, index) => (
              <TabsTrigger
                key={menu.value}
                value={menu.value}
                className="px-2 sm:px-2.5 py-1.5 cursor-pointer whitespace-nowrap text-xs sm:text-sm flex-shrink-0"
              >
                {menu.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
