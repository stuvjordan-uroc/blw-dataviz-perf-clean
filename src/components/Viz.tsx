//types
import type { ReactElement } from "react";
//components
import { VizRoot } from "./visualization/VizRoot";
import { VizTabSelect } from "./visualization/VizTabSelect";
import { Tabs } from "radix-ui";
//hooks
import { useState } from "react";

interface VizProps {
  characteristic: string;
}

export type VizTab = "imp" | "perf";

export function Viz({ characteristic }: VizProps): ReactElement {
  const [vizTab, setVizTab] = useState<VizTab>("imp");
  return (
    <VizTabSelect vizTab={vizTab} setVizTab={setVizTab}>
      <Tabs.Content
        value="imp"
        forceMount
        style={{ display: vizTab === "imp" ? "block" : "none" }}
      >
        <VizRoot vizTab="imp" />
      </Tabs.Content>
      <Tabs.Content
        value="perf"
        forceMount
        style={{ display: vizTab === "perf" ? "block" : "none" }}
      >
        <VizRoot vizTab="perf" />
      </Tabs.Content>
    </VizTabSelect>
  );
}
