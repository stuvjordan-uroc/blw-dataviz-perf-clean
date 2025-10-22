//css
import "./VizLegend.css";
//types
import type { RequestedSplit, ResponsesExpanded } from "./VizRoot";
import type { ReactElement } from "react";
import type { Image } from "../../hooks/useCharacteristicData";
//config
import { useBreakpointContext } from "../../hooks/useBreakpointContext";
import { useCharacteristicDataContext } from "../../contexts/useCharacteristicDataContext";
import metaPerf from "../../assets/config/meta-perf.json";
import metaImp from "../../assets/config/meta-imp.json";

interface VizLegendProps {
  requestedSplit: RequestedSplit;
  responsesExpanded: ResponsesExpanded;
  vizTab: "imp" | "perf";
}

export default function VizLegend({
  requestedSplit,
  responsesExpanded,
  vizTab,
}: VizLegendProps): ReactElement | null {
  const breakpoint = useBreakpointContext();
  const characteristicDataContext = useCharacteristicDataContext();
  const characteristicData = characteristicDataContext[0];
  const responses =
    vizTab === "imp"
      ? (metaImp.response.response_groups[responsesExpanded] as [
          string,
          string[]
        ][])
      : (metaPerf.response.response_groups[responsesExpanded] as [
          string,
          string[]
        ][]);
  if (characteristicData.state === "ready" && characteristicData.data) {
    responses.forEach((response, responseIdx) => {
      const imagesAtResponse = characteristicData
        .data!.images.filter(
          (image) =>
            image.responsesExpanded === responsesExpanded &&
            image.responseIndex === responseIdx &&
            image.breakpoint === breakpoint
        )
        .map(
          (image) =>
            "circles/xLarge/" +
            image.party +
            "/" +
            responsesExpanded +
            "/" +
            responseIdx.toString() +
            ".png"
        )
        .map((image) => ({
          party: image.party,
        }));
    });
  }

  const responsesWithImages: {
    response: [string, string[]];
    images: Image[];
  }[] = [];
  if (characteristicData.state === "ready" && characteristicData.data) {
    responses.forEach((response, responseIdx) => {
      const imagesAtResponse = characteristicData.data!.images.filter(
        (image) =>
          image.responsesExpanded === responsesExpanded &&
          image.responseIndex === responseIdx &&
          image.breakpoint === breakpoint
      );
      responsesWithImages.push({
        response: response,
        images: imagesAtResponse,
      });
    });
  }

  if (
    !requestedSplit.response ||
    characteristicData.state !== "ready" ||
    (characteristicData.state === "ready" && characteristicData.data === null)
  ) {
    return null;
  }

  if (!requestedSplit.party) {
    // not split-by-party legend: show images with party === 'Noparty'
    return (
      <div className="viz-legend-root">
        {responsesWithImages.map((repWithImg, repWithImgIdx) => (
          <div key={repWithImgIdx}>
            <div>{repWithImg.response[0]}</div>
            {(() => {
              const noPartyImg = repWithImg.images.find(
                (img) => img.party === "Noparty"
              );
              if (!noPartyImg) return null;
              const src = noPartyImg.image?.src ?? noPartyImg.imagePath;
              return (
                <img src={src} alt={`${repWithImg.response[0]} no-party`} />
              );
            })()}
          </div>
        ))}
      </div>
    );
  }

  // split-by-party legend: hierarchical party -> responses
  // Build a set of all parties present in responsesWithImages (excluding 'Noparty')
  const parties = new Set<string>();
  responsesWithImages.forEach((rep) => {
    rep.images.forEach((img) => {
      if (img.party !== "Noparty") parties.add(img.party);
    });
  });
  const partyList = Array.from(parties);
  // sort parties to Democrat, Independent, Republican; others follow
  const order: Record<string, number> = {
    Democrat: 0,
    Independent: 1,
    Republican: 2,
  };
  partyList.sort((a, b) => {
    const ia = order[a] ?? 99;
    const ib = order[b] ?? 99;
    if (ia !== ib) return ia - ib;
    return a.localeCompare(b);
  });

  return (
    <div className="viz-legend-root">
      {partyList.map((party) => (
        <div key={party} className="legend-party-group">
          <div className="legend-party-title">{party}</div>
          <div className="legend-party-responses">
            {responsesWithImages.map((repWithImg) => {
              // find the image for this party for the given response
              const partyImg = repWithImg.images.find(
                (img) => img.party === party
              );
              if (!partyImg) return null;
              const src = partyImg.image?.src ?? partyImg.imagePath;
              const responseLabel = repWithImg.response[0];
              return (
                <div key={responseLabel} className="legend-response-item">
                  <div className="legend-response-label">{responseLabel}</div>
                  <img src={src} alt={`${responseLabel} ${party}`} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
