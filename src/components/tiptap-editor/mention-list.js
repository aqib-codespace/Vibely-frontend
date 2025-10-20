"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

const MentionList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = items[index];
    if (item) {
      command({ id: item.id, label: item.label });
    }
  };

  const upHandler = () => {
    setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((prev) => (prev + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      console.log("Key pressed in mention list:", event.key);
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }
      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }
      if (event.key === "Enter") {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  if (!items || !items.length) {
    return null;
  }
  return (
    <div className="!bg-white shadow-lg rounded-md border p-2 max-h-60 overflow-y-auto w-64">
      {items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => selectItem(index)}
          className={`flex items-center gap-2 my-1 w-full text-left px-2 py-1 rounded ${
            index === selectedIndex ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
        >
          <img
            src={item.avatar || "/avatar.webp"}
            alt={item.label}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
              e.target.src = "/avatar.webp";
            }}
          />
          <span className="text-sm text-gray-800 font-medium">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = "MentionList";

export default MentionList;
