//css
import "./VizHeader.css";
//types
import type { ReactElement } from "react";
import type { VizTab } from "../Viz";
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
        ? "How important is this characterstic for democratic government?"
        : "How well does this characteristic describe the U.S. as of today?"}
    </div>
  );
}
