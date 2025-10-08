import type { Response } from "../../../assets/raw-data/meta-types";
//Note: This function mutates the objects in the 
//responses array that you pass to it!
export function addCounts(
  responses: Response[],
  sampleSize: number
): (Response & { count: number })[] {
  type WithCounts = Response & { count: number, floatCount: number }
  //add the floatCount and count to each response object.
  responses.forEach((response) => {
    const floatCount = response.proportion * sampleSize;
    (response as WithCounts).floatCount = floatCount;
    (response as WithCounts).count = Math.floor(floatCount);
  })
  //adjust the counts upward until we get to the sample size
  while (responses.reduce((acc: number, curr) => acc + (curr as WithCounts).count, 0) < sampleSize) {
    const farthest = (responses as WithCounts[]).reduce(((acc: WithCounts, curr: WithCounts) =>
      (acc.floatCount - acc.count > curr.floatCount - curr.count) ? acc : curr
    ))
    farthest.count = farthest.count + 1
  }
  //remove the float counts
  (responses as WithCounts[]).forEach((response) => {
    delete (response as Response & { count: number, floatCount?: number }).floatCount
  })
  return responses as (Response & { count: number })[]
}