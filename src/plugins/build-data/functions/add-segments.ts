import type { Layout } from "../../../assets/config/config-types";
import type { Response } from "../../../assets/raw-data/meta-types";
import type { PointPosition } from "./point-positions";
import { pointPositions, pointPositions } from "./point-positions";

interface Segment {
  topLeftY: number,
  topLeftX: number,
  height: number,
  width: number,
  pointPositions: PointPosition[]
}

type ResponseWithSegment = Response & { count: number } & { segment: Segment }

function addSegments(
  wave: number | null,
  party: string[] | null,
  responses: (Response & { count: number })[],
  layout: Layout,
  numWaves: number,
  partyResponseGroups: string[][]
): ResponseWithSegment[] {
  if (wave === null) {
    //not split-by-wave
    const segmentHeight = (layout.labelHeight + layout.waveHeight) * numWaves
    const topLeftY = layout.labelHeight / 2
    if (party === null) {
      //split-by-response
      const widthToBeDistributed = layout.vizWidth - (responses.length - 1) * layout.responseGap
      responses.forEach((response, responseIdx) => {
        const topLeftX = responses.slice(0, responseIdx).reduce((acc: number, curr) => acc + layout.responseGap + curr.proportion * widthToBeDistributed, 0)
        const width = response.proportion * widthToBeDistributed;
        const positions = pointPositions(topLeftX, topLeftY, width, segmentHeight, response.count, layout.pointRadius);
        (response as ResponseWithSegment).segment = {
          topLeftX: topLeftX,
          topLeftY: topLeftY,
          width: width,
          height: segmentHeight,
          pointPositions: positions.data
        }
        if (positions.error) {
          console.warn("Point radius is too large for the segment at", wave, party, response.response)
        }
      })
      return responses as ResponseWithSegment[]
    } else {
      //split-by-response-and-party
      const partyTotalWidth = (layout.vizWidth - (partyResponseGroups.length - 1) * layout.partyGap) / partyResponseGroups.length
      const widthToBeDistributed = partyTotalWidth - (responses.length - 1) * layout.responseGap
      const foundPartyIdx = partyResponseGroups.findIndex((pg) => pg.join("|") === party.join("|"))
      const partyIdx = foundPartyIdx >= 0 ? foundPartyIdx : 0
      const partyTopLeftX = 
    }
  } else {
    //split-by-wave
    if (party === null) {
      //split-by-response-and-wave
    } else {
      //split-by-response-and-wave-and-party
    }
  }

}