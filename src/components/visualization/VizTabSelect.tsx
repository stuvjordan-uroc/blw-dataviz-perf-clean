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
      <Tabs.List>
        {["imp", "perf"].map((vt) => (
          <Tabs.Trigger value={vt} key={vt}>
            {vt === "imp" ? "Importance" : "Performance"}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}
