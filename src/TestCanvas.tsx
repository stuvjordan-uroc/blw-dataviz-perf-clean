import React from "react";
import Canvas from "./components/visualization/elements/Canvas";
import "./components/visualization/visualization.css";

const TestCanvas: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Canvas Dimension Test</h2>
      <p>
        Testing canvas dimensions with proper height calculation based on
        response groups.
      </p>
      <Canvas characteristic="ban_ideology" />
    </div>
  );
};

export default TestCanvas;
