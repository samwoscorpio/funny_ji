# Tide Ruins Isometric Asset Manifest

## Visual Contract

- Camera: fixed 2D isometric, approximately 45 degrees.
- Light: upper left.
- Tile: broad stone hex with visible front and side cliff thickness.
- Layer order: floor, low walls and terrain, objective props, units, overlays.
- The assets below are the approved production direction, not temporary CSS textures.

## Terrain V1

| Game element | Asset | Status |
| --- | --- | --- |
| Walkable floor | `assets/iso-arena/terrain/iso-floor-v1.png` | Ready |
| Grass / concealment | `assets/iso-arena/terrain/iso-grass-v1.png` | Ready |
| Boulder / blocked tile | `assets/iso-arena/terrain/iso-boulder-v1.png` | Ready |
| Objective | `assets/iso-arena/terrain/iso-altar-v1.png` | Ready |
| Energy point | `assets/iso-arena/terrain/iso-energy-v1.png` | Ready |
| Fire hazard | `assets/iso-arena/terrain/iso-flame-v1.png` | Ready |

The source atlas is retained at `assets/iso-arena/source/tide-ruins-terrain-atlas-v1-chromakey.png` for regeneration and audit.

## Still Needed

1. Six-direction thin-wall edge pieces.
2. Hero-specific pixel standees, team rings, movement and targeting overlays.
3. A surrounding cliff-and-water edge kit for the playable board.

## Integration Guardrail

`tactical.js` remains the authority for map coordinates, line-of-sight, movement, targeting, editing, and combat. The new renderer may only consume that state and emit a visual representation.
