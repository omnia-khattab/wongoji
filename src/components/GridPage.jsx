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

const getGridConfig = (targetTotal) => {
  const safeTotal = Math.max(0, Number(targetTotal) || 0);
  const viewportLimit = window.innerWidth < 768 ? 10 : 20;
  const preferredColumns = safeTotal > 100 ? 20 : 10;
  const columns = Math.min(preferredColumns, viewportLimit);
  const rows = safeTotal === 0 ? 0 : Math.ceil(safeTotal / columns);

  return { rows, columns };
};

const GridPage = () => {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const gridRef = useRef(null);
  const [totalGrids, setTotalGrids] = React.useState(80);

  const handleGenerate = useCallback(() => {
    const { rows, columns } = getGridConfig(totalGrids);

    dispatch({
      type: ACTIONS.INIT_GRID,
      payload: { rows, columns },
    });

    dispatch({
      type: ACTIONS.SET_ERRORS,
      payload: { errors: {} },
    });
  }, [totalGrids]);

  const handleCellChange = useCallback((rowIndex, colIndex, value) => {
    dispatch({
      type: ACTIONS.UPDATE_CELL,
      payload: { rowIndex, colIndex, value },
    });
  }, []);

  const handleNewParagraph = useCallback(() => {
    dispatch({ type: ACTIONS.NEW_PARAGRAPH });
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#222831] to-[#393E46] bg-cover bg-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-[70px] font-extrabold bg-gradient-to-r from-[#393E46] to-[#948979] bg-clip-text text-transparent">
          원고지
        </h1>
      </header>

      <GridControls
        totalGrids={totalGrids}
        setTotalGrids={setTotalGrids}
        onGenerate={handleGenerate}
        onNewParagraph={handleNewParagraph}
        gridRef={gridRef}
        hasGrid={state.grid.length > 0}
      />

      <WongojiGrid
        ref={gridRef}
        gridData={state.grid}
        onCellChange={handleCellChange}
        errors={state.errors}
        dispatch={dispatch}
        paragraphStarts={state.paragraphStarts}
        focusTarget={state.focusTarget}
      />

      <ErrorPanel errors={state.errors} />
    </div>
  );
};

export default GridPage;