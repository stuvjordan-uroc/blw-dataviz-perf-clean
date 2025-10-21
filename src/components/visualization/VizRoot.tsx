//css
import "./VizRoot.css";
//hooks
import { useState } from "react";
//types
import type { ReactElement } from "react";
import type { VizTab } from "../Viz";
//components
import VizHeader from "./VizHeader";
import VizControls from "./VizControls";
import VizCanvas from "./VizCanvas";
import VizLegend from "./VizLegend";

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

export function VizRoot({
  vizTab,
  activeVizTab,
}: {
  vizTab: VizTab;
  activeVizTab: VizTab;
}): ReactElement {
  //STATES

  //requested split
  const [requestedSplit, setRequestedSplit] = useState<RequestedSplit>({
    wave: false,
    party: false,
    response: false,
  });

  //responses expanded
  const [responsesExpanded, setResponsesExpanded] =
    useState<ResponsesExpanded>("expanded");

  return (
    <div className="viz-root">
      <VizHeader vizTab={vizTab} />
      <VizControls
        requestedSplit={requestedSplit}
        setRequestedSplit={setRequestedSplit}
        responsesExpanded={responsesExpanded}
        setResponsesExpanded={setResponsesExpanded}
      />
      <VizCanvas
        vizTab={vizTab}
        activeVizTab={activeVizTab}
        requestedSplit={requestedSplit}
        responsesExpanded={responsesExpanded}
      />
      <VizLegend
        requestedSplit={requestedSplit}
        responsesExpanded={responsesExpanded}
        vizTab={vizTab}
      />
    </div>
  );
}
