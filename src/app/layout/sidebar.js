"use client";
import React from "react";
import Link from "next/link";
import { menuItems } from "./menu-items";
import { usePathname } from "next/navigation";
import { cn } from "rizzui";
import { PiCaretDownBold } from "react-icons/pi";
import UserInfo from "./user-info";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Sidebar() {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = React.useState({});

  const handleToggle = (index) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <div className="hidden md:block fixed left-4 top-28">
        <UserInfo />
        <aside className="w-64 bg-white  rounded-xl shadow-sm h-[calc(100vh-280px)] custom-scrollbar overflow-y-auto  px-2 flex flex-col gap-2">
          <div className="mt-4 pb-3 3xl:mt-6">
            {menuItems.map((item, index) => {
              const isActive = pathname === item?.href;
              const pathnameExistInDropdowns = item?.dropdownItems?.filter(
                (dropdownItem) => dropdownItem.href === pathname
              );
              const isDropdownOpen =
                openDropdowns[index] ||
                Boolean(pathnameExistInDropdowns?.length);

              const isChildActive = Boolean(pathnameExistInDropdowns?.length);

              return (
                <div key={item.name + "-" + index}>
                  {item?.href ? (
                    <>
                      {item?.dropdownItems ? (
                        <>
                          <div
                            onClick={() => handleToggle(index)}
                            className={cn(
                              "group relative mx-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2",
                              isDropdownOpen || isChildActive
                                ? "text-primary border-l-4 border-black bg-blue-50"
                                : "text-gray-700 transition-colors duration-200 hover:bg-gray-100"
                            )}
                          >
                            <span className="flex items-center">
                              {item?.icon && (
                                <span
                                  className={cn(
                                    "me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]",
                                    isDropdownOpen || isChildActive
                                      ? "text-primary"
                                      : "text-gray-800"
                                  )}
                                >
                                  {item?.icon}
                                </span>
                              )}
                              {item.name}
                            </span>

                            <PiCaretDownBold
                              strokeWidth={3}
                              className={cn(
                                "h-3.5 w-3.5 -rotate-90 text-gray-500 transition-transform duration-200 rtl:rotate-90",
                                isDropdownOpen && "rotate-0 rtl:rotate-0"
                              )}
                            />
                          </div>

                          {isDropdownOpen && (
                            <div>
                              {item?.dropdownItems?.map((dropdownItem, idx) => {
                                const isChildActive =
                                  pathname === dropdownItem?.href;
                                return (
                                  <Link
                                    href={dropdownItem?.href}
                                    key={dropdownItem?.name + idx}
                                    className={cn(
                                      "mx-3.5 mb-0.5 flex items-center justify-between rounded-md px-3.5 py-2 font-medium capitalize last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5",
                                      isChildActive
                                        ? "text-primary bg-blue-primary/10"
                                        : "text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                  >
                                    <div className="flex items-center truncate">
                                      <span
                                        className={cn(
                                          "me-[18px] ms-1 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200",
                                          isChildActive
                                            ? "bg-primary ring-[1px] ring-primary"
                                            : "opacity-40"
                                        )}
                                      />{" "}
                                      <span className="truncate">
                                        {dropdownItem?.name}
                                      </span>
                                    </div>
                                    {dropdownItem?.badge?.length ? (
                                      <StatusBadge
                                        status={dropdownItem?.badge}
                                      />
                                    ) : null}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item?.href}
                          className={cn(
                            "group relative mx-3 my-0.5  flex items-center justify-between rounded-md px-3 py-2  capitalize lg:my-1 2xl:mx-5 2xl:my-2",
                            isActive
                              ? "text-white bg-gray-900"
                              : "text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                          )}
                        >
                          <div className="flex items-center truncate">
                            {item?.icon && (
                              <span
                                className={cn(
                                  "me-2 inline-flex size-5 items-center justify-center rounded-md [&>svg]:size-5",
                                  isActive ? "text-white" : "text-gray-800"
                                )}
                              >
                                {item?.icon}
                              </span>
                            )}
                            <span className="truncate">{item.name}</span>
                          </div>
                          {item?.badge?.length ? (
                            <StatusBadge status={item?.badge} />
                          ) : null}
                        </Link>
                      )}
                    </>
                  ) : (
                    <div
                      as="h6"
                      className={cn(
                        "mb-2 truncate px-6 text-xs font-normal uppercase tracking-widest text-gray-500 2xl:px-8",
                        index !== 0 && "mt-6 3xl:mt-7"
                      )}
                    >
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
