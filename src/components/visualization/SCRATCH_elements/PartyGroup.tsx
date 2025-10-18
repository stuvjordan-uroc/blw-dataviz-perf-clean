import React from "react";
import ResponseWave from "./ResponseWave";

interface PartyGroupProps {
  party: string;
  characteristic: string;
}

const PartyGroup: React.FC<PartyGroupProps> = ({ party, characteristic }) => {
  // Mock response categories - this will be replaced with actual data
  const responseCategories = [
    "Very Important",
    "Somewhat Important",
    "Not Important",
    "No Opinion",
  ];

  return (
    <div className={`party-group party-${party}`}>
      <div className="party-label">
        {party.charAt(0).toUpperCase() + party.slice(1)}
      </div>
      <div className="response-waves">
        {responseCategories.map((response, index) => (
          <ResponseWave
            key={response}
            party={party}
            response={response}
            responseIndex={index}
            characteristic={characteristic}
          />
        ))}
      </div>
    </div>
  );
};

export default PartyGroup;
