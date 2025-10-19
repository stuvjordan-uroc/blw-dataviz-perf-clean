//types
import type { RequestedSplit, ResponsesExpanded } from "../components/visualization/VizRoot";
import type { CharacteristicDataState } from "./useCharacteristicData";
import type { VizTab } from "../components/Viz";
import type { RefObject } from "react";
//hooks
import { useRef, useEffect } from "react";
/*
  Here we invoke a hook that will set up the drawing logic for the canvas.

  The hook will take a props:

  + the charactersticData state
  + the requestedSplit state
  + the responsesExpanded state
  + whether the canvas is the "imp" or "perf" canvas

  The hook will:

  + create a ref for the canvas.
  + Declare a useEffect with all of the reactive variables in the list above as dependencies
  + return the ref to the canvas so that caller can set the ref on the appropriate canvas element.

  Because the useEffect will have all of those react vars as dependencies,
  It will re-run everytime one of them changes.

  Thus we an put all of the data loading, data errored logic into that useEffect callback, and we can put
  all of the coordinate drawing logic into that callback.
  */


interface UseCanvasProps {
  characteristicData: CharacteristicDataState,
  requestedSplit: RequestedSplit,
  responsesExpanded: ResponsesExpanded,
  vizTab: VizTab
}

type CanvasRef = RefObject<HTMLCanvasElement | null>

export default function useCanvas({
  characteristicData,
  requestedSplit,
  responsesExpanded,
  vizTab: vizTab,
}: UseCanvasProps): CanvasRef {
  const canvasRef: CanvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {

  }, [characteristicData, requestedSplit, responsesExpanded])
  return canvasRef
}