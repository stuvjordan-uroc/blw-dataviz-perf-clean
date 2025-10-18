import React, { useRef, useEffect, useCallback } from "react";
import { useCharacteristicData } from "../../../hooks/useCharacteristicData";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useViewState } from "../../../hooks/useViewState";
import type { PointPosition, Split, Coordinates } from "../../../types/splits";
import metaImp from "../../../assets/config/meta-imp.json";
import metaPerf from "../../../assets/config/meta-perf.json";
import vizConfig from "../../../assets/config/viz-config.json";

// Enhanced point position that includes party information for rendering
interface EnhancedPointPosition extends PointPosition {
  party: string | null; // null when split.party is null, otherwise party name
}

// Function to get the correct PNG image based on party information
const getImageForParty = (
  party: string | null,
  images: Record<string, HTMLImageElement>,
  pointRadius: number,
  shade: string = "500" // Default shade
): HTMLImageElement | null => {
  let colorKey: string;

  if (party === null) {
    // When party is null, use goldenrod
    colorKey = "goldenrod";
  } else {
    // Map party names to colors
    const partyLower = party.toLowerCase();
    if (partyLower.includes("republican")) {
      colorKey = "republican"; // This maps to red in the PNG files
    } else if (partyLower.includes("democrat")) {
      colorKey = "democrat"; // This maps to blue in the PNG files
    } else if (
      partyLower.includes("independent") ||
      partyLower.includes("other")
    ) {
      colorKey = "independent"; // This maps to purple in the PNG files
    } else {
      // Fallback to goldenrod for unknown parties
      colorKey = "goldenrod";
    }
  }

  // Construct the image filename: circle-{party}-{shade}-r{radius}.png
  const imageKey = `circle-${colorKey}-${shade}-r${pointRadius}.png`;
  return images[imageKey] || null;
};

type VizMode = "imp" | "perf";

interface CanvasProps {
  characteristic: string;
  mode?: VizMode;
}

const Canvas: React.FC<CanvasProps> = ({ characteristic, mode = "imp" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current_breakpoint = useBreakpoint();
  const dataState = useCharacteristicData({
    characteristic,
    breakpoint: current_breakpoint,
  });

  const { splitViewMode, dataGranularity } = useViewState();

  // Get layout configuration for current breakpoint
  const layoutConfig = vizConfig.layouts.find(
    (layout) => layout.breakpoint === current_breakpoint
  );

  // Calculate canvas dimensions
  const canvasWidth = layoutConfig?.vizWidth || 640;

  // Get the appropriate meta file based on mode
  const metaData = mode === "imp" ? metaImp : metaPerf;
  const waveResponseGroups = metaData.wave.response_groups;

  // Calculate height using the formula: labelHeight + (labelHeight + waveHeight) * length(wave.response_groups)
  const labelHeight = layoutConfig?.labelHeight || 30;
  const waveHeight = layoutConfig?.waveHeight || 90;
  const canvasHeight =
    labelHeight + (labelHeight + waveHeight) * waveResponseGroups.length;

  // Function to get the correct data based on current mode
  const getCurrentData = useCallback((): Coordinates | null => {
    if (!dataState.data) return null;
    return mode === "imp" ? dataState.data.impData : dataState.data.perfData;
  }, [dataState.data, mode]);

  // Function to get positions with party information based on current view mode
  const getCurrentPositions = useCallback((): EnhancedPointPosition[] => {
    const currentData = getCurrentData();
    if (!currentData) return [];

    const enhancedPositions: EnhancedPointPosition[] = [];

    // Handle different split view modes
    if (currentData.splits) {
      if (splitViewMode === "all-data") {
        // For "All Data" view: find the split where both party and wave are null
        const allDataSplit = currentData.splits.find(
          (split: Split) => split.party === null && split.wave === null
        );

        if (allDataSplit) {
          // Use the appropriate granularity (expanded or collapsed)
          const responses =
            dataGranularity === "expanded"
              ? allDataSplit.responses.expanded
              : allDataSplit.responses.collapsed;

          if (responses) {
            responses.forEach((response) => {
              if (response.segment && response.segment.pointPositions) {
                response.segment.pointPositions.forEach((pos) => {
                  enhancedPositions.push({
                    ...pos,
                    party: null, // All points in "All Data" view should be goldenrod (null party)
                  });
                });
              }
            });
          }
        }
      } else {
        // For other view modes: process all applicable splits
        currentData.splits.forEach((split: Split) => {
          let includeSplit = false;

          // Determine if this split should be included based on view mode
          switch (splitViewMode) {
            case "by-wave-and-party":
              includeSplit = split.party !== null && split.wave !== null;
              break;
            case "by-wave-only":
              includeSplit = split.wave !== null && split.party === null;
              break;
            case "by-party-only":
              includeSplit = split.party !== null && split.wave === null;
              break;
          }

          if (includeSplit) {
            // Get party name from split, or null if party is null
            const partyName = split.party ? String(split.party.value[0]) : null;

            // Use the appropriate granularity (expanded or collapsed)
            const responses =
              dataGranularity === "expanded"
                ? split.responses.expanded
                : split.responses.collapsed;

            if (responses) {
              responses.forEach((response) => {
                if (response.segment && response.segment.pointPositions) {
                  response.segment.pointPositions.forEach((pos) => {
                    enhancedPositions.push({
                      ...pos,
                      party: partyName,
                    });
                  });
                }
              });
            }
          }
        });
      }
    }

    // Fallback to unsplitPositions if no split data available
    if (
      enhancedPositions.length === 0 &&
      currentData.unsplitPositions &&
      !currentData.unsplitPositions.error
    ) {
      return currentData.unsplitPositions.data.map((pos) => ({
        ...pos,
        party: null, // No party information for unsplit positions
      }));
    }

    return enhancedPositions;
  }, [getCurrentData, splitViewMode, dataGranularity]);

  const drawVisualization = React.useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
      // Clear canvas with background
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, width, height);

      // Get political party groups from metadata (horizontal axis)
      const partyGroups = metaData.pid3.response_groups;
      const parties = partyGroups.map((group) => String(group[0])); // ["Democrat", "Independent or Other", "Republican"]

      // Draw wave response groups layout (vertical axis - temporal waves)
      waveResponseGroups.forEach((waveGroup, groupIndex) => {
        const groupY = labelHeight + groupIndex * (labelHeight + waveHeight);

        // Draw wave group label (first element of the array)
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 14px sans-serif";
        const waveGroupLabel = String(waveGroup[0]); // e.g. "Trump 2017-2020", "Biden 2021-2024", "Trump 2025"
        ctx.fillText(waveGroupLabel, 10, groupY - 5);

        // Draw rectangle for this response group
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 1;
        ctx.strokeRect(10, groupY, width - 20, waveHeight);

        // Draw party sections within this response group
        const partyWidth = (width - 20) / parties.length;
        parties.forEach((party, partyIndex) => {
          const partyX = 10 + partyIndex * partyWidth;

          // Draw party divider lines
          if (partyIndex > 0) {
            ctx.strokeStyle = "#e5e7eb";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(partyX, groupY);
            ctx.lineTo(partyX, groupY + waveHeight);
            ctx.stroke();
          }

          // Draw party label (only in first group)
          if (groupIndex === 0) {
            ctx.fillStyle = "#6b7280";
            ctx.font = "12px sans-serif";
            ctx.fillText(party, partyX + 5, groupY - 25);
          }

          // Real data points will be rendered separately using PNG images
        });
      });

      // Draw debug info
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px monospace";
      ctx.fillText(
        `Mode: ${mode} | Breakpoint: ${current_breakpoint}`,
        10,
        height - 20
      );
      ctx.fillText(
        `Wave Groups: ${waveResponseGroups.length} | Height: ${height}px`,
        10,
        height - 10
      );
      ctx.fillText(
        `Data loaded: ${dataState.data ? "Yes" : "No"}`,
        250,
        height - 10
      );
    },
    [
      current_breakpoint,
      mode,
      waveResponseGroups,
      labelHeight,
      waveHeight,
      metaData,
      dataState.data,
    ]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataState.state !== "ready" || !dataState.data) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background and visualization
    drawVisualization(ctx, canvasWidth, canvasHeight);

    // Draw actual data points using PNG images based on party information
    const positions = getCurrentPositions();
    const images = dataState.data.images;

    // Get current layout config to determine point radius
    const layoutConfig = vizConfig.layouts.find(
      (layout) => layout.breakpoint === current_breakpoint
    );
    const pointRadius = layoutConfig?.pointRadius || 4;

    positions.forEach((point) => {
      // Get the correct image based on the point's party information
      // For "All Data" view, force goldenrod shade 500
      const shade = splitViewMode === "all-data" ? "500" : "500"; // Default shade for now
      const image = getImageForParty(point.party, images, pointRadius, shade);

      if (image && image.complete) {
        // Draw the PNG image centered at the point position
        const imageSize = image.width; // Assuming square images
        ctx.drawImage(
          image,
          point.cx - imageSize / 2,
          point.cy - imageSize / 2
        );
      } else {
        // Fallback to colored circle if no image available
        let fallbackColor = "#fbbf24"; // goldenrod fallback

        if (point.party) {
          const partyLower = point.party.toLowerCase();
          if (partyLower.includes("republican")) {
            fallbackColor = "#dc2626"; // red
          } else if (partyLower.includes("democrat")) {
            fallbackColor = "#2563eb"; // blue
          } else if (
            partyLower.includes("independent") ||
            partyLower.includes("other")
          ) {
            fallbackColor = "#7c3aed"; // purple
          }
        }

        ctx.fillStyle = fallbackColor;
        ctx.beginPath();
        ctx.arc(point.cx, point.cy, pointRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [
    dataState,
    canvasWidth,
    canvasHeight,
    current_breakpoint,
    mode,
    waveResponseGroups,
    labelHeight,
    waveHeight,
    metaData,
    drawVisualization,
    getCurrentPositions,
    splitViewMode,
  ]);

  // Handle canvas interactions
  const handleCanvasClick = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // TODO: Implement point selection/interaction logic for coordinates
    void x; // Suppress unused variable warning
    void y; // Suppress unused variable warning
  };

  const handleCanvasMouseMove = (
    _event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    // TODO: Implement hover effects for data points
    void _event; // Suppress unused variable warning
  };

  if (dataState.state === "pending") {
    return (
      <div
        className="canvas-loading"
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        <div className="loading-message">Loading visualization data...</div>
      </div>
    );
  }

  if (dataState.state === "error") {
    return (
      <div
        className="canvas-error"
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        <div className="error-message">
          Failed to load data: {dataState.error}
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="viz-canvas"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          border: "1px solid #e5e7eb",
          borderRadius: "4px",
          cursor: "crosshair",
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />
    </div>
  );
};

export default Canvas;
