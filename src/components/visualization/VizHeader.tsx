import React from "react";

interface VizHeaderProps {
  characteristic: string;
}

const VizHeader: React.FC<VizHeaderProps> = ({ characteristic }) => {
  return (
    <header className="viz-header">
      <h2 className="viz-title">
        Survey Results:{" "}
        {characteristic
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())}
      </h2>
      <p className="viz-subtitle">
        Public opinion data visualization showing responses by political
        affiliation
      </p>
    </header>
  );
};

export default VizHeader;
