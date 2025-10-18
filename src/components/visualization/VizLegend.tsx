import React from "react";

const VizLegend: React.FC = () => {
  const parties = [
    { name: "Republican", color: "var(--blw-republican500)" },
    { name: "Democrat", color: "var(--blw-democrat500)" },
    { name: "Independent", color: "var(--blw-independent500)" },
  ];

  return (
    <div className="viz-legend">
      <h3 className="legend-title">Political Affiliation</h3>
      <div className="legend-items">
        {parties.map((party) => (
          <div key={party.name} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: party.color }}
            />
            <span className="legend-label">{party.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VizLegend;
