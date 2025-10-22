//css
import "./Viz.css";
//types
import type { ReactElement } from "react";
//components
import { VizRoot } from "./visualization/VizRoot";
import { VizTabSelect } from "./visualization/VizTabSelect";
import { Tabs } from "radix-ui";
//hooks and context
import { useState } from "react";
import { useCharacteristicData } from "../hooks/useCharacteristicData";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { CharacteristicDataProvider } from "../contexts/characteristicDataContext";

interface VizProps {
  requestedCharacteristic: string;
}

export type VizTab = "imp" | "perf";

export function Viz({ requestedCharacteristic }: VizProps): ReactElement {
  const [vizTab, setVizTab] = useState<VizTab>("imp");
  const breakpoint = useBreakpoint();
  //set up the datastate.
  //note that the hook that returns dataState
  //sets up a useEffect that causes data fetch whenever
  //either requestedCharacterstic or breakpoint changes.
  const charDataCtx = useCharacteristicData({
    characteristic: requestedCharacteristic,
    breakpoint,
  });
  return (
    <CharacteristicDataProvider value={charDataCtx}>
      <div className="viz">
        <VizTabSelect vizTab={vizTab} setVizTab={setVizTab}>
          <Tabs.Content
            value="imp"
            forceMount
            className={`viz-tab-content ${
              vizTab === "imp"
                ? "viz-tab-content--active"
                : "viz-tab-content--inactive"
            }`}
          >
            <VizRoot vizTab="imp" activeVizTab={vizTab} />
          </Tabs.Content>
          <Tabs.Content
            value="perf"
            forceMount
            className={`viz-tab-content ${
              vizTab === "perf"
                ? "viz-tab-content--active"
                : "viz-tab-content--inactive"
            }`}
          >
            <VizRoot vizTab="perf" activeVizTab={vizTab} />
          </Tabs.Content>
        </VizTabSelect>
      </div>
    </CharacteristicDataProvider>
  );
}
