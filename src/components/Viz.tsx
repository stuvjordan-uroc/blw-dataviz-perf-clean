import VizContainer from "./visualization/VizContainer";
import type { ReactElement } from "react";

interface VizProps {
  characteristic: string;
}

function Viz({ characteristic }: VizProps): ReactElement {
  return (
    <div className="viz-wrapper">
      {/* <VizContainer characteristic={characteristic} /> */}
    </div>
  );
}

export default Viz;
