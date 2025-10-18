import React, { useState } from "react";
import { useViewState } from "../../hooks/useViewState";
import type { SplitViewMode, DataGranularity } from "../../types/splits";

type VizMode = "imp" | "perf";

interface VizControlsProps {
  onModeChange?: (mode: VizMode) => void;
}

const VizControls: React.FC<VizControlsProps> = ({ onModeChange }) => {
  const [selectedMode, setSelectedMode] = useState<VizMode>("imp");
  const {
    splitViewMode,
    dataGranularity,
    setSplitViewMode,
    setDataGranularity,
    isGranularityControlEnabled,
  } = useViewState();

  const handleModeChange = (mode: VizMode): void => {
    setSelectedMode(mode);
    onModeChange?.(mode);
  };

  const splitViewOptions: { value: SplitViewMode; label: string }[] = [
    { value: "all-data", label: "All Data" },
    { value: "by-wave-and-party", label: "By Wave & Party" },
    { value: "by-wave-only", label: "By Wave Only" },
    { value: "by-party-only", label: "By Party Only" },
  ];

  const granularityOptions: { value: DataGranularity; label: string }[] = [
    { value: "expanded", label: "Expanded" },
    { value: "collapsed", label: "Collapsed" },
  ];

  return (
    <div className="viz-controls">
      {/* Importance/Performance Mode Selector */}
      <div className="viz-mode-selector">
        <button
          className={`mode-button ${selectedMode === "imp" ? "active" : ""}`}
          onClick={() => handleModeChange("imp")}
        >
          Importance
        </button>
        <button
          className={`mode-button ${selectedMode === "perf" ? "active" : ""}`}
          onClick={() => handleModeChange("perf")}
        >
          Performance
        </button>
      </div>

      {/* Split View Mode Selector */}
      <div className="split-view-selector">
        <label className="control-label">View Mode:</label>
        <div className="button-group">
          {splitViewOptions.map((option) => (
            <button
              key={option.value}
              className={`view-button ${
                splitViewMode === option.value ? "active" : ""
              }`}
              onClick={() => setSplitViewMode(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Granularity Selector - only enabled when not in "All Data" view */}
      <div
        className={`granularity-selector ${
          !isGranularityControlEnabled ? "disabled" : ""
        }`}
      >
        <label className="control-label">Detail Level:</label>
        <div className="button-group">
          {granularityOptions.map((option) => (
            <button
              key={option.value}
              className={`granularity-button ${
                dataGranularity === option.value ? "active" : ""
              }`}
              onClick={() => setDataGranularity(option.value)}
              disabled={!isGranularityControlEnabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VizControls;
