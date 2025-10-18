import React from "react";
import Canvas from "./SCRATCH_elements/Canvas";

type VizMode = "imp" | "perf";

interface VizChartProps {
  characteristic: string;
  mode: VizMode;
}

const VizChart: React.FC<VizChartProps> = ({ characteristic, mode }) => {
  return (
    <div className="viz-chart">
      <div className="chart-container">
        <Canvas characteristic={characteristic} mode={mode} />
      </div>
    </div>
  );
};

export default VizChart;
