import VizContainer from "./visualization/VizContainer";

interface VizProps {
  characteristic: string;
}

function Viz({ characteristic }: VizProps) {
  return (
    <div className="viz-wrapper">
      <VizContainer characteristic={characteristic} />
    </div>
  );
}

export default Viz;
