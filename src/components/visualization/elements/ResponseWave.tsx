import React from "react";
import DataPoint from "./DataPoint";

interface ResponseWaveProps {
  party: string;
  response: string;
  responseIndex: number;
  characteristic: string;
}

const ResponseWave: React.FC<ResponseWaveProps> = ({
  party,
  response,
  responseIndex,
  characteristic,
}) => {
  // Mock data points - this will be replaced with actual survey data
  const mockDataPoints = Array.from(
    { length: Math.floor(Math.random() * 20) + 5 },
    (_, i) => ({
      id: `${party}-${responseIndex}-${i}`,
      party,
      response,
      value: Math.random(),
    })
  );

  return (
    <div className={`response-wave response-${responseIndex}`}>
      <div className="wave-container">
        {mockDataPoints.map((point) => (
          <DataPoint
            key={point.id}
            party={point.party}
            response={point.response}
            value={point.value}
            position={{
              x: Math.random() * 200,
              y: Math.random() * 50,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ResponseWave;
