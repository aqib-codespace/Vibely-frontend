"use client";
import React, { useState, useEffect } from "react";
import notificationSound from "@/utils/notificationSound";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";

const NotificationSettings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState("default");

  useEffect(() => {
    setSoundEnabled(notificationSound.isEnabled());

    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserNotifications(Notification.permission);
    }
  }, []);

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    notificationSound.setEnabled(newValue);
  };

  const requestBrowserNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotifications(permission);
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  };

  const testNotificationSound = () => {
    notificationSound.playNotificationSound();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Notification Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <IoVolumeHighOutline className="h-5 w-5 text-blue-600" />
              ) : (
                <IoVolumeMuteOutline className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900">Notification Sounds</p>
                <p className="text-sm text-gray-500">
                  Play a sound when you receive notifications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={testNotificationSound}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Test
              </button>
              <button
                onClick={handleSoundToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 text-blue-600">🔔</div>
              <div>
                <p className="font-medium text-gray-900">
                  Browser Notifications
                </p>
                <p className="text-sm text-gray-500">
                  Show notifications in your browser
                </p>
              </div>
            </div>
            <div>
              {browserNotifications === "granted" ? (
                <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                  Enabled
                </span>
              ) : browserNotifications === "denied" ? (
                <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md">
                  Blocked
                </span>
              ) : (
                <button
                  onClick={requestBrowserNotifications}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
