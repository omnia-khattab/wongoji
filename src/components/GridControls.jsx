import React from 'react';
import { exportAsPDF } from '../services/exportService';

const GridControls = ({ totalGrids, setTotalGrids, onGenerate, gridRef, hasGrid, onNewParagraph }) => {
  const handleDownloadFilled = () => {
    if (gridRef.current) {
      exportAsPDF(gridRef.current, 'wongoji-grid.pdf');
    }
  };

  return (
    <div className="flex flex-col items-center mb-8 space-y-4">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <label className="flex items-center">
          <span className="text-gray-700 font-medium">Total Grids:</span>
          <input
            type="number"
            value={totalGrids}
            onChange={(e) => setTotalGrids(Number(e.target.value))}
            className="ml-2 px-3 py-1 border border-gray-300 rounded min-w-[120px]"
            min="0"
            max="500"
          />
        </label>
      </div>

      <p className="text-xs text-gray-600 text-center">
        0–100 totals use 10 columns; more than 100 uses 20 columns, with mobile capped to 10 and tablet+ capped to 20.
      </p>

      <div className="flex space-x-4 flex-wrap justify-center">
        <button
          onClick={onGenerate}
          className="px-4 py-2 bg-purple-400 text-white rounded hover:opacity-75 transition-colors"
        >
          Generate Grid
        </button>

        <button
          onClick={handleDownloadFilled}
          disabled={!hasGrid}
          className="px-4 py-2 bg-purple-400 text-white rounded hover:opacity-75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          원고지 Download
        </button>

        <button
          onClick={onNewParagraph}
          className="px-4 py-2 my-2 md:my-0 bg-purple-400 text-white rounded hover:opacity-75 transition-colors"
        >
          New Paragraph
        </button>
      </div>
    </div>
  );
};

export default GridControls;