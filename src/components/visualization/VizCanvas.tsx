//css
import "./VizCanvas.css";
//types
import type { ReactElement } from "react";
import type { VizTab } from "../Viz";
import type { VizConfig, Layout } from "../../assets/config/viz-config";
import type { RequestedSplit, ResponsesExpanded } from "./VizRoot";
import type { Meta } from "../../assets/config/meta";
//hooks and context
import { useBreakpointContext } from "../../hooks/useBreakpointContext";
import { useCharacteristicDataContext } from "../../contexts/useCharacteristicDataContext";
import useCanvas from "../../hooks/useCanvas";
//config
import vizConfig from "../../assets/config/viz-config.json";
import metaImp from "../../assets/config/meta-imp.json";
import metaPerf from "../../assets/config/meta-perf.json";

interface VizCanvasProps {
  vizTab: VizTab;
  requestedSplit: RequestedSplit;
  responsesExpanded: ResponsesExpanded;
}

export default function VizCanvas({
  vizTab,
  requestedSplit,
  responsesExpanded,
}: VizCanvasProps): ReactElement {
  // Get current breakpoint from context
  const breakpoint = useBreakpointContext();

  // Type the vizConfig import
  const typedVizConfig = vizConfig as unknown as VizConfig;

  // Find the layout for the current breakpoint
  const layout: Layout | undefined = typedVizConfig.layouts.find(
    (layout) => layout.breakpoint === breakpoint
  );

  // Fallback to first layout if breakpoint not found
  const currentLayout: Layout = layout || typedVizConfig.layouts[0];

  // Choose meta file based on vizTab prop
  const meta = vizTab === "imp" ? (metaImp as Meta) : (metaPerf as Meta);

  // Calculate numWaves from meta.wave.response_groups length
  const numWaves = meta.wave.response_groups.length;

  // Calculate canvas dimensions
  const canvasHeight =
    currentLayout.labelHeight +
    numWaves * (currentLayout.labelHeight + currentLayout.waveHeight);
  const canvasWidth = currentLayout.vizWidth;

  //characterstic data state
  const characteristicData = useCharacteristicDataContext();
  //useCanvas to set up drawing logic
  const canvasRef = useCanvas({
    characteristicData,
    requestedSplit,
    responsesExpanded,
    vizTab,
  });

  return (
    <div className="canvas-container">
      {/*  Loading Spinner, Error Indicator, No-Data messages here  */}
      <canvas
        ref={canvasRef}
        className="viz-canvas"
        width={canvasWidth}
        height={canvasHeight}
      />
    </div>
  );
}
