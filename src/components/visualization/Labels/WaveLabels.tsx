//css
import "./WaveLabels.css";
//types
//hooks
import useWaveLabels from "../../../hooks/useWaveLabels";
import { useCharacteristicDataContext } from "../../../contexts/useCharacteristicDataContext";
import { type ReactElement } from "react";
//config
// config and layout logic moved to useWaveLabels hook

interface WaveLabelsProps {
  vizTab: "imp" | "perf";
}

export default function WaveLabels({
  vizTab,
}: WaveLabelsProps): ReactElement | null {
  const { includedWaves, labelRefMap, labelHeights, currentLayout } =
    useWaveLabels(vizTab);
  //render nothing if there is no data being displayed
  const characteristicData = useCharacteristicDataContext()[0];
  if (
    !(characteristicData.state === "ready") ||
    !characteristicData.data ||
    includedWaves.length === 0
  ) {
    return null;
  }
  //if we get here, data is being displayed, and there are wave labels to be shown
  return (
    <>
      {includedWaves.map((includedWave, includedWaveIdx) => {
        const top =
          currentLayout.labelHeight +
          includedWaveIdx *
            (currentLayout.labelHeight + currentLayout.waveHeight) +
          0.5 * currentLayout.waveHeight -
          0.5 *
            (labelHeights
              ? labelHeights.has(includedWave[0])
                ? labelHeights.get(includedWave[0])!
                : 0
              : 0);
        return (
          <div
            key={includedWaveIdx}
            ref={(el: HTMLDivElement | null) => {
              if (!labelRefMap.current) {
                labelRefMap.current = new Map();
              }
              if (el) {
                labelRefMap.current.set(includedWave[0], el);
              } else {
                labelRefMap.current.delete(includedWave[0]);
              }
            }}
            style={{
              position: "absolute",
              left: 0,
              top: top,
            }}
          >
            includedWave[0]
          </div>
        );
      })}
    </>
  );
}
