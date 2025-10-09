import type { Layout } from "../../../assets/config/config-types";
import type { Response } from "../../../assets/raw-data/meta-types";
import type { PointPosition } from "./point-positions";
import { pointPositions } from "./point-positions";

interface Segment {
  topLeftY: number,
  topLeftX: number,
  height: number,
  width: number,
  pointPositions: PointPosition[],
  error: boolean
}

type ResponseWithSegment = Response & { count: number } & { segment: Segment }

interface SegmentGroup {
  topLeftX: number,
  topLeftY: number,
  widthToBeDistributed: number,
  height: number
}

function segmentGroup(
  wave: { index: number, value: number } | null,
  party: { index: number, value: string[] } | null,
  responseArrayLength: number,
  layout: Layout,
  numWaves: number,
  numPartyGroups: number
): SegmentGroup {
  const vizHeight = numWaves * (layout.labelHeight + layout.waveHeight)
  const totalGroupWidth = (party === null) ? layout.vizWidth : (layout.vizWidth - layout.partyGap * (numPartyGroups - 1)) / numPartyGroups
  return ({
    topLeftX: (party === null) ? 0 : party.index * (totalGroupWidth + layout.partyGap),
    topLeftY: layout.labelHeight + ((wave === null) ? 0 : wave.index * (layout.labelHeight + layout.waveHeight)),
    widthToBeDistributed: totalGroupWidth - layout.responseGap * (responseArrayLength - 1),
    height: (wave === null) ? vizHeight - layout.labelHeight : layout.waveHeight
  })
}

function segments(
  responses: (Response & { count: number })[],
  segmentGroup: SegmentGroup,
  responseGap: number,
  pointRadius: number
): ResponseWithSegment[] {
  responses.forEach((response, responseIdx) => {
    const responseTopLeftX = responses.slice(0, responseIdx).reduce((acc: number, curr) =>
      acc + responseGap + curr.proportion * segmentGroup.widthToBeDistributed,
      segmentGroup.topLeftX
    )
    const responseWidth = segmentGroup.widthToBeDistributed * response.proportion;
    const positions = pointPositions(
      segmentGroup.topLeftX,
      segmentGroup.topLeftY,
      responseWidth,
      segmentGroup.height,
      response.count,
      pointRadius
    );
    (response as ResponseWithSegment).segment = {
      topLeftX: responseTopLeftX,
      topLeftY: segmentGroup.topLeftY,
      width: responseWidth,
      height: segmentGroup.height,
      pointPositions: positions.data,
      error: positions.error
    }
  })
  return responses as ResponseWithSegment[]
}



export function addSegments(
  wave: { index: number, value: number } | null,
  party: { index: number, value: string[] } | null,
  responses: (Response & { count: number })[],
  layout: Layout,
  numWaves: number,
  partyResponseGroups: string[][]
): ResponseWithSegment[] {
  const group = segmentGroup(
    wave,
    party,
    responses.length,
    layout,
    numWaves,
    partyResponseGroups.length
  )
  const responsesWithSegments = segments(
    responses,
    group,
    layout.responseGap,
    layout.pointRadius
  )
  return responsesWithSegments
}