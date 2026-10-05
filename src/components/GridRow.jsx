import React from 'react';
import GridCell from './GridCell';

const GridRow = ({ row, rowIndex, onCellChange, errors, focusCell, registerCell, rowCount, colCount, dispatch,editableLimit }) => {
  return (
    <div className="flex space-x-1">
      
      {row.map((cell, colIndex) => (
        <GridCell
          key={colIndex}
          value={cell}
          rowIndex={rowIndex}
          colIndex={colIndex}
          onChange={onCellChange}
          errors={errors}
          focusCell={focusCell}
          registerCell={registerCell}
          rowCount={rowCount}
          colCount={colCount}
          dispatch={dispatch}
          disabled={rowIndex * colCount + colIndex > editableLimit}
        />
      ))}
      <span className="min-w-8 self-center text-right text-xs text-gray-700 sm:text-sm" aria-label={`Total cells through row ${rowIndex + 1}`}>
        {(rowIndex + 1) * colCount}
      </span>
    </div>

  );
};

export default GridRow;