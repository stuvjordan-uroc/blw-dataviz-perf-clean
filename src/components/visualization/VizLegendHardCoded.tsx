//css
import "./VizLegend.css";
//types
import type { ReactElement } from "react";
import type { RequestedSplit, ResponsesExpanded } from "./VizRoot";
//config
import metaPerf from "../../assets/config/meta-perf.json";
import metaImp from "../../assets/config/meta-imp.json";

interface VizLegendProps {
  requestedSplit: RequestedSplit;
  responsesExpanded: ResponsesExpanded;
  vizTab: "imp" | "perf";
}

export default function VizLegendHardCoded({
  requestedSplit,
  responsesExpanded,
  vizTab,
}: VizLegendProps): ReactElement {
  //get the meta config
  const meta = vizTab === "imp" ? metaImp : metaPerf;
  // get the array of responses currently in the view
  const currentResponses = meta.response.response_groups[responsesExpanded] as [
    string,
    string[]
  ][];
  if (!requestedSplit.party) {
    //construct and return the not-split-by-party legend
    const responsesWithImages = currentResponses.map(
      (response, responseIdx) => {
        const imageSrc =
          "circles/xLarge/Noparty/" +
          responsesExpanded +
          "/" +
          responseIdx +
          ".png";
        const image = new Image();
        image.src = imageSrc;
        return {
          response: response,
          image: image,
        };
      }
    );
    return (
      <div className="viz-legend-root">
        {responsesWithImages.map(({ response, image }) => (
          <div className="viz-legend-response-item" key={response[0]}>
            <img src={image.src} width="14px" height="14px"></img>
            <span>{response[0]}</span>
          </div>
        ))}
      </div>
    );
  }
  const partiesWithResponseArrays = meta.pid3.response_groups.map((pg) => {
    const partyStr = pg[0].includes("Independent") ? "Independent" : pg[0];
    const responsesWithImages = currentResponses.map(
      (response, responseIdx) => {
        const imageSrc =
          "circles/xLarge/" +
          partyStr +
          "/" +
          responsesExpanded +
          "/" +
          responseIdx +
          ".png";
        const image = new Image();
        image.src = imageSrc;
        return {
          response: response,
          image: image,
        };
      }
    );
    return {
      party: pg[0],
      responses: responsesWithImages,
    };
  });
  return (
    <div
      className="viz-legend-root"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: ".5rem",
      }}
    >
      {partiesWithResponseArrays.map((party) => (
        <div className="viz-legend-party-item">
          <div
            style={{
              fontWeight: 600,
              alignSelf: "start",
              textTransform: "uppercase",
            }}
          >
            {party.party}
          </div>
          <div className="viz-legend-reponse-array">
            {party.responses.map(({ response, image }) => (
              <div className="viz-legend-response-item" key={response[0]}>
                <img src={image.src} width="14px" height="14px"></img>
                <span>{response[0]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
