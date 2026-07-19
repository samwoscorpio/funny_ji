const assert = require("node:assert/strict");
const core = require("../tactical-core.js");

const map = { rows: 8, cols: 8 };

assert.equal(core.sameTile({ row: 1, col: 2 }, { row: 1, col: 2 }), true);
assert.equal(core.sameTile({ row: 1, col: 2 }, { row: 2, col: 1 }), false);
assert.deepEqual(core.cloneTile({ row: 3, col: 4 }), { row: 3, col: 4 });
assert.equal(core.inBounds({ row: 0, col: 0 }, map), true);
assert.equal(core.inBounds({ row: 8, col: 0 }, map), false);

assert.deepEqual(core.directionalNeighbors({ row: 2, col: 3 }), [
  { row: 2, col: 2 }, { row: 2, col: 4 }, { row: 1, col: 3 },
  { row: 1, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 2 },
]);
assert.deepEqual(core.directionalNeighbors({ row: 3, col: 3 }), [
  { row: 3, col: 2 }, { row: 3, col: 4 }, { row: 2, col: 3 },
  { row: 2, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 4 },
]);

const edge = core.edgeKey({ row: 4, col: 1 }, { row: 3, col: 2 });
assert.equal(edge, "3,2|4,1");
assert.equal(core.normalizeEdgeKey("4,1|3,2"), edge);
assert.equal(core.seededIndex(7, "ROOM:4:energy"), core.seededIndex(7, "ROOM:4:energy"));
assert.ok(core.seededIndex(7, "ROOM:4:energy") >= 0 && core.seededIndex(7, "ROOM:4:energy") < 7);

console.log("tactical-core tests passed");
