import React from 'react';
import { exportAsJSON, exportAsPDF } from '../services/exportService';

const GridControls = ({ rows, setRows, columns, setColumns, onGenerate, gridRef, hasGrid,onNewParagraph }) => {
  
  const handleDownloadFilled = () => {
    if (gridRef.current) {
      exportAsPDF(gridRef.current, 'wongoji-grid.pdf');
    }
  };

  /*const handlenewParagraph = () => {
    // TODO: Implement new paragraph functionality
    console.log('Create new paragraph');
  };*/

  return (
    <div className="flex flex-col items-center mb-8 space-y-4">
      <div className="flex space-x-4">
        <label className="flex items-center">
          <span className="text-gray-700  font-medium">Rows:</span>
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="ml-2 px-3 py-1 border border-gray-300 rounded "
            min="1"
            max="50"
          />
        </label>
        <label className="flex items-center">
          <span className="text-gray-700  font-medium">Columns:</span>
          <input
            type="number"
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
            className="ml-2 px-3 py-1 border border-gray-300 rounded "
            min="1"
            max="20"
          />
        </label>
      </div>
      <div className="flex space-x-4 flex-wrap justify-center">
        <button
          onClick={onGenerate}
          className="px-4 py-2 bg-purple-400  text-white rounded hover:opacity-75 transition-colors"
        >
          Generate Grid
        </button>
        
        <button
          onClick={handleDownloadFilled}
          disabled={!hasGrid}
          className="px-4 py-2 bg-purple-400 text-white rounded hover:opacity-75 transition-colors"
        >
          원고지 Download
        </button>
        <button
          onClick={onNewParagraph}
          className="px-4 py-2 bg-purple-400 text-white rounded hover:opacity-75 transition-colors"
        >
          New Paragraph
        </button>
      </div>
    </div>
  );
};

export default GridControls;