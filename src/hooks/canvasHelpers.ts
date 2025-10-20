// Module-scope helpers for canvas drawing logic.
import type { RespondentGroup } from "./useCharacteristicData";
import type { PointPosition, SplitWithSegments } from "../assets/config/meta";
import type { ResponsesExpanded } from "../components/visualization/VizRoot";

// helper to test whether split.party and split.wave have the desired null-ness
export function splitNullity(
  split: SplitWithSegments,
  partyShouldBeNull: boolean,
  waveShouldBeNull: boolean
): boolean {
  const partyMatches = partyShouldBeNull ? split.party === null : split.party !== null;
  const waveMatches = waveShouldBeNull ? split.wave === null : split.wave !== null;
  return partyMatches && waveMatches;
}

// helper to decide whether a given respondentGroup belongs to a given split from the data.
export function respondentGroupMatchesSplit(
  respondentGroup: RespondentGroup,
  split: SplitWithSegments,
  partyShouldBeNull: boolean,
  waveShouldBeNull: boolean
): boolean {
  if (waveShouldBeNull) {
    // we don't filter by wave, only by party (or neither)
    return partyShouldBeNull
      ? true // split-by-response view
      : respondentGroup.party[0] === split.party?.value[0]; // split-by-response-and-party view
  } else {
    // we must match wave; optionally also match party
    if (partyShouldBeNull) {
      // split-by-response-and-wave view
      return respondentGroup.wave[0] === split.wave?.value[0];
    }
    // split-by-response-and-wave-and-party view
    return (
      respondentGroup.wave[0] === split.wave?.value[0] &&
      respondentGroup.party[0] === split.party?.value[0]
    );
  }
}

// Take `count` positions from segmentPositions starting at startIndex and pad with nulls as needed.
// Returns the positions slice and the updated index.
export function takePositionsFromSource(
  segmentPositions: PointPosition[],
  startIndex: number,
  count: number
): { positions: (PointPosition | null)[]; newIndex: number } {
  const positionsRemaining = Math.max(segmentPositions.length - startIndex, 0);
  const nullsNeeded = Math.min(Math.max(count - positionsRemaining, 0), count);
  const positions = [
    ...segmentPositions.slice(startIndex, startIndex + count),
    ...Array.from({ length: nullsNeeded }, () => null),
  ] as (PointPosition | null)[];
  return { positions, newIndex: startIndex + count };
}

// Choose the correct image for a group depending on whether party is shown and responsesExpanded
export function chooseImageForGroup(
  respondentGroup: RespondentGroup,
  responsesExpanded: ResponsesExpanded,
  partyShouldBeNull: boolean
): HTMLImageElement | undefined {
  return partyShouldBeNull
    ? respondentGroup.images[responsesExpanded].noParty
    : respondentGroup.images[responsesExpanded].party;
}

// Draw given image at all non-null positions using the supplied 2D context.
export function drawPositions(
  ctx: CanvasRenderingContext2D | null | undefined,
  image: HTMLImageElement | undefined,
  positions: (PointPosition | null)[]
): void {
  if (!ctx || !image) return;
  for (const pos of positions) {
    if (pos) ctx.drawImage(image, pos.x, pos.y);
  }
}
