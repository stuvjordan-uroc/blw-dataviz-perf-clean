//types
import type { RequestedSplit, ResponsesExpanded } from "../components/visualization/VizRoot";
import type { CharacteristicDataState, RespondentsRef, RespondentGroup } from "./useCharacteristicData";
import type { VizTab } from "../components/Viz";
import type { RefObject } from "react";
//hooks
import { useRef, useEffect } from "react";
import {
  splitNullity,
  respondentGroupMatchesSplit,
  takePositionsFromSource,
  chooseImageForGroup,
  drawPositions,
} from "./canvasHelpers";
import type { PointPosition } from "../assets/config/meta";
import type { SplitWithSegments } from "../assets/config/meta";

/*
  Here we invoke a hook that will set up the drawing logic for the canvas.

  The hook will take a props:

  + the charactersticData context (which is a tuple [charactersticData, respondents])
  + the requestedSplit state
  + the responsesExpanded state
  + whether the canvas is the "imp" or "perf" canvas

  The hook will:

  + create a ref for the canvas.
  + Declare a useEffect with all of the reactive variables in the list above as dependencies
  + return the ref to the canvas so that caller can set the ref on the appropriate canvas element.

  Because the useEffect will have all of those react vars as dependencies,
  It will re-run everytime one of them changes.  Each time the useEffect callback fires it will:
  + update the locations of the respondents to match the currently requested view
  + re-draw the respondents at their (updated) locations

  Thus we an put all of the data loading, data errored logic into that useEffect callback, and we can put
  all of the coordinate drawing logic into that callback.
  */


interface UseCanvasProps {
  characteristicDataContext: [CharacteristicDataState, RespondentsRef],
  requestedSplit: RequestedSplit,
  responsesExpanded: ResponsesExpanded,
  vizTab: VizTab
}

type CanvasRef = RefObject<HTMLCanvasElement | null>



export default function useCanvas({
  characteristicDataContext,
  requestedSplit,
  responsesExpanded,
  vizTab
}: UseCanvasProps): CanvasRef {
  const canvasRef: CanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [characteristicData, respondents] = characteristicDataContext



  // Note: update functions are defined inside the effect (below) so they don't need to be added to the deps.

  useEffect(() => {
    //The purpose of this effect is to redraw the canvas
    //Whenever the requested view or data state changes
    //Helper functions are defined inside the effect so they don't become external deps.
    function clearCanvas(): void {
      if (canvasRef.current) {
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    }

    function drawRespondentGroup(respondentGroup: RespondentGroup): void {
      const ctx = canvasRef.current?.getContext('2d')
      drawPositions(ctx, respondentGroup.imageToDraw, respondentGroup.positions)
    }

    //  update and draw for a split-by-response view
    function updateAndDrawSplitByResponse(splits: SplitWithSegments[], partyShouldBeNull: boolean, waveShouldBeNull: boolean): void {
      //clear the canvas to draw the new positions
      clearCanvas();
      //iterate through the splits in the data, sourcing point positions only from those not requested null
      for (const split of splits) {
        if (splitNullity(split, partyShouldBeNull, waveShouldBeNull) && split.responses) {
          //create a map that takes each response group in the current split to
          //an index that tracks where we are in sourcing from it's points
          const pointSources = split.responses[responsesExpanded].map((rg) => ({ ...rg, currentPointIndex: 0 }))
          //iterate through the respondent groups, selecting those that get their points from the current split
          for (const respondentGroup of respondents[vizTab].current) {
            //update only the respondent groups that match the current split on the dimensions that are not null
            if (respondentGroupMatchesSplit(respondentGroup, split, partyShouldBeNull, waveShouldBeNull)) {
              const pointSourceWeWant = pointSources.find((rg) => (rg.response[0] === respondentGroup.response[responsesExpanded][0]))
              if (pointSourceWeWant) {
                const { positions, newIndex } = takePositionsFromSource(
                  pointSourceWeWant.segment.pointPositions,
                  pointSourceWeWant.currentPointIndex,
                  respondentGroup.count
                )
                respondentGroup.positions = positions
                pointSourceWeWant.currentPointIndex = newIndex
                respondentGroup.imageToDraw = chooseImageForGroup(respondentGroup, responsesExpanded, partyShouldBeNull)
                drawRespondentGroup(respondentGroup)
              }
            }
          }
        }
      }
    }

    function updateToUnsplit(positions: PointPosition[]): void {
      //clear the canvas
      clearCanvas();
      const positionsSource = { positions: positions, startingPointIndex: 0 }
      for (const respondentGroup of respondents[vizTab].current) {
        const { positions: taken, newIndex } = takePositionsFromSource(
          positionsSource.positions,
          positionsSource.startingPointIndex,
          respondentGroup.count
        )
        respondentGroup.positions = taken
        positionsSource.startingPointIndex = newIndex
        respondentGroup.imageToDraw = respondentGroup.images.unSplit
        drawRespondentGroup(respondentGroup)
      }
    }

    //if the data is ready and there is data to inform the drawing, update and draw the new point positions.
    if (characteristicData.state === "ready" && characteristicData.data) {
      const data = characteristicData.data[(vizTab === "imp") ? "impData" : "perfData"]
      if (data.unsplitPositions.data.length > 0) { //no need to go through this process if there are no positions to draw!
        /* update and draw the respondent positions*/
        if (requestedSplit.response) {
          updateAndDrawSplitByResponse(data.splits, !requestedSplit.party, !requestedSplit.wave)
        } else {
          //unsplit view is requested
          updateToUnsplit(data.unsplitPositions.data)
        }
        //In future iterations we will animate from the 
        //old point coordinates to the new
      }
    } else {
      //if the data is not ready or the data is ready but there is no data to draw, clear the canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
    // `respondents` is a stable object (an object containing two refs) provided by context.
    // We intentionally omit it from the dependency array because the effect only cares about
    // the current arrays stored in those refs at the time the effect runs; including the
    // container object would be unnecessary and can cause noisy re-runs if its identity
    // were to change.  See notes above about snapshotting if you need to avoid races.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characteristicData, requestedSplit, responsesExpanded, vizTab])
  return canvasRef
}