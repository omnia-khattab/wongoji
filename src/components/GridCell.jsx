import React, { useEffect, useRef, useState } from 'react';
import { hasCellError } from '../utils/rulesEngine';

const GridCell = ({
  value,
  rowIndex,
  colIndex,
  onChange,
  errors,
  focusCell,
  registerCell,
  rowCount,
  colCount,
  dispatch,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const hasError = hasCellError(rowIndex, colIndex, errors);
  //const [isComposing, setIsComposing] = useState(false);
const isComposingRef = useRef(false);

  useEffect(() => {
    registerCell(rowIndex, colIndex, inputRef.current);

    return () => {
      registerCell(rowIndex, colIndex, null);
    };
  }, [rowIndex, colIndex, registerCell]);

  
  const isInsideGrid = (row, col) => row >= 0 && col >= 0 && row < rowCount && col < colCount;

  const focusNextCell = () => {
    let nextRow = rowIndex;
    let nextCol = colIndex + 1;

    if (nextCol >= colCount) {
      nextCol = 0;
      nextRow += 1;
    }

    if (isInsideGrid(nextRow, nextCol)) {
      focusCell(nextRow, nextCol);
    }
  };

  const focusPreviousCell = () => {
    let previousRow = rowIndex;
    let previousCol = colIndex - 1;

    if (previousCol < 0) {
      previousRow -= 1;
      previousCol = colCount - 1;
    }

    if (isInsideGrid(previousRow, previousCol)) {
      focusCell(previousRow, previousCol);
    }
  };

  const focusAboveCell = () => {
    const targetRow = rowIndex - 1;

    if (isInsideGrid(targetRow, colIndex)) {
      focusCell(targetRow, colIndex);
    }
  };

  const focusBelowCell = () => {
    const targetRow = rowIndex + 1;

    if (isInsideGrid(targetRow, colIndex)) {
      focusCell(targetRow, colIndex);
    }
  };

 
  const spaceNavigationLockRef = useRef(false);

  const handleSpaceNavigation = (shiftPressed = false) => {
    if (spaceNavigationLockRef.current) {
      return;
    }

    spaceNavigationLockRef.current = true;
    requestAnimationFrame(() => {
      spaceNavigationLockRef.current = false;
    });

    if (shiftPressed) {
      focusPreviousCell();
      return;
    }

    focusNextCell();
  };

  const handleChange = (e) => {
    const rawValue = e.target.value ?? '';
    const sanitizedValue = rawValue.replace(/\s/g, '');

    if (/\s/.test(rawValue)) {
      onChange(rowIndex, colIndex, sanitizedValue);
      requestAnimationFrame(() => {
        handleSpaceNavigation(Boolean(e.nativeEvent?.shiftKey));
      });
      return;
    }

    onChange(rowIndex, colIndex, sanitizedValue);
  };

  /*const handleKeyDown = (e) => {
    const isSpaceKey = e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar';

    if (isSpaceKey) {
      e.preventDefault();
      handleSpaceNavigation(Boolean(e.shiftKey));
      return;
    }

    if (e.key === 'Backspace') {
      if (!value) {
        e.preventDefault();
        focusPreviousCell();
      }

      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusNextCell();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusPreviousCell();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusAboveCell();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusBelowCell();
      return;
    }
  };*/

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar') {
      if (isComposingRef.current || e.isComposing) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      handleSpaceNavigation(e.shiftKey);
      return;
    }

    if (e.key === 'Backspace') {
      if (!value) {
        e.preventDefault();
        focusPreviousCell();
      }

      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusNextCell();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusPreviousCell();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusAboveCell();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusBelowCell();
      return;
    }
  };

  /*const handleBeforeInput = (e) => {
    if (e.inputType === 'insertText' && /\s/.test(e.data ?? '')) {
      e.preventDefault();
      requestAnimationFrame(() => {
        handleSpaceNavigation(Boolean(e.shiftKey));
      });
    }
  };*/

  const handleBeforeInput = (e) => {
    if (isComposingRef.current || e.isComposing) {
      return;
    }

    if (e.inputType === 'insertText' && /\s/.test(e.data ?? '')) {
      e.preventDefault();
      e.stopPropagation();
      handleSpaceNavigation(Boolean(e.shiftKey));
    }
  };
  const cellSizeClass = colCount > 10 ? 'size-7 text-xs lg:size-12 sm:text-base' : 'size-6 text-sm sm:size-12 sm:text-2xl';

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      onBeforeInput={handleBeforeInput}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        dispatch({
          type: "TOUCH_CELL",
          payload: `${rowIndex}-${colIndex}`
        });
      }}
      // onCompositionStart={() => setIsComposing(true)}
      // onCompositionEnd={() => {
      //   setIsComposing(false);
      // }}
      onCompositionStart={() => {
  isComposingRef.current = true;
}}

onCompositionEnd={() => {
  isComposingRef.current = false;
}}
      className={`
        ${cellSizeClass} border rounded text-center align-middle leading-none
        p-0 m-0 flex items-center justify-center
        appearance-none
        focus:outline-none focus:ring-2
        transition-all duration-150 ease-in-out
        disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60

        ${
          hasError
            ? 'border-red-500 bg-red-200 focus:ring-red-500'
            : 'border-gray-300 bg-white focus:ring-blue-500 hover:border-gray-400'
        }
      `}
      style={{
        boxSizing: 'border-box',
        padding: 0,
        margin: 0,
        lineHeight: '1',
        verticalAlign: 'middle',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
      }}
      maxLength="3"
      disabled={disabled}
      title={hasError ? 'This cell has validation errors' : ''}
    />
  );
};

export default GridCell;