"use client";
import React, { useRef, useEffect } from "react";

const REACTION_EMOJIS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👎", label: "ThumbsDown" },
];

export const ReactionPicker = ({
  onReactionSelect,
  onClose,
  className = "",
  position = "bottom-left",
}) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleReactionClick = (emoji) => {
    onReactionSelect?.(emoji);
    onClose?.();
  };

  const positionClasses = {
    "bottom-left": "bottom-full left-0 mb-2",
    "bottom-right": "bottom-full right-0 mb-2",
    "top-left": "top-full left-0 mt-2",
    "top-right": "top-full right-0 mt-2",
  };

  return (
    <div
      ref={pickerRef}
      className={`
        absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2
        flex gap-1 animate-in fade-in-0 zoom-in-95 duration-100
        ${positionClasses[position] || positionClasses["bottom-left"]}
        ${className}
      `}
    >
      {REACTION_EMOJIS.map(({ emoji, label }) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          title={label}
          type="button"
        >
          <span
            className="text-lg leading-none select-none"
            role="img"
            aria-label={label}
          >
            {emoji}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
