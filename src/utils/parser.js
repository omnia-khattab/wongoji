/**
 * Parser
 * Converts grid data to text and other formats
 */

/**
 * Convert 2D grid array to plain text string
 * Joins each row with line breaks
 */
export const gridToText = (grid) => {
  if (!grid || grid.length === 0) return '';

  return grid
    .map((row) => row.join('').trim())
    .filter((line) => line.length > 0)
    .join('\n');
};

/**
 * Convert grid to CSV format
 */
export const gridToCSV = (grid) => {
  if (!grid || grid.length === 0) return '';

  return grid.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
};

/**
 * Convert grid to JSON format
 */
export const gridToJSON = (grid) => {
  return JSON.stringify(grid, null, 2);
};

/**
 * Get statistics about the grid
 */
export const getGridStats = (grid) => {
  const text = gridToText(grid);
  const totalCells = grid.reduce((sum, row) => sum + row.length, 0);
  const filledCells = grid.reduce(
    (sum, row) => sum + row.filter((cell) => cell.length > 0).length,
    0
  );
  const emptyCells = totalCells - filledCells;

  return {
    rows: grid.length,
    columns: grid[0]?.length || 0,
    totalCells,
    filledCells,
    emptyCells,
    filledPercentage: totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0,
    textLength: text.length,
  };
};

export default {
  gridToText,
  gridToCSV,
  gridToJSON,
  getGridStats,
};