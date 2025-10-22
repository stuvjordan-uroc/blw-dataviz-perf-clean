//css
import "./WaveLabels.css";
//types
import type { ReactElement } from "react";
import type { RequestedSplit } from "../VizRoot";
import type { VizConfig, Layout } from "../../../assets/config/viz-config";
//hooks
import { useCharacteristicDataContext } from "../../../contexts/useCharacteristicDataContext";
import { useContext } from "react";
//context
import { BreakpointContext } from "../../../contexts/breakpointContext";
//components
import WaveLabel from "./WaveLabel";
//config
import vizConfig from "../../../assets/config/viz-config.json";
import metaImp from "../../../assets/config/meta-imp.json";
import metaPerf from "../../../assets/config/meta-perf.json";

interface WaveLabelsProps {
  vizTab: "imp" | "perf";
  requestedSplit: RequestedSplit;
  containerRect: DOMRect;
}

export default function WaveLabels({
  vizTab,
  requestedSplit,
  containerRect,
}: WaveLabelsProps): ReactElement | null {
  const characteristicData = useCharacteristicDataContext()[0];
  const breakpoint = useContext(BreakpointContext);
  //waves included for the currently-loaded characteristic and vizTab
  const meta = vizTab === "imp" ? metaImp : metaPerf;
  const includedWaves = [] as {
    wave: [string, number[]];
    topLeftY: number | undefined;
    height: number | undefined;
  }[];
  if (characteristicData.state === "ready" && characteristicData.data) {
    const dataTab = vizTab === "imp" ? "impData" : "perfData";
    characteristicData.data[dataTab].waves.forEach((waveResponseGroupIdx) => {
      const includedWave = meta.wave.response_groups[waveResponseGroupIdx];
      if (includedWave) {
        const waveSplit = characteristicData.data![dataTab].splits.find(
          (split) => split.wave && split.wave.value[0] === includedWave[0]
        );
        includedWaves.push({
          wave: includedWave as [string, number[]],
          topLeftY: waveSplit?.responses?.expanded[0].segment.topLeftY,
          height: waveSplit?.responses?.expanded[0].segment.height,
        });
      }
    });
  }
  // Guard early and return null when nothing to render
  if (
    !requestedSplit.wave ||
    !(characteristicData.state === "ready") ||
    !characteristicData.data ||
    includedWaves.length === 0
  ) {
    return null;
  }
  //if we get here, data is being displayed, and there are wave labels to be shown

  //compute the right offset for labels

  const typedVizConfig = vizConfig as VizConfig;
  const foundCurrentLayout = typedVizConfig.layouts.find(
    (layout) => layout.breakpoint === breakpoint
  );
  const currentLayout: Layout = foundCurrentLayout
    ? foundCurrentLayout
    : typedVizConfig.layouts[0];
  const canvasMarginX = (containerRect.width - currentLayout.vizWidth) / 2;
  const right = canvasMarginX + currentLayout.vizWidth;

  const labelNodes = includedWaves.map((includedWave, includedWaveIdx) => {
    return (
      <WaveLabel
        labelText={includedWave.wave[0]}
        right={right}
        waveIndex={includedWaveIdx}
        key={includedWaveIdx}
        top={includedWave.topLeftY}
        height={includedWave.height}
      />
    );
  });

  return <>{labelNodes}</>;
}
