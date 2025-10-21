//types
import type { ReactElement } from "react";
import type { VizTab } from "../../Viz";
import type { RequestedSplit, ResponsesExpanded } from "../VizRoot";
import type { VizConfig, Layout } from "../../../assets/config/viz-config";
//context
import { useContext } from "react";
import { CharacteristicDataContext } from "../../../contexts/characteristicDataContextValue";
import Segment from "./Segment";
import { BreakpointContext } from "../../../contexts/breakpointContext";
//config
import vizConfig from "../../../assets/config/viz-config.json";

interface SegmentsProps {
  vizTab: VizTab;
  requestedSplit: RequestedSplit;
  responsesExpanded: ResponsesExpanded;
  containerRect: DOMRect;
  topOffset: number;
}

export default function Segments({
  vizTab,
  requestedSplit,
  responsesExpanded,
  containerRect,
}: SegmentsProps): ReactElement | null {
  const characteristicDataContext = useContext(CharacteristicDataContext);
  const characteristicData = characteristicDataContext?.[0];
  const breakpoint = useContext(BreakpointContext);

  if (
    !characteristicData ||
    !characteristicData?.data ||
    !requestedSplit.response
  ) {
    return null;
  }

  const typedVizConfig = vizConfig as VizConfig;
  const foundCurrentLayout = typedVizConfig.layouts.find(
    (layout) => layout.breakpoint === breakpoint
  );
  const currentLayout: Layout = foundCurrentLayout
    ? foundCurrentLayout
    : typedVizConfig.layouts[0];
  const canvasMarginX = (containerRect.width - currentLayout.vizWidth) / 2;
  const leftOffset = canvasMarginX;

  const segmentNodes = characteristicData.data[
    vizTab === "imp" ? "impData" : "perfData"
  ].splits
    .filter((split) => {
      const waveMatches =
        (requestedSplit.wave === false && split.wave === null) ||
        (requestedSplit.wave === true && split.wave !== null);

      const partyMatches =
        (requestedSplit.party === false && split.party === null) ||
        (requestedSplit.party === true && split.party !== null);

      return waveMatches && partyMatches && split.responses !== null;
    })
    .map((split, splitIndex) =>
      split.responses![responsesExpanded].map(
        (splitPWithSegment, splitPWithSegmentIndex) => (
          <Segment
            leftOffset={leftOffset}
            topOffset={0}
            splitProportionWithSegment={splitPWithSegment}
            party={split.party}
            wave={split.wave}
            key={`${splitIndex}-${splitPWithSegmentIndex}-${requestedSplit.response}-${requestedSplit.wave}-${requestedSplit.party}-${responsesExpanded}`}
          />
        )
      )
    )
    .flat(1);

  return <div>{segmentNodes}</div>;
}
