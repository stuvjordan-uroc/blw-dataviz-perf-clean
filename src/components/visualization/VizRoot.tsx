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
