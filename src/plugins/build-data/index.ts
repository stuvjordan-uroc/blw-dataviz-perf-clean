//load the viz config
import type { VizConfig } from "../../assets/config/config-types";
import vz from "../../assets/config/viz-config.json";
const vizConfig = vz as VizConfig
//load the metadata
import type { Meta } from "../../assets/raw-data/meta-types";
import pm from "../../assets/raw-data/meta-perf.json";
import pi from "../../assets/raw-data/meta-imp.json";
const metaPerf = pm as Meta;
const metaImp = pi as Meta;
//load the addCounts, addSegments, and pointPositions functions, along with some types we need
import { addCounts } from "./functions/add-counts";
import { addSegments } from "./functions/add-segments";
import type { SplitWithSegments } from "./functions/add-segments";
import { pointPositions, type PointPosition } from "./functions/point-positions";
//node:fs so we can write the runtime data to the public folder.
import fs from 'node:fs'

interface SplitData {
  splits: SplitWithSegments[],
  unsplitPositions: {
    error: boolean;
    data: PointPosition[];
  }
}

interface CharData {
  charName: string,
  inWaves: [number, string][],
  layouts: Record<string, SplitData>
}


function runtimeData(meta: Meta, vizConfig: VizConfig): CharData[] {
  return meta.response.characteristics.map((characteristic) => {
    const inWaveDates = meta.wave.dates
      .filter((waveDate) => characteristic.in_waves.includes(waveDate[0]))
      .sort((a, b) => a[0] - b[0])
    return ({
      charName: characteristic.characteristic_name,
      inWaves: inWaveDates,
      layouts: (Object.fromEntries(vizConfig.layouts.map((layout) => ([
        layout.breakpoint,
        {
          splits: characteristic.splits
            .map((split) => addCounts(
              split,
              vizConfig.sample_size,
              meta.pid3.response_groups.length,
              characteristic.in_waves.length
            ))
            .map((splitWithCount) => addSegments(
              splitWithCount,
              layout,
              meta.pid3.response_groups,
              characteristic.in_waves.length
            )),
          unsplitPositions: pointPositions(
            0,
            layout.labelHeight,
            layout.vizWidth,
            (layout.labelHeight + layout.waveHeight) * meta.wave.vals.length,
            vizConfig.sample_size * meta.pid3.response_groups.length * characteristic.in_waves.length,
            layout.pointRadius
          )
        }
      ]))))
    } as CharData)
  })
}

function writeRuntimeData(dirPathString: string, data: CharData[]): void {
  fs.mkdirSync(dirPathString)
  data.forEach((chardata) => {
    const charDirPath = dirPathString + '/' + chardata.charName;
    fs.mkdirSync(charDirPath, { recursive: true });
    Object.entries(chardata.layouts).forEach(([breakPoint, splitData]) => {
      const js = JSON.stringify(splitData)
      fs.writeFileSync(charDirPath + '/' + breakPoint + '.json', js)
    })
    fs.writeFileSync(charDirPath + '/' + 'meta.json', JSON.stringify({
      waveData: chardata.inWaves
    }))
  })
}

export default function buildData(): void {
  const segmentsPerf = runtimeData(metaPerf, vizConfig)
  const segmentsImp = runtimeData(metaImp, vizConfig)
  writeRuntimeData('./public/perf', segmentsPerf)
  writeRuntimeData('./public/imp', segmentsImp)
}
