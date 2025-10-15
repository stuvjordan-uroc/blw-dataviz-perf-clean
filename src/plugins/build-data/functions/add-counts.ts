import type { Response, Split } from "../../../assets/raw-data/meta-types";
//Note: This function mutates the objects in the 
//responses array that you pass to it!
function addCountsToResponses(
  responses: Response[],
  sampleSize: number
): (Response & { count: number })[] {
  type WithCounts = Response & { count: number, floatCount: number }
  //add the floatCount and count to each response object.
  const withCounts: WithCounts[] = responses.map((response) => {
    const floatCount = response.proportion * sampleSize;
    return ({
      ...response,
      floatCount: floatCount,
      count: Math.floor(floatCount)
    })
  })
  //adjust the counts upward until we get to the sample size
  while (withCounts.reduce((acc: number, curr) => acc + curr.count, 0) < sampleSize) {
    const farthest = withCounts.reduce(((acc: WithCounts, curr: WithCounts) =>
      (acc.floatCount - acc.count > curr.floatCount - curr.count) ? acc : curr
    ))
    farthest.count = farthest.count + 1
  }
  //ready to return
  //remove the float counts
  withCounts.forEach((withCount) => {
    delete (withCount as (Response & { count: number, floatCount?: number })).floatCount
  })
  return withCounts as (Response & { count: number })[]
}

export interface SplitWithCount {
  wave: { index: number, value: number } | null,
  party: { index: number, value: string[] } | null,
  responses: null | {
    expanded: (Response & { count: number })[],
    collapsed: (Response & { count: number })[]
  }
}

function numPointsInSplit(split: Split, sampleSize: number, numPartyGroups: number, numWaves: number): number {
  return sampleSize * ((split.wave === null) ? numWaves : 1) * ((split.party === null) ? numPartyGroups : 1)
}

export function addCounts(split: Split, sampleSize: number, numPartyGroups: number, numWaves: number): SplitWithCount {
  if (split.responses === null) {
    return ({
      ...split,
      responses: null
    })
  }
  const numPoints = numPointsInSplit(split, sampleSize, numPartyGroups, numWaves);
  return ({
    ...split,
    responses: {
      expanded: addCountsToResponses(split.responses.expanded, numPoints),
      collapsed: addCountsToResponses(split.responses.collapsed, numPoints)
    }
  })
}
