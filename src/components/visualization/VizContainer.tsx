import React, { useState } from "react";
import "./visualization.css";
import VizHeader from "./VizHeader";
import VizChart from "./VizChart";
import VizLegend from "./VizLegend";
import VizControls from "./VizControls";

type VizMode = "imp" | "perf";

interface VizContainerProps {
  characteristic: string;
}

const VizContainer: React.FC<VizContainerProps> = ({ characteristic }) => {
  const [mode, setMode] = useState<VizMode>("imp");

  const handleModeChange = (newMode: VizMode): void => {
    setMode(newMode);
  };

  return (
    <div className="viz-container">
      <VizHeader characteristic={characteristic} />
      <VizControls onModeChange={handleModeChange} />
      <VizChart characteristic={characteristic} mode={mode} />
      <VizLegend />
    </div>
  );
};

export default VizContainer;
