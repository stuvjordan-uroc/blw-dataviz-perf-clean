//types
import type { ReactElement } from "react";
//hooks
import useElementRefAndRect from "../../../hooks/useElementRefAndRect";

interface SegmentLabelProps {
  segmentWidth: number;
  proportion: number;
}

export default function SegmentLabel({
  segmentWidth,
  proportion,
}: SegmentLabelProps): ReactElement {
  const [labelRef, labelRect] = useElementRefAndRect<HTMLDivElement>([]);
  return (
    <div
      ref={labelRef}
      style={{
        width: "fit-content",
        padding: "0.5rem",
        borderRadius: "100%",
        backgroundColor: "var(--blw-gray100)",
        color: "black",
        position: "absolute",
        left: segmentWidth * 0.5 - 0.5 * labelRect.width,
        top: -0.5 * labelRect.height,
      }}
    >
      {Math.round(proportion * 100).toString() + "%"}
    </div>
  );
}
