import React, { useRef, useCallback, forwardRef, useEffect  } from 'react';
import GridRow from './GridRow';
import { getEditableLimit } from '../utils/rulesEngine';
import { ACTIONS } from '../store/gridReducer';

const WongojiGrid = forwardRef(({ gridData, onCellChange, errors, dispatch, paragraphStarts, focusTarget }, gridRef) => {
  const cellRefs = useRef([]);

  const focusCell = useCallback(
    (row, col) => {
      if (row < 0 || col < 0) {
        return;
      }

      if (row >= gridData.length) {
        return;
      }

      const rowCells = cellRefs.current[row];
      const target = rowCells?.[col];

      if (target?.focus) {
        target.focus();
      }
    },
    [gridData.length],
  );

  const registerCell = useCallback((row, col, node) => {
    if (!cellRefs.current[row]) {
      cellRefs.current[row] = [];
    }

    cellRefs.current[row][col] = node;
  }, []);

   // Move the focus when the reducer asks for it (Generate Grid / New Paragraph)
  useEffect(() => {
    if (!focusTarget) return;
    focusCell(focusTarget.row, focusTarget.col);
    dispatch({ type: ACTIONS.CLEAR_FOCUS });
  }, [focusTarget, focusCell, dispatch]);

  const rowCount = gridData.length;
  const colCount = rowCount > 0 ? gridData[0].length : 0;

  if (gridData.length === 0) {
    return <div className="text-center text-light-beige">Generate a grid to start writing.</div>;
  }

  // Cells after this flat index are disabled (you can only write forward)
  const editableLimit = getEditableLimit(gridData, paragraphStarts);

  return (
    <>
      <div className='flex justify-center mb-8 select-none text-dark-beige'>
        <span className='text-light-beige] mr-2'><strong>{rowCount*colCount}</strong></span> Words
      </div>
      <div className="mb-8 w-full max-w-full overflow-x-auto">
        <div ref={gridRef} className="grid w-max mx-auto gap-1 p-4 bg-light-beige bg-opacity-30 backdrop-blur-lg rounded-lg shadow-xl">
          {gridData.map((row, rowIndex) => (
            <GridRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              onCellChange={onCellChange}
              errors={errors}
              focusCell={focusCell}
              registerCell={registerCell}
              rowCount={rowCount}
              colCount={colCount}
              dispatch={dispatch}
              editableLimit={editableLimit}
            />
          ))}
        </div>
      </div>
    </>
  );
});

WongojiGrid.displayName = 'WongojiGrid';
export default WongojiGrid;