import "./VizCanvas.css";
import type { ReactElement, Ref } from "react";
import type { VizTab } from "../Viz";
import { useBreakpointContext } from "../../hooks/useBreakpointContext";
import vizConfig from "../../assets/config/viz-config.json";
import type { VizConfig, Layout } from "../../assets/config/viz-config";
import metaImp from "../../assets/config/meta-imp.json";
import metaPerf from "../../assets/config/meta-perf.json";
import type { Meta } from "../../assets/config/meta";

export default function VizCanvas({
  canvasRef,
  vizTab,
}: {
  canvasRef?: Ref<HTMLCanvasElement>;
  vizTab: VizTab;
}): ReactElement {
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

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="viz-canvas"
        width={canvasWidth}
        height={canvasHeight}
      />
    </div>
  );
}
