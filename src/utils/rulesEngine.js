/**
 * Rules Engine
 * Validates a Wongoji (원고지) grid against the writing rules.
 *
 * grid:            string[][]            rows x cols, "" = empty cell
 * touchedCells:    { "row-col": true }   kept for compatibility (only used by the ellipsis rule)
 * paragraphStarts: number[]              rows where a paragraph starts (row 0 by default).
 *                                        The "New Paragraph" button adds to this list.
 */

const CONFIG = {
  // . , ? ! together with a closing quote share ONE cell (  ."  ?"  !"  ).
  // Set to false if your source says otherwise.
  allowPunctWithClosingQuote: true,
};

/* ------------------------------------------------------------------ */
/* Character helpers                                                   */
/* ------------------------------------------------------------------ */

const PUNCT_RE = /[.,;:!?"'“”‘’…()~-]/;
const PURE_PUNCT_RE = /^[.,;:!?"'“”‘’…()~-]+$/;
const QUOTE_RE = /["'“”‘’]/;
const CLOSING_RE = /[.,;:!?)”’]/; // marks that can never start a line

// NFC: Hangul typed through an IME can arrive as separate jamo.
// trim(): a cell containing only a space counts as empty.
const norm = (s) => (s ?? '').normalize('NFC').trim();

const isPunctuation = (char) => PUNCT_RE.test(char);
const isDigit = (char) => /\d/.test(char);
const isEnglish = (char) => /[a-zA-Z]/.test(char);
const isHangul = (char) =>
  /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/.test(char);

const isEllipsis = (v) => v === '…' || v === '...';

/* ------------------------------------------------------------------ */
/* Grid helpers (reading order: text flows from one row to the next)  */
/* ------------------------------------------------------------------ */

const hasContent = (cells) => cells.some((x) => norm(x) !== '');

const lastNonEmptyIndex = (row) => {
  for (let i = row.length - 1; i >= 0; i--) {
    if (norm(row[i]) !== '') return i;
  }
  return -1;
};

const prevPos = (grid, r, c) => {
  if (c > 0) return [r, c - 1];
  if (r > 0) return [r - 1, grid[r - 1].length - 1];
  return null;
};

const nextPos = (grid, r, c) => {
  if (c < grid[r].length - 1) return [r, c + 1];
  if (r < grid.length - 1) return [r + 1, 0];
  return null;
};

const cellAt = (grid, pos) => (pos ? norm(grid[pos[0]][pos[1]]) : null);

/**
 * Is the quote in this cell an opening or a closing one?
 * Curly quotes are unambiguous. Straight quotes are decided by parity:
 * the 1st one is opening, the 2nd closing, and so on.
 * (Limitation: an apostrophe standing alone in a cell flips the parity.)
 */
const getQuoteRole = (grid, r, c) => {
  const v = norm(grid[r][c]);
  if (/[“‘]/.test(v)) return 'open';
  if (/[”’]/.test(v)) return 'close';
  const q = v.match(/["']/);
  if (!q) return null;
  let count = 0;
  for (let i = 0; i <= r; i++) {
    const lastJ = i === r ? c - 1 : grid[i].length - 1;
    for (let j = 0; j <= lastJ; j++) {
      if (norm(grid[i][j]).includes(q[0])) count++;
    }
  }
  return count % 2 === 0 ? 'open' : 'close';
};

const isClosingPunct = (grid, r, c, v) =>
  CLOSING_RE.test(v) || getQuoteRole(grid, r, c) === 'close';

const isValidPunctGroup = (s) =>
  s.length === 1 ||
  (CONFIG.allowPunctWithClosingQuote && /^[.,?!][”’"']$/.test(s));

/* ------------------------------------------------------------------ */
/* Paragraph / flow helpers (used by the UI too)                       */
/* ------------------------------------------------------------------ */

/** Index of the last row that has something written in it (-1 if none). */
export const getLastContentRow = (grid) => {
  for (let r = grid.length - 1; r >= 0; r--) {
    if (hasContent(grid[r])) return r;
  }
  return -1;
};

/**
 * "New Paragraph" button logic.
 * Returns null when nothing is written yet, otherwise
 * { grid, paragraphStarts, row, col } — where `row`/`col` is the cell to focus
 * (2nd cell of the new line, because the 1st one stays empty).
 * A new row is appended if the grid is already full.
 */
export const startNewParagraph = (grid, paragraphStarts = [0]) => {
  const last = getLastContentRow(grid);
  if (last === -1) return null;
  const row = last + 1;
  const cols = grid[0].length;
  return {
    grid: row < grid.length ? grid : [...grid, Array(cols).fill('')],
    paragraphStarts: paragraphStarts.includes(row) ? paragraphStarts : [...paragraphStarts, row],
    row,
    col: 1,
  };
};

/**
 * Flat index (row * cols + col) of the furthest cell the user may edit.
 * Cells after it should be disabled / read-only in the UI:
 *   isDisabled = row * cols + col > getEditableLimit(grid, paragraphStarts)
 * Rule of thumb: last written cell + 1 space + 1 letter.
 */
export const getEditableLimit = (grid, paragraphStarts = [0]) => {
  const cols = grid[0].length;
  const total = grid.length * cols;
  let lastIdx = -1;
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (norm(cell) !== '') lastIdx = r * cols + c;
    })
  );
  const startIdx = Math.max(...paragraphStarts, 0) * cols;
  // Nothing written in the current paragraph yet: the indent cell + the first letter cell
  if (lastIdx < startIdx) return Math.min(startIdx + 1, total - 1);
  return Math.min(lastIdx + 2, total - 1);
};

/**
 * Line-flow rules (whole rows, not single cells):
 *  - don't skip lines
 *  - a paragraph starts in the 2nd cell (1st cell empty); dialogue may open in the 1st cell
 *  - every other line starts in the 1st cell
 *  - a line must be full before the next line continues the same paragraph
 */
const validateFlow = (grid, starts) => {
  const errors = {};
  const add = (r, c, msg) => {
    const key = `${r}-${c}`;
    (errors[key] = errors[key] || []).push(msg);
  };

  grid.forEach((row, r) => {
    if (!hasContent(row)) return;
    const lastCol = row.length - 1;
    const first = row.findIndex((x) => norm(x) !== '');
    const isStart = starts.has(r);

    if (r > 0 && !hasContent(grid[r - 1])) {
      add(r, first, "Don't skip lines — keep writing on the line right after the previous one");
      return;
    }

    if (isStart) {
      const dialogue = first === 0 && getQuoteRole(grid, r, 0) === 'open';
      if (first === 0 && !dialogue) {
        add(r, 0, 'A paragraph must start with an empty first cell');
      } else if (first > 1) {
        add(r, first, 'Start writing right after the empty first cell');
      }
    } else {
      if (first > 0) {
        add(r, 0, 'A line must not start with an empty cell (mark the space with ∨ at the end of the previous line)');
      }
      if (r > 0) {
        const prevLast = lastNonEmptyIndex(grid[r - 1]);
        // one empty cell at the end of the line is fine (it is the space)
        if (prevLast < lastCol - 1) {
          add(r, first, "The previous line isn't full — keep writing until the end of the line, or press New Paragraph");
        }
      }
    }
  });

  return errors;
};

/* ------------------------------------------------------------------ */
/* Cell validation                                                     */
/* ------------------------------------------------------------------ */

const validateCell = (rawValue, r, c, grid, touched, starts) => {
  const errors = [];
  const value = norm(rawValue);
  const row = grid[r];
  const lastCol = row.length - 1;
  const isEndOfRow = c === lastCol;

  const nextP = nextPos(grid, r, c);
  const prevP = prevPos(grid, r, c);
  const nextCell = !isEndOfRow ? norm(row[c + 1]) : null; // same row only
  const prevCell = c > 0 ? norm(row[c - 1]) : null; // same row only

  const touchedPos = (p) => Boolean(p) && Boolean(touched[`${p[0]}-${p[1]}`]);
  const before = (end) => hasContent(row.slice(0, Math.max(end, 0)));
  const after = (start) => hasContent(row.slice(start));

  /* ---------------------------- empty cell ----------------------------- */
  if (value === '') {
    // Rule: no two empty cells next to each other.
    // Only counts BETWEEN written cells, so indents and trailing blanks are fine.
    // (No "touched" needed: content after the gap proves the user moved on.)
    const dupNext = nextCell === '' && before(c) && after(c + 2);
    const dupPrev = prevCell === '' && before(c - 1) && after(c + 1);
    if (dupNext || dupPrev) {
      errors.push('No two empty cells next to each other');
    }
    return errors;
  }

  /* --------------------------- non-empty cell -------------------------- */
  const isPure = PURE_PUNCT_RE.test(value);

  // In the LAST cell of a line a letter may carry trailing punctuation:
  // punctuation can't start the next line, so it hugs the last letter.
  let content = value;
  let tail = '';
  if (!isPure && isEndOfRow) {
    const m = value.match(/^(.*?)([.,;:!?"'”’)…]+)$/);
    if (m && m[1] !== '' && !PUNCT_RE.test(m[1])) {
      content = m[1];
      tail = m[2];
    }
  }

  /* ------------------- cells with letters / digits --------------------- */
  if (!isPure) {
    const hasH = isHangul(content);
    const hasE = isEnglish(content);
    const hasD = isDigit(content);
    const hasP = PUNCT_RE.test(content);

    if (hasP) {
      errors.push('Cannot mix punctuation with letters or digits in the same cell');
    }
    if (hasH && hasE) {
      errors.push('Cannot mix Hangul and English in the same cell');
    }
    if (hasD && (hasE || hasH)) {
      errors.push('Cannot mix digits with letters in the same cell');
    }

    // Hangul: one character per cell
    if (hasH && content.length > 1 && !hasE && !hasD) {
      errors.push('Only one Hangul character per cell');
    }

    // English: 2 lowercase OR 1 uppercase per cell
    if (hasE && !hasH && !hasD && !hasP) {
      const upper = content === content.toUpperCase();
      const lower = content === content.toLowerCase();
      if (!upper && !lower) {
        errors.push('Cannot mix uppercase and lowercase letters in one cell');
      } else if (upper && content.length >= 2) {
        errors.push('Only one uppercase letter allowed');
      } else if (lower && content.length > 2) {
        errors.push('Only two small letters per cell');
      }
    }

    // Digits: 2 per cell
    if (hasD && !hasE && !hasH && !hasP && content.length > 2) {
      errors.push('Only two digits per cell');
    }

    // Anything else (unknown characters): keep the generic limit
    if (!hasH && !hasE && !hasD && content.length > 2) {
      errors.push('Cell exceeds maximum length');
    }

    // Packing: digits / lowercase letters are written two per cell,
    // so a lone one must not be followed by another one in the next cell.
    if (!tail && nextP) {
      const next = cellAt(grid, nextP);
      if (/^\d$/.test(content) && /^\d/.test(next)) {
        errors.push('Digits go two per cell — fill this cell before starting the next one');
      }
      if (/^[a-z]$/.test(content) && /^[a-z]/.test(next)) {
        errors.push('Small letters go two per cell — fill this cell before starting the next one');
      }
    }
  }

  /* ------------------------- punctuation cells ------------------------- */
  const punct = isPure ? value : tail;
  if (punct) {
    const ellipsis = isPure && isEllipsis(value);

    // One punctuation mark per cell (exceptions: ellipsis, `."` style pairs)
    if (!ellipsis && !isValidPunctGroup(punct)) {
      const distinct = new Set([...punct]);
      errors.push(
        distinct.size > 1
          ? 'Cannot mix different types of punctuation in the same cell'
          : 'Only one punctuation mark per cell'
      );
    }

    const closing = isClosingPunct(grid, r, c, punct);

    // Rule: closing punctuation can't be in the first cell of a line
    if (isPure && c === 0 && !ellipsis && closing) {
      errors.push(
        'Punctuation not allowed in first cell of line — put it beside the last letter of the previous line'
      );
    }

    //Rule: no two punctuation next to each other " '

    // Rule: no closing punctuation at the start of a paragraph (after the indent)
    if (
      isPure &&
      c === 1 &&
      !ellipsis &&
      closing &&
      norm(row[0]) === '' &&
      starts.has(r)
    ) {
      errors.push('Punctuation not allowed in the start of the paragraph');
    }

    // Rule: don't add a space before closing punctuation
    // (c === 1 is covered by the rules above)
    if (isPure && c > 1 && !ellipsis && closing && prevCell === '') {
      errors.push('Don\'t add space before ; , \' " : . ? !');
    }

    const needsSpaceAfter = /[?!]/.test(punct);
    const noSpaceAfter =
      !needsSpaceAfter && !ellipsis && (/[.,:;]/.test(punct) || QUOTE_RE.test(punct));

    // Rule: no empty cell after . , : ; ' "
    // Only when something is written after the gap (so a paragraph end is fine).
    if (noSpaceAfter && !isEndOfRow && nextCell === '' && c + 2 <= lastCol) {
      if (norm(row[c + 2]) !== '') {
        errors.push('No empty cell allowed after . , : ; \' "');
      }
    }

    // Rule: must leave an empty cell after ? !
    // (a closing quote / bracket in the next cell is fine)
    if (needsSpaceAfter && !isEndOfRow && nextCell !== '') {
      const nextIsClosing =
        /^[”’)]$/.test(nextCell) || getQuoteRole(grid, r, c + 1) === 'close';
      if (!nextIsClosing) {
        errors.push('Must leave empty cell after ? or !');
      }
    }

    // Rule: an ellipsis takes two cells (one ellipsis per cell)
    if (ellipsis && nextP) {
      const next = cellAt(grid, nextP);
      const nextE = isEllipsis(next);
      const prevE = prevP ? isEllipsis(cellAt(grid, prevP)) : false;
      const nextSeen = next !== '' || touchedPos(nextP) || after(c + 2);
      if (!nextE && !prevE && nextSeen) {
        errors.push('An ellipsis takes two cells');
      }
    }
  }

  return errors;
};

/**
 * Validate entire grid
 * Returns object: { "row-col": [errors] }
 */
export const validateGrid = (grid, touchedCells = {}, options = {}) => {
  const starts = new Set(options.paragraphStarts ?? [0]);
  const errors = validateFlow(grid, starts);

  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellErrors = validateCell(cell, rowIndex, colIndex, grid, touchedCells, starts);
      if (cellErrors.length > 0) {
        const key = `${rowIndex}-${colIndex}`;
        errors[key] = [...(errors[key] || []), ...cellErrors];
      }
    });
  });

  return errors;
};

/**
 * Get error for a specific cell
 */
export const getCellErrors = (rowIndex, colIndex, errors) => {
  const key = `${rowIndex}-${colIndex}`;
  return errors[key] || [];
};

/**
 * Check if a cell has errors
 */
export const hasCellError = (rowIndex, colIndex, errors) => {
  return getCellErrors(rowIndex, colIndex, errors).length > 0;
};

export default {
  validateGrid,
  getCellErrors,
  hasCellError,
  startNewParagraph,
  getEditableLimit,
  getLastContentRow,
  isPunctuation,
  isDigit,
  isEnglish,
  isHangul,
};
