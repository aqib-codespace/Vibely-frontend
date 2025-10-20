"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./menu-items";
import ProfileMenu from "./profile-menu";
import { cn } from "@/lib/utils";

const MobileNavHeader = () => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed top-16 left-0 right-0 z-[9998] bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-around px-2 py-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item?.href;
          return (
            <Link
              key={item.name + "-" + index}
              href={item?.href}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg transition-colors duration-200 min-w-0 flex-1",
                isActive
                  ? "text-gray-900 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center [&>svg]:h-6 [&>svg]:w-6",
                  isActive ? "text-gray-900" : "text-gray-600"
                )}
              >
                {item?.icon}
              </span>
            </Link>
          );
        })}

        <div className="flex items-center justify-center p-3 min-w-0 flex-1">
          <ProfileMenu avatarClassName="!h-6 !w-6" />
        </div>
      </div>
    </nav>
  );
};

export default MobileNavHeader;
