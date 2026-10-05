import React from 'react';

const ErrorPanel = ({ errors }) => {
  if (!errors || Object.keys(errors).length === 0) {
    return (
      <div className="mt-8 p-4 bg-green-100 rounded-lg w-2/3 m-auto">
        <h2 className="text-lg font-semibold text-green-800 ">
          ✓ All Valid
        </h2>
        <p className="text-green-600 ">No validation errors detected.</p>
      </div>
    );
  }

  const errorEntries = Object.entries(errors);

  return (
    <div className="mt-8 p-4 bg-red-100 rounded-lg w-2/3 m-auto ">
      <h2 className="text-lg font-semibold text-red-800  mb-3">
        ⚠ Validation Errors ({errorEntries.length} cell{errorEntries.length !== 1 ? 's' : ''})
      </h2>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {errorEntries.map(([cellKey, errorList]) => (
          <div key={cellKey} className="text-red-700  text-sm">
            <span className="font-mono font-semibold">Cell [{cellKey}]:</span>
            <ul className="ml-4 mt-1 space-y-1">
              {errorList.map((error, idx) => (
                <li key={idx} className="list-disc">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorPanel;