import type { Response } from "../../../assets/raw-data/meta-types";
export function addCounts(
  responses: Response[],
  sampleSize: number
): Response & { count: number } {
  type WithCount = Response & { count: number, floatCount: number }
  const withCounts: WithCount[] = responses.map((response) => ({
    ...response,
    count: Math.floor(response.proportion * sampleSize),
    floatCount: response.proportion * sampleSize
  }))
  while (withCounts.reduce((acc: number, curr) => acc + curr.count, 0) < sampleSize) {
    const farthest = withCounts.reduce(((acc: WithCount, curr) =>
      (acc.floatCount - acc.count > curr.floatCount - curr.count) ? acc : curr
    ))
    farthest.count = farthest.count + 1
  }
  return withCounts.map((response) => Object.fromEntries(
    Object.entries(response).filter(([key, _val]) => key !== "floatCount")
  ))
}