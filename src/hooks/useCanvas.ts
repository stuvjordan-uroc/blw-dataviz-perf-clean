//types
import type { RequestedSplit, ResponsesExpanded } from "../components/visualization/VizRoot";
import type { CharacteristicDataState } from "./useCharacteristicData";
import type { VizTab } from "../components/Viz";
import type { RefObject } from "react";
import type { PointPosition } from "../assets/config/meta";
//hooks
import { useRef, useEffect, useState } from "react";
import { start } from "repl";
/*
  Here we invoke a hook that will set up the drawing logic for the canvas.

  The hook will take a props:

  + the charactersticData state
  + the requestedSplit state
  + the responsesExpanded state
  + whether the canvas is the "imp" or "perf" canvas

  The hook will:

  + create a ref for the canvas.
  + create a ref that models the "respondents" to the relevant question ("imp" or "perf"), and where each one is currently displayed in the canvas
  + Declare a useEffect with all of the reactive variables in the list above as dependencies
  + return the ref to the canvas so that caller can set the ref on the appropriate canvas element.
  + return state to the caller that informs whether there was an error in drawing on the canvas.

  Because the useEffect will have all of those react vars as dependencies,
  It will re-run everytime one of them changes.  Each time the useEffect callback fires it will:
  + populate the "respondents" ref if it has not yet been populated
  + update the locations of the respondents to match the currently requested view
  + re-draw the respondents at their (updated) locations

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

interface RespondentGroup {
  wave: [string, number[]],
  party: [string, string[]],
  response: string[],
  count: number,
  positions: (PointPosition | null)[]  //we allow null point positions 
  // so we can fudge thing if there are
  //  mis-matches in the point counts
}

function updateToUnsplitPositions(respondentGroups: RespondentGroup[], pointPositions: PointPosition[]): void {
  let startingPointIndex = 0;
  for (const respondentGroup of respondentGroups) {
    const positionsNeeded = respondentGroup.count
    const positionsRemaining = pointPositions.length - startingPointIndex
    const nullsNeeded = Math.min(Math.max(positionsNeeded - positionsRemaining, 0), positionsNeeded)
    respondentGroup.positions = [
      ...pointPositions.slice(startingPointIndex, startingPointIndex + respondentGroup.count),
      ...Array.from({ length: nullsNeeded }, () => (null))
    ] as (PointPosition | null)[]
    startingPointIndex += respondentGroup.count
  }
}

export default function useCanvas({
  characteristicData,
  requestedSplit,
  responsesExpanded,
  vizTab: vizTab,
}: UseCanvasProps): CanvasRef {
  const canvasRef: CanvasRef = useRef<HTMLCanvasElement | null>(null)
  const respondentGroups = useRef<RespondentGroup[]>([])

  useEffect(() => {
    if (characteristicData.state === "ready" && characteristicData.data) {
      const data = characteristicData.data[(vizTab === "imp") ? "impData" : "perfData"]
      if (data.unsplitPositions.data.length > 0) {

        /*  POPULATE THE respondentGroups REF if it has not already been populated  */
        if (respondentGroups.current.length === 0) {
          data.splits.forEach((split) => {
            if (split.party !== null && split.wave !== null && split.responses !== null) {
              const wave = split.wave
              const party = split.party
              split.responses.expanded.forEach((responseGroup) => {
                respondentGroups.current.push({
                  wave: wave.value,
                  party: party.value,
                  response: responseGroup.response,
                  count: responseGroup.count,
                  positions: Array.from({ length: responseGroup.count }, () => ({ x: 0, y: 0, cx: 0, cy: 0 }))
                })
              })
            }
          })
        }




        /* UPDATE THE respondentGroups POSITIONS */
        if (requestedSplit.response) {
          //one of the split-by-response views requested
          if (requestedSplit.wave) {
            //one of the split-by-wave views requested
            if (requestedSplit.party) {
              //split-by-response-and-wave-and-party requested
            } else {
              //split-by-response-and-wave requested
            }
          } else {
            if (requestedSplit.party) {
              //split-by-response-and-party requested
            } else {
              //split-by-response requested
              //we want the ONE split where wave and party are both null
              const splitWeWant = data.splits.find((split) => (split.party === null && split.wave === null))
              if (splitWeWant && splitWeWant.responses) {
                //assign points
                splitWeWant.responses[responsesExpanded].forEach((responseGroupInData) => {
                  let startingPointIndex = 0;
                  const outerSet = new Set(responseGroupInData.segment.pointPositions)
                  for (const respondentGroup of respondentGroups.current) {
                    if ((new Set(respondentGroup.response)).isSubsetOf(outerSet)) {
                      if (startingPointIndex + respondentGroup.count > responseGroupInData.segment.pointPositions.length) {
                        errorFlag = true
                        console.warn(`In ${vizTab} at ${responseGroupInData.response}, the total number of point positions is too few.`)
                        break;
                      }
                      respondentGroup.positions = responseGroupInData.segment.pointPositions.slice(
                        startingPointIndex,
                        startingPointIndex + respondentGroup.count
                      )
                      startingPointIndex += respondentGroup.count
                    }
                  }
                })
              } else {
                console.warn(`data for ${vizTab} has no split with party === null and wave === null OR the data has that split, but no point positions at that split.`)
              }
            }
          }
        } else {
          //unsplit view is requested
          updateToUnsplitPositions(respondentGroups.current, data.unsplitPositions.data)
        }




        /* DRAW THE NEW POINT POSITIONS */
        if (canvasRef.current) {
          const ctx = canvasRef.current?.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            for (const respondentGroup of respondentGroups.current) {
              const image = (requestedSplit.party) ? characteristicData.data.images 
              for (const respondent of respondentGroup.positions) {

                ctx.drawImage(characteristicData.data.images)
              }
            }
          }

        }
        //In future iterations we will animate from the 
        //old point coordinates to the new
      }
    }

    if (characteristicData.state !== "ready" && respondentGroups.current.length > 0) {
      //somehow we've ended up with data not ready, but respondentGroupos populated.
      //So empty out the respondents ref
      respondentGroups.current = [];
    }

  }, [characteristicData, requestedSplit, responsesExpanded])
  return canvasRef
}