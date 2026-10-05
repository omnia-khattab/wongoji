/**
 * Grid State Reducer
 * Handles grid data and validation state management
 */

import { startNewParagraph } from '../utils/rulesEngine';


export const ACTIONS = {
  INIT_GRID: 'INIT_GRID',
  UPDATE_CELL: 'UPDATE_CELL',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  NEW_PARAGRAPH: 'NEW_PARAGRAPH',
  CLEAR_FOCUS: 'CLEAR_FOCUS',

};

const initialState = {
  grid: [],
  errors: {}, // { "row-col": [error messages] }
  rows: 0,
  columns: 0,
  touchedCells: {} ,
  paragraphStarts: [0], // rows where a paragraph starts
  focusTarget: null, // { row, col } cell to focus after render


};


/**
 * Grid reducer function
 * @param {Object} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state
 */
export const gridReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.INIT_GRID: {
      const { rows, columns } = action.payload;
      const newGrid = Array.from({ length: rows }, () => Array(columns).fill(''));
      return {
        ...state,
        grid: newGrid,
        rows,
        columns,
        errors: {},
        touchedCells: {},
        paragraphStarts: [0],
        focusTarget: { row: 0, col: Math.min(1, columns - 1) },

      };
    }

    case ACTIONS.UPDATE_CELL: {
      const { rowIndex, colIndex, value } = action.payload;
      const newGrid = state.grid.map((row, r) =>
        r === rowIndex ? row.map((cell, c) => (c === colIndex ? value : cell)) : row
      );
      return {
        ...state,
        grid: newGrid,
        touchedCells: {
          ...state.touchedCells,
          [`${rowIndex}-${colIndex}`]: true
        },
      };
    }

    case ACTIONS.SET_ERRORS: {
      const { errors } = action.payload;
      return {
        ...state,
        errors,
      };
    }

    case ACTIONS.CLEAR_ERRORS: {
      return {
        ...state,
        errors: {},
      };
    }

        case ACTIONS.NEW_PARAGRAPH: {
      const res = startNewParagraph(state.grid, state.paragraphStarts ?? [0]);
      if (!res) return state; // nothing written yet
      return {
        ...state,
        grid: res.grid,
        rows: res.grid.length,
        paragraphStarts: res.paragraphStarts,
        focusTarget: { row: res.row, col: res.col },
      };
    }

    case ACTIONS.CLEAR_FOCUS:
      return { ...state, focusTarget: null };


    case "TOUCH_CELL":
    return {
      ...state,
      touchedCells: {
        ...state.touchedCells,
        [action.payload]: true
      }
    };

    default:
      return state;
  }
};

export default gridReducer;