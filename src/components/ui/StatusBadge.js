import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  return (
    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
      {status}
    </span>
  );
};

export default StatusBadge;
