//types
import type { ReactElement } from "react";
import type {
  SplitProportionWithSegment,
  Wave,
  Party,
} from "../../../assets/config/meta";
import SegmentLabel from "./SegmentLabel";
//hooks
import { useState } from "react";

interface SegmentProps {
  splitProportionWithSegment: SplitProportionWithSegment;
  wave: Wave | null;
  party: Party | null;
  leftOffset: number;
  topOffset: number;
}

export default function Segment({
  splitProportionWithSegment,
  _wave,
  _party,
  leftOffset,
  topOffset,
}: SegmentProps): ReactElement {
  const [labelShowing, setLabelShowing] = useState(false);

  const handleToggle = (): void => {
    setLabelShowing((prevLabelShowing) => !prevLabelShowing);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: topOffset + splitProportionWithSegment.segment.topLeftY,
        left: leftOffset + splitProportionWithSegment.segment.topLeftX,
        width: splitProportionWithSegment.segment.width,
        height: splitProportionWithSegment.segment.height,
        border: labelShowing ? "1pt solid white" : "0pt solid white",
        // Touch-friendly CSS
        touchAction: "manipulation", // Prevents double-tap zoom delay
        cursor: "pointer",
        // Ensure minimum touch target size for very small segments
        minWidth: "24px",
        minHeight: "24px",
      }}
      onClick={handleToggle}
      onTouchEnd={(e) => {
        // Fallback for cases where onClick doesn't fire
        e.preventDefault();
        handleToggle();
      }}
    >
      {labelShowing && (
        <SegmentLabel
          proportion={splitProportionWithSegment.proportion}
          segmentWidth={splitProportionWithSegment.segment.width}
        />
      )}
    </div>
  );
}
