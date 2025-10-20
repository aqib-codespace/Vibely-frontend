import React from "react";
import { MdDeleteOutline } from "react-icons/md";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This cannot be undone.",
  icon = <MdDeleteOutline className="text-red-500 h-8 w-8" />,
  iconBgColor = "bg-red-100",
  confirmButtonText = "Delete",
  confirmButtonColor = "bg-red-500 hover:bg-red-600",
  cancelButtonText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center relative">
          <div className="flex flex-col items-center">
            <span className={`${iconBgColor} rounded-full p-3 mb-3`}>
              {icon}
            </span>
            <h2 className="text-xl font-bold mb-2 text-gray-800">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3 w-full justify-center">
              <button
                className="px-5 py-2 rounded bg-gray-200 cursor-pointer text-gray-700 font-semibold hover:bg-gray-300"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelButtonText}
              </button>
              <button
                className={`px-5 py-2 rounded ${confirmButtonColor} cursor-pointer text-white font-semibold flex items-center justify-center min-w-[90px]`}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loader border-white border-t-transparent">
                    Processing...
                  </span>
                ) : (
                  <>
                    <MdDeleteOutline className="mr-2 h-5 w-5" />{" "}
                    {confirmButtonText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
