// hook to compute wave labels and positioning helpers
import { useCharacteristicDataContext } from "../../../contexts/useCharacteristicDataContext";
import {
  useLayoutEffect,
  useRef,
  useState,
  useContext,
  type MutableRefObject,
} from "react";
import { BreakpointContext } from "../../../contexts/breakpointContext";
import metaPerf from "../../../assets/config/meta-perf.json";
import metaImp from "../../../assets/config/meta-imp.json";
import vizConfig from "../../../assets/config/viz-config.json";
import type { VizConfig, Layout } from "../../../assets/config/viz-config";

export function useWaveLabels(vizTab: "imp" | "perf"): {
  includedWaves: [string, number[]][];
  labelRefMap: MutableRefObject<Map<string, HTMLDivElement>>;
  labelHeights: Map<string, number>;
  currentLayout: Layout;
} {
  const labelRefMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const [labelHeights, setLabelHeights] = useState<Map<string, number>>(new Map());

  useLayoutEffect(() => {
    if (labelRefMap.current) {
      labelRefMap.current.forEach((labelDiv, labelKey) => {
        const rect = labelDiv.getBoundingClientRect();
        setLabelHeights((prev) => {
          const next = new Map(prev);
          next.set(labelKey, rect.height);
          return next;
        });
      });
    }
  });

  const breakpoint = useContext(BreakpointContext);
  const typedVizConfig = vizConfig as VizConfig;
  const foundCurrentLayout = typedVizConfig.layouts.find(
    (layout) => layout.breakpoint === breakpoint
  );
  const currentLayout: Layout = foundCurrentLayout
    ? foundCurrentLayout
    : typedVizConfig.layouts[0];

  const meta = vizTab === "imp" ? metaImp : metaPerf;
  const characteristicData = useCharacteristicDataContext()[0];
  const includedWaves = [] as [string, number[]][];
  if (characteristicData.state === "ready" && characteristicData.data) {
    characteristicData.data[vizTab === "imp" ? "impData" : "perfData"].waves.forEach(
      (waveResponseGroupIdx) => {
        const includedWave = meta.wave.response_groups[waveResponseGroupIdx];
        if (includedWave) {
          includedWaves.push(includedWave as [string, number[]]);
        }
      }
    );
  }

  return { includedWaves, labelRefMap, labelHeights, currentLayout };
}

export default useWaveLabels;
