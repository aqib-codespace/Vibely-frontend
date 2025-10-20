"use client";
import Image from "next/image";
import React from "react";
import logo from "../../../public/black-logo.png";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ProfileMenu from "./profile-menu";
import { RiMessengerLine } from "react-icons/ri";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./menu-items";
import { cn } from "@/lib/utils";
import GlobalSearch from "@/components/global-search";
import NotificationDropdown from "@/components/NotificationDropdown";
import MobileNotificationButton from "@/components/MobileNotificationButton";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-[9999] w-full bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-0">
        <div
          onClick={() => router.push("/")}
          className="flex cursor-pointer items-center gap-3"
        >
          <Image
            src={logo}
            alt="Vibely Logo"
            width={120}
            height={40}
            className="md:w-[200px] md:h-[90px] md:py-4"
          />
        </div>

        <div className="hidden md:flex flex-1 mx-8">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:block">
            <NotificationDropdown />
          </div>

          <button
            onClick={() => router.push("/chat")}
            className="bg-gray-100 p-2 cursor-pointer rounded-md hover:bg-gray-200 transition"
          >
            <RiMessengerLine className="h-5 w-5" />
          </button>

          <div className="hidden md:block">
            <ProfileMenu />
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between px-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item?.href;
            return (
              <Link
                key={item.name + "-" + index}
                href={item?.href}
                className={cn(
                  "flex items-center justify-center p-2  transition-colors duration-200 min-w-0 flex-1",
                  isActive
                    ? "text-gray-900 border-b-2 border-gray-900 font-semibold"
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

          <div className="flex items-center justify-center min-w-0 flex-1">
            <MobileNotificationButton />
          </div>

          <div className="flex items-center justify-center  min-w-0 flex-1">
            <ProfileMenu avatarClassName="!h-8 !w-8 border" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
