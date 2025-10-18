import React from "react";

interface DataPointProps {
  party: string;
  response: string;
  value: number;
  position: {
    x: number;
    y: number;
  };
}

const DataPoint: React.FC<DataPointProps> = ({
  party,
  response,
  value,
  position,
}) => {
  // Determine the shade based on response intensity
  const getShade = (val: number) => {
    if (val > 0.75) return "700";
    if (val > 0.5) return "500";
    if (val > 0.25) return "300";
    return "100";
  };

  const shade = getShade(value);
  const colorClass = `color-${party}-${shade}`;

  return (
    <div
      className={`data-point ${colorClass}`}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: `var(--blw-${party}${shade})`,
      }}
      title={`${party}: ${response} (${Math.round(value * 100)}%)`}
    >
      <div className="point-circle" />
    </div>
  );
};

export default DataPoint;
