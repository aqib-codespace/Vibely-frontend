"use client";
import React from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";

const EmailVerificationBanner = ({ email, onClose }) => {
  const router = useRouter();

  const handleVerifyEmail = () => {
    if (email) {
      localStorage.setItem("verificationEmail", email);
      router.push("/verify-email");
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your email address needs to be verified before you can sign in.
              {email && <span className="font-medium"> ({email})</span>}
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={handleVerifyEmail}
              className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
            >
              Verify Email Address
            </button>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className="inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
