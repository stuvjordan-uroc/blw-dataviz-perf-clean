//css
import "./VizTabSelect.css";
//types
import type { ReactElement, ReactNode, Dispatch, SetStateAction } from "react";
import type { VizTab } from "../Viz";
//components
import { Tabs } from "radix-ui";

export function VizTabSelect({
  vizTab,
  setVizTab,
  children,
}: {
  vizTab: VizTab;
  setVizTab: Dispatch<SetStateAction<VizTab>>;
  children: ReactNode;
}): ReactElement {
  //viz tab
  return (
    <Tabs.Root
      value={vizTab}
      onValueChange={(newValue: string) => {
        if (["imp", "perf"].includes(newValue)) {
          setVizTab(newValue as VizTab);
        }
      }}
      className="viz-tabs-root"
    >
      <Tabs.List className="viz-tabs-list">
        {["imp", "perf"].map((vt) => (
          <Tabs.Trigger
            value={vt}
            key={vt}
            className="viz-tabs-trigger"
            asChild={true}
          >
            <div>{vt === "imp" ? "Importance" : "Performance"}</div>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}
