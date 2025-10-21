//css
import "./VizCanvas.css";
//types
import type { ReactElement } from "react";
import type { VizTab } from "../Viz";
import type { RequestedSplit, ResponsesExpanded } from "./VizRoot";
//hooks and context
import { useBreakpointContext } from "../../hooks/useBreakpointContext";
import { useCharacteristicDataContext } from "../../contexts/useCharacteristicDataContext";
import useCanvas from "../../hooks/useCanvas";
import useCanvasDimensions from "../../hooks/useCanvasDimensions";
import useElementRefAndRect from "../../hooks/useElementRefAndRect";
//components
import Spinner from "../elements/Spinner";
import WaveLabels from "./Labels/WaveLabels";
import Segments from "./Labels/Segments";

interface VizCanvasProps {
  vizTab: VizTab;
  activeVizTab: VizTab;
  requestedSplit: RequestedSplit;
  responsesExpanded: ResponsesExpanded;
}

export default function VizCanvas({
  vizTab,
  activeVizTab,
  requestedSplit,
  responsesExpanded,
}: VizCanvasProps): ReactElement {
  // get the canvas dimensions for the current breakpoint
  const breakpoint = useBreakpointContext();
  const canvasDimensions = useCanvasDimensions({ breakpoint, vizTab });

  //set the canvas ref
  //and link it to the data and requested view variables
  //so coordinates are drawn when data is available
  //and as the user requests.
  const characteristicDataContext = useCharacteristicDataContext();
  const characteristicData = characteristicDataContext[0];
  //useCanvas to set up drawing logic
  const canvasRef = useCanvas({
    characteristicDataContext,
    requestedSplit,
    responsesExpanded,
    vizTab,
  });

  //ref, state, and useLayoutEffect to get the dimensions of the canvas container
  const [containerRef, containerRect] = useElementRefAndRect<HTMLDivElement>([
    breakpoint,
    vizTab,
    activeVizTab === vizTab, // Re-measure when this tab becomes active
  ]);

  return (
    <div className="canvas-container" ref={containerRef}>
      {/*  Loading Spinner, Error Indicator,  here  */}
      {characteristicData.state === "pending" && (
        <div style={{ position: "absolute", top: "50%", left: "50%" }}>
          <Spinner />
        </div>
      )}
      {/* No-data indicator */}
      {characteristicData.state === "ready" &&
        characteristicData.data &&
        characteristicData.data[(vizTab + "Data") as "impData" | "perfData"]
          .unsplitPositions.data.length === 0 &&
        characteristicData.data && (
          <div
            style={{
              color: "white",
              marginTop: "5em",
              maxWidth: "10em",
            }}
          >
            Sorry, we didn't collect data on respondents' views of the{" "}
            {vizTab === "imp"
              ? "importance for democracy of"
              : "performance of the US on"}{" "}
            this characterstic.
          </div>
        )}
      {/* Error indicator */}
      {characteristicData.state === "error" && (
        <div
          style={{
            color: "white",
            marginTop: "5em",
          }}
        >
          Sorry, but something went wrong!
        </div>
      )}
      {/* successful data loading */}
      {characteristicData.state !== "error" && (
        <>
          <Segments
            containerRect={containerRect}
            requestedSplit={requestedSplit}
            responsesExpanded={responsesExpanded}
            vizTab={vizTab}
            topOffset={0}
          />
          <WaveLabels
            containerRect={containerRect}
            requestedSplit={requestedSplit}
            vizTab={vizTab}
          />
          <canvas
            ref={canvasRef}
            className="viz-canvas"
            width={canvasDimensions.width}
            height={canvasDimensions.height}
          />
        </>
      )}
    </div>
  );
}
