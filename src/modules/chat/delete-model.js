import React from "react";
import { MdDeleteOutline } from "react-icons/md";

const DeleteConfirmation = ({
  deleteModalOpen,
  setDeleteModalOpen,
  setDeletePostId,
  HandleDelete,
  deleteLoading,
  title = "Delete Message?",
  message = "Are you sure you want to delete this message? This action cannot be undone.",
}) => {
  if (!deleteModalOpen) return null;
  return (
    <div>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center relative">
          <div className="flex flex-col items-center">
            <span className="bg-red-100 rounded-full p-3 mb-3">
              <MdDeleteOutline className="text-red-500 h-8 w-8" />
            </span>
            <h2 className="text-xl font-bold mb-2 text-gray-800">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3 w-full justify-center">
              <button
                className="px-5 py-2 rounded bg-gray-200 cursor-pointer text-gray-700 font-semibold hover:bg-gray-300"
                onClick={() => {
                  setDeleteModalOpen(false);
                  if (setDeletePostId) setDeletePostId(null);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded bg-red-500 cursor-pointer text-white font-semibold hover:bg-red-600 flex items-center justify-center min-w-[90px]"
                onClick={HandleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="loader border-white border-t-transparent">
                    Deleting...
                  </span>
                ) : (
                  <>
                    <MdDeleteOutline className="mr-2 h-5 w-5" /> Delete
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

export default DeleteConfirmation;
