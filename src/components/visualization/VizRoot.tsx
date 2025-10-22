//css
import "./VizRoot.css";
//hooks
import { useState } from "react";
import { createPortal } from "react-dom";
//types
import type { ReactElement } from "react";
import type { VizTab } from "../Viz";
//components
import VizHeader from "./VizHeader";
import VizControls from "./VizControls";
import VizCanvas from "./VizCanvas";
import VizLegend from "./VizLegend";
import VizLegendHardCoded from "./VizLegendHardCoded";

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

  //show legend
  const [showLegend, setShowLegend] = useState<boolean>(false);

  //target container for legend
  const vtr = document.getElementById("viz-tabs-root");

  return (
    <div className="viz-root">
      <VizHeader vizTab={vizTab} />
      <VizControls
        requestedSplit={requestedSplit}
        setRequestedSplit={setRequestedSplit}
        responsesExpanded={responsesExpanded}
        setResponsesExpanded={setResponsesExpanded}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
      />
      <VizCanvas
        vizTab={vizTab}
        activeVizTab={activeVizTab}
        requestedSplit={requestedSplit}
        responsesExpanded={responsesExpanded}
      />
      {showLegend &&
        vizTab === activeVizTab &&
        createPortal(
          <VizLegendHardCoded
            requestedSplit={requestedSplit}
            responsesExpanded={responsesExpanded}
            vizTab={vizTab}
            key={vizTab}
          />,
          vtr ? vtr : document.body
        )}
    </div>
  );
}
