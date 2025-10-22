//hooks
import useElementRefAndRect from "../../../hooks/useElementRefAndRect";
import { useContext, useEffect, useState } from "react";
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
  top: number | undefined;
  height: number | undefined;
}

export default function WaveLabel({
  labelText,
  waveIndex,
  right,
  top,
  height,
}: WaveLabelProps): ReactElement {
  //get label ref and dimensions
  const [labelRef, labelRect] = useElementRefAndRect<HTMLDivElement>();

  // Track window width for responsive positioning
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = (): void => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
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
    top && height
      ? top + 0.5 * height - 0.5 * labelRect.height
      : waveIndex * (currentLayout.labelHeight + currentLayout.waveHeight) + //heights of previous waves
        currentLayout.waveHeight - //height of the label's wave
        labelRect.height; //label's height

  // Check if label will go off-screen and adjust positioning
  const screenWidth = windowWidth;
  const labelWidth = labelRect.width;
  const labelLeftEdge = screenWidth - right - labelWidth;

  // If label would go off the left edge of screen, adjust positioning
  const isOffScreen = labelLeftEdge < 0;
  const adjustedRight = isOffScreen ? screenWidth - labelWidth - 25 : right; // 25px margin from edge
  const adjustedMarginRight = isOffScreen ? "0" : "0.5rem";
  return (
    <div
      ref={labelRef}
      style={{
        position: "absolute",
        top: topOffset,
        right: adjustedRight,
        color: "white",
        fontSize: "0.8rem",
        marginRight: adjustedMarginRight,
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
