## Build basic layout + css for

- DONE body (set background color, flex column align items center, overflow clip)
- DONE App -- child of body (set width as function of breakpoint, height to screen height, overflow clip)
- DONE Header -- child of app...copy from old app
- DONE picker -- take from bot's generated code...simplify as much as possible
- DONE Viz container -- empty for now...width 100%, height set to fill all remaining space, overflow clip

## Build tabs for imp/perf into Viz.tsx

DONE

## Build the VizRoot to hold the controls and canvas

- DONE Define state that tracks which split is requested
- DONE Define state that tracks whether response groups are expanded or collapsed
- DONE Rough out component that allows user to pick the split
- DONE Rough out component that hosts the canvas.

## Spinner to indicate data loading state in canvas container

DONE

## Get data loading hook to behave as required when a characteristic is picked.

DONE

## Wire up canvas to show data loading/error/ready state, without displaying any data

## Start working on canvas-drawing functions.

## All downloaded type defs are in meta.json. Fix data generation and download to get rid of coordinate type files.
