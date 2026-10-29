# STRATOKS interface system

## Overview

STRATOKS is an observer for a persistent 280×280 learning world. A bright, painted isometric scene fills the screen; compact charcoal/moss controls use warm gold for the primary action and selection. The original golden scalloped, leaf-crowned species is used consistently in world sprites, portraits, logo, favicon and share image. The fresh review starts a clearly labeled isolated engine demo; recorded and owner/live sources keep separate labels.

Canonical source: `web/src/expanse/expanse.css` plus its later `living.css` additions, `App.tsx`, `Map.tsx`, `Inspector.tsx`, `appearance.ts`, `worldRenderer.ts`, `ground.ts` and `projection.ts`. Reuse the existing UI and projection system. The retired `#settlement` route has no writable client or wallet bundle.

## Colors

Tokens are scoped to `.exp-app`. `living.css` is loaded after `expanse.css`, so its four moss overrides below are authoritative. The existing hex notation is retained.

| Token | Implemented value | Role |
| --- | --- | --- |
| `--hud-deep` | `#202a24` | Header/footer, recessed fields, primary-button text |
| `--hud` | `#28362d` | Floating surfaces, inspector and evidence |
| `--hud-raised` | `#344438` | Neutral controls |
| `--hud-hover` | `#425546` | Hover/selected neutral controls |
| `--hud-text` | `#f5efd9` | Primary text |
| `--hud-muted` | `#bdc8b6` | Secondary text |
| `--gold` | `#e8c36e` | Primary action fill and selected-control cue |
| `--gold-hover` | `#f0d494` | Primary-action hover |
| `--hud-line` | `#52624e` | Structural dividers |
| `--hud-danger` | `#f3b3a1` | Failure/error evidence |
| `--focus` | `#ffe1a0` | DOM-control focus perimeter |

Connection state includes written labels; color alone never distinguishes live, recorded, isolated or stale data. Biome markers use the same four categories as `BIOME_COLORS` in `Map.tsx`: forest `#729451`, arid `#d5bb82`, cold `#d2e2e3`, coast `#65b4b3`. Terrain colors are indexed by the server's tile IDs in `ground.ts`, with exact per-tile biome tints and brush details. Ground paint never changes mechanics or creates resources. Actual measured HUD contrast pairs and unmeasured image/canvas pairs are recorded in `artifacts/living-interface/VALIDATION.md` and `browser-results.json`.

## Typography

The local Manrope Variable WOFF2 is loaded through `web/src/styles.css` and the existing `@fontsource-variable/manrope` dependency. The UI uses weights 400, 600 and 800 where the incumbent system calls for them. Georgia / Times New Roman / serif at 400 carries the world title and resident name. The original SVG wordmark uses system Georgia at 700 as artwork. No remote font is requested.

The six-size scale is **12, 14, 16, 20, 24, 32 px**. Captions/data use 12; controls and dense prose 14; inputs/section headings 16; compact headings 20; resident names and the phone world title 24; the desktop world title 32. Line height is 1.5–1.6 for prose/data and 1.15–1.25 for headings. Large-title tracking is −0.02em; body tracking is natural. Changing values use tabular numerals. Names, resource keys and IDs wrap instead of being truncated. Mobile inputs/selects remain 16px.

## Layout

The application occupies `100dvh` with a `100vh` fallback and safe-area insets. The map is the main content; the title and “Find residents” action float over it. There is no marketing page above the world. Desktop rows are a 68px header, 34px status strip, flexible map/workspace and 34px footer. Controls use 24–28px outer insets, 8–12px local gaps and 16–24px group spacing. Buttons are normally 40–44px; compact landscape controls use 32–40px widths with distinct spacing.

Above 700px, the optional resident/records/settlement inspector takes 352px (368px above 1100px). At 1000px and below the header becomes compact. At 700px and below the rows become 60/32/flexible/30px plus safe areas; the inspector becomes a separately scrolling bottom sheet occupying 44% of the workspace. The remaining map is its own resized viewport, preserving selection/follow. When desktop map width changes, the camera span changes in the same proportion so residents retain their screen size; a phone sheet changes height only and keeps its zoom. The default phone span is 9.5 rather than 22 on desktop, with actual camera bounds/aspect determining the final clamp.

At widths ≤360px, logo/control spacing tightens. At phone heights ≤720px, navigation is a horizontal rail above the independent zoom row. An expanded atlas uses the title's space, temporarily hides the scene heading/notice, and closes after a pointer or arrow location is chosen. With an open inspector on a short map it also temporarily hides the rail; the atlas close toggle and header remain available. This avoids covered navigation targets. In 540–700px short landscape layouts the title/actions share a row and zoom starts after the wider navigation rail. Notices and follow status otherwise flow with an 8px gap; they do not assume a single-line height.

The six representative browser sizes are 320×568, 390×600, 390×844, 667×390, 851×650 and 1440×900. Actual browser results are in the validation artifact. These are emulated viewports, not physical safe-area or native-zoom certification.

## Elevation & Depth

HUD panels use opaque moss surfaces and restrained transparent shadows. Borders communicate fields, list divisions, selection and construction/evidence structure; ordinary raised surfaces do not combine a border and shadow. Terrain, ground wear, ground-depth-sorted sprites, map controls, inspector and native modal form the stacking order. World art anchors are ground contacts, not image centers.

The canvas focus ring is inset so clipping cannot remove it and uses a two-color charcoal/gold perimeter. Other controls use a three-pixel focus outline with three-pixel offset. Decorative compass, light/ground details and sprite shadows do not intercept pointers.

## Shapes

Buttons and fields use 8px radii; tool groups 10–12px; the scene title keeps a 3px leading corner with 18px outer corners; the native modal uses 18px. The mobile inspector uses 16px top corners. Portraits sit on recessed round surfaces. Transparent world silhouettes remain separate from UI surfaces and never become rectangular entity cards.

## Components

- **`WorldMap` / `MiniMap` (`Map.tsx`)**: pointer drag/pinch, wheel zoom, keyboard arrows and +/−, resident picking, exact terrain evidence, home navigation, chunk atlas and viewport polygon. The roster provides a keyboard selection alternative to canvas picking. The atlas's Enter/Space activation preserves camera position; arrows select an explicit chunk. `TileEvidence` shows only received nodes, sites, materials, stores and tick, with an explicit close action.
- **`projection.ts`**: the only transforms for camera, picking, pointer-centered zoom, bounded viewport requests and minimap. Reuse these functions; never adjust coordinates to fit art.
- **`WorldRenderer` / `appearance.ts`**: culling, foot-depth sorting, state-gated sprites and movement interpolation for adjacent confirmed positions in consecutive engine ticks. Missing intermediate paths snap. Loads require matching contents; fishing requires the engine state/phase and line; sleep requires actual sleep; tool-work poses additionally require a held supported work tool. Fire requires an existing record. No invented speech, emotion, encounters or scenery affects decisions.
- **`GroundCache` (`ground.ts`)**: fixed 8×8-tile rasters at 32 pixels per tile half-width, signatures from exact terrain/biomes plus a neighbour halo, at most 96 LRU rasters (about 52 MB RGBA) and one viewport composition at capped DPR 2. Camera/DPR changes blit cached paint. Changed terrain/world/rollback invalidates relevant rasters. Ground brush marks are decorative; real water boundaries, cliffs and blocking resources keep their actual traversal meaning.
- **`WornPaths` / `settlementWear` (`paths.ts`)**: soft earth approaches to reported shelters and up to 256 adjacent travel segments observed in the viewer. Water, cliffs, blocking nodes and diagonal corner cuts are excluded. The previous resource-bearing texture is removed; wear has no engine state or pathfinding effect.
- **`CreatureInspector` (`Inspector.tsx`)**: identity, needs, actual activity/phase/progress, weight/capacity, target and tools, Follow, evidence download and native expandable Plans/Perception/Learning panels. Predictions, uncertainty and outcomes remain separate. Pending/missing data has explicit recovery copy; recorded evidence keeps its tick label. Progress does not promise success.
- **Residents / records / settlements (`App.tsx`)**: one responsive side surface, actual search results and empty-state clear action, bounded event history and real world totals. Settlement rows are computed from actual API structure records, grouped spatially for navigation, filtered by biome. Selecting a row moves the observer only.
- **`Modal` (`web/src/Modal.tsx`)**: native dialog with inert background, Tab containment, Escape and focus return. World URL form uses native validation, a visible label, inline guidance/error and focus on invalid input. Help links the supplied model sheet and explains source/knowledge scopes.
- **Buttons**: `.exp-button.primary` (gold fill), `.exp-button` (moss), `.exp-icon` (named icon) and `.exp-text-button` (compact action). Hover, focus, pressed, pending and disabled states are explicit. Transitions name their properties and use 150 ms or less; press scale is 0.96 only with no reduced-motion preference.
- **`Portrait` / `drawSprite` (`art.tsx`)**: a single local character atlas for UI and world. `web/public/art/manifest.json` gives the 68 cell rectangles, pivots, input hashes and license. `logo.svg`, `favicon.png`/`.svg`, `share-world.jpg` and `model.webp` all use the leaf-crowned species. No wallet icons remain in the export.

## Do's and Don'ts

Start an added observer view with these tokens, button classes, native disclosures and the existing side-panel pattern. Keep the world visible, put the main action on the first phone screen, and state the actual data source. Add explicit pending/empty/error states next to their controls. Reuse the local font and the shared projection.

Render only engine-supported objects and activities. Read per-resident evidence for knowledge, never the observer atlas. Preserve the owner world/save identity; the demo checkpoint is exclusively private. Keep representative load art separate from exact quantity text. Do not add unobserved resources, prewritten tours, decorative routes, fake events, thoughts, wallet buttons or fabricated “live” data. Document supplied art and performance limits in validation rather than claiming a rig, device test or independent approval that does not exist.
