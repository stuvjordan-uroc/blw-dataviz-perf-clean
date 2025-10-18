//css
import "./VizRoot.css";
//hooks
import { useState, useRef } from "react";
//types
import type { ReactElement } from "react";
import VizHeader from "./VizHeader";
import VizControls from "./VizControls";
import type { VizTab } from "../Viz";
import VizCanvas from "./VizCanvas";

export type RequestedSplit =
  | {
      response: false;
      wave: false;
      party: false;
    }
  | {
      response: true;
      wave: boolean;
      party: boolean;
    };

export type ResponsesExpanded = "expanded" | "collapsed";

export function VizRoot({ vizTab }: { vizTab: VizTab }): ReactElement {
  //STATES

  //requested split
  const [requestedSplit, setRequestedSplit] = useState<RequestedSplit>({
    wave: false,
    party: false,
    response: false,
  });

  //responses expanded
  const [responseExpanded, setResponseExpanded] =
    useState<ResponsesExpanded>("expanded");

  /*
  Here we invoke a hook that will set up the drawing logic for the canvas.


  The hook will:

  + create a ref for the canvas.
  + take as props:
    + the requested_characterstic state
    + the characterstic_data state
    + the requested_split state
    + the responseExpanded state
    + whether the canvas is the "imp" or "perf" canvas
  + Declare a useEffect with all of the reactive variables in the list above as dependencies
  + returns the ref so that caller can set the ref on the appropriate canvas.

  Because the useEffect will have all of those react vars as dependencies,
  It will re-run everytime one of them changes.

  Thus we an put all of the data loading, data errored logic into that useEffect callback, and we can put
  all of the coordinate drawing logic into that callback.
  */

  //REF TO CANVAS

  const canvasRef = useRef(null);

  return (
    <div className="viz-root">
      <VizHeader vizTab={vizTab} />
      <VizControls
        requestedSplit={requestedSplit}
        setRequestedSplit={setRequestedSplit}
        responsesExpanded={responseExpanded}
        setResponsesExpanded={setResponseExpanded}
      />
      <VizCanvas canvasRef={canvasRef} vizTab={vizTab} />
    </div>
  );
}
