//hooks
import useElementRefAndRect from "../../../hooks/useElementRefAndRect";
import { useContext } from "react";
//config
import vizConfig from "../../../assets/config/viz-config.json";
//types
import type { VizConfig, Layout } from "../../../assets/config/viz-config";
import type { ReactElement } from "react";
//context
import { BreakpointContext } from "../../../contexts/breakpointContext";

interface WaveLabelProps {
  labelText: string;
  waveIndex: number;
  right: number;
}

export default function WaveLabel({
  labelText,
  waveIndex,
  right,
}: WaveLabelProps): ReactElement {
  //get label ref and dimensions
  const [labelRef, labelRect] = useElementRefAndRect<HTMLDivElement>();
  //separaet out first word of the label text so that
  //we can put a line break between the president's name
  //and the year range.
  const fullText = (labelText ?? "").trim();
  const [firstWord, ...restWords] = fullText.split(/\s+/);
  const restText = restWords.join(" ");
  //layout for computing absolute offsets
  const breakpoint = useContext(BreakpointContext);
  const typedVizConfig = vizConfig as VizConfig;
  const foundCurrentLayout = typedVizConfig.layouts.find(
    (layout) => layout.breakpoint === breakpoint
  );
  const currentLayout: Layout = foundCurrentLayout
    ? foundCurrentLayout
    : typedVizConfig.layouts[0];
  //compute the top offser for the label
  const topOffset =
    waveIndex * (currentLayout.labelHeight + currentLayout.waveHeight) + //heights of previous waves
    currentLayout.waveHeight - //height of the label's wave
    0.5 * labelRect.height; //label's height
  return (
    <div
      ref={labelRef}
      style={{
        position: "absolute",
        top: topOffset,
        right: right,
        color: "white",
      }}
    >
      {restText ? (
        <>
          <span>{firstWord}</span>
          <br />
          <span style={{ whiteSpace: "nowrap" }}>{restText}</span>
        </>
      ) : (
        firstWord
      )}
    </div>
  );
}
