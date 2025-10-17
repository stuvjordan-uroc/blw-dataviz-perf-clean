interface VizProps {
  characteristic: string;
}

function Viz({ characteristic }: VizProps) {
  return (
    <div>
      <h2>Visualization for: {characteristic}</h2>
      {/* Visualization content will be implemented here */}
    </div>
  );
}

export default Viz;
