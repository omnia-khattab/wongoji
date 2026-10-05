import React, { useReducer, useCallback, useRef } from 'react';
import GridControls from './GridControls';
import WongojiGrid from './WongojiGrid';
import ErrorPanel from './ErrorPanel';
import { gridReducer, ACTIONS } from '../store/gridReducer';
import { validateGrid } from '../utils/rulesEngine';

const initialState = {
  grid: [],
  errors: {},
  rows: 0,
  columns: 0,
  touchedCells: {},
  paragraphStarts: [0],
  focusTarget: null,
};

const GridPage = () => {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const gridRef = useRef(null);
  const [rows, setRows] = React.useState(5);
  const [columns, setColumns] = React.useState(10);

  const handleGenerate = useCallback(() => {
    dispatch({
      type: ACTIONS.INIT_GRID,
      payload: { rows, columns },
    });
    // Clear errors on new grid
    dispatch({
      type: ACTIONS.SET_ERRORS,
      payload: { errors: {} },
    });
  }, [rows, columns]);

  const handleCellChange = useCallback((rowIndex, colIndex, value) => {
    // Update the cell
    dispatch({
      type: ACTIONS.UPDATE_CELL,
      payload: { rowIndex, colIndex, value },
    });
  }, []);

  const handleNewParagraph = useCallback(() => {
    dispatch({ type: ACTIONS.NEW_PARAGRAPH });
  }, []);



  // Run validation whenever grid changes
  React.useEffect(() => {
    if (state.grid.length > 0) {
      const errors = validateGrid(state.grid, state.touchedCells, {
        paragraphStarts: state.paragraphStarts,
      });

      dispatch({
        type: ACTIONS.SET_ERRORS,
        payload: { errors },
      });
    }
  }, [state.grid, state.touchedCells, state.paragraphStarts]);

  // Keep the Rows input in sync when a new paragraph appends a row
  React.useEffect(() => {
    if (state.grid.length > 0) setRows(state.grid.length);
  }, [state.grid.length]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 bg-cover bg-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-[70px] font-extrabold bg-gradient-to-r from-purple-200 to-blue-400 bg-clip-text text-transparent ">
          원고지
        </h1>
      </header>
      <GridControls
        rows={rows}
        setRows={setRows}
        columns={columns}
        setColumns={setColumns}
        onGenerate={handleGenerate}
        onNewParagraph={handleNewParagraph}
        gridRef={gridRef}
        hasGrid={state.grid.length > 0}
      />
      <WongojiGrid ref={gridRef} gridData={state.grid}
       onCellChange={handleCellChange}
       errors={state.errors}
       dispatch={dispatch}
       paragraphStarts={state.paragraphStarts}
       focusTarget={state.focusTarget} />
      <ErrorPanel errors={state.errors} />
    </div>
  );
};

export default GridPage;