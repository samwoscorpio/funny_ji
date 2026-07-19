/*
 * Browser- and Node-safe tactical primitives.
 *
 * Keep map topology and deterministic helpers here so rendering, AI, editor,
 * and online synchronization do not each grow their own version of the rules.
 */
(function registerTacticalCore(root, factory) {
  const api = factory();
  root.JiTacticalCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof globalThis !== "undefined" ? globalThis : this, () => {
  function keyOf(position) {
    return `${position.row},${position.col}`;
  }

  function sameTile(first, second) {
    return Boolean(first && second && first.row === second.row && first.col === second.col);
  }

  function cloneTile(position) {
    return { row: position.row, col: position.col };
  }

  function inBounds(position, map) {
    return Boolean(position)
      && Number.isInteger(position.row)
      && Number.isInteger(position.col)
      && position.row >= 0
      && position.row < map.rows
      && position.col >= 0
      && position.col < map.cols;
  }

  // This preserves Projekt Ji's existing odd-row hex topology.
  function directionalNeighbors(position) {
    const diagonalCol = position.row & 1 ? position.col + 1 : position.col - 1;
    return [
      { row: position.row, col: position.col - 1 },
      { row: position.row, col: position.col + 1 },
      { row: position.row - 1, col: position.col },
      { row: position.row - 1, col: diagonalCol },
      { row: position.row + 1, col: position.col },
      { row: position.row + 1, col: diagonalCol },
    ];
  }

  function edgeKey(first, second) {
    return [keyOf(first), keyOf(second)].sort().join("|");
  }

  function parseEdgeKey(key) {
    return String(key || "")
      .split("|")
      .map((part) => {
        const [row, col] = part.split(",").map(Number);
        return { row, col };
      });
  }

  function normalizeEdgeKey(key) {
    const [first, second] = parseEdgeKey(key);
    return Number.isInteger(first?.row) && Number.isInteger(first?.col)
      && Number.isInteger(second?.row) && Number.isInteger(second?.col)
      ? edgeKey(first, second)
      : "";
  }

  function uniqueTiles(tiles) {
    const seen = new Set();
    return (tiles || [])
      .filter((tile) => inBounds(tile, { rows: Number.MAX_SAFE_INTEGER, cols: Number.MAX_SAFE_INTEGER }))
      .filter((tile) => {
        const key = keyOf(tile);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(cloneTile);
  }

  function seededIndex(length, seed) {
    if (!length) return 0;
    let hash = 2166136261;
    const value = String(seed);
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % length;
  }

  return Object.freeze({
    keyOf,
    sameTile,
    cloneTile,
    inBounds,
    directionalNeighbors,
    edgeKey,
    parseEdgeKey,
    normalizeEdgeKey,
    uniqueTiles,
    seededIndex,
  });
}));
