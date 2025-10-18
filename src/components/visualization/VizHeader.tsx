//css
import "./VizHeader.css";
//types
import type { ReactElement } from "react";
import type { VizTab } from "./VizRoot";
//config
import questions from "../../assets/config/questions.json";

export default function VizHeader({
  vizTab,
}: {
  vizTab: VizTab;
}): ReactElement {
  return (
    <div className="viz-header">
      {vizTab === "imp"
        ? questions["prefix_importance"]
        : questions["prefix_performance"]}
    </div>
  );
}
