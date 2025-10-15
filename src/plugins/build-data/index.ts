//load the viz config
import type { VizConfig } from "../../assets/config/config-types";
import vz from "../../assets/config/viz-config.json";
const vizConfig = vz as VizConfig
//load the metadata
import type { Characteristic, Meta } from "../../assets/raw-data/meta-types";
import pm from "../../assets/raw-data/meta-perf.json";
import pi from "../../assets/raw-data/meta-imp.json";
const metaPerf = pm as Meta;
const metaImp = pi as Meta;

// get char file names for imp and perf
import { getZipFileNames } from "./functions/get-zip-file-names";
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
const rawDataPath = path.join(process.cwd(), 'src/assets/raw-data');
const [charZipPathImp, charZipPathPerf] = [
  path.join(rawDataPath, 'characteristics-imp.zip'),
  path.join(rawDataPath, 'characteristics-perf.zip')
];
const [charZipFileNamesImp, charZipFileNamesPerf] = [
  getZipFileNames(charZipPathImp),
  getZipFileNames(charZipPathPerf)
]

// functions for reading contents of a single file from a zip archive
// we need this to load any one characteristic split file from either
// of the zip archives.
import { extractZipFile } from "./functions/extract-zip-file";

//load the addCounts, addSegments, and pointPositions functions, along with some types we need
import { addCounts } from "./functions/add-counts";
import { addSegments } from "./functions/add-segments";
import type { SplitWithSegments } from "./functions/add-segments";
import { pointPositions, type PointPosition } from "./functions/point-positions";



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


function runtimeData(
  meta: Meta,
  charZip: string,
  charFileNames: string[],
  vizConfig: VizConfig,
  outdir: string
) {

  charFileNames.forEach((cfn) => {
    // Read the contents of the file with name cfn from the zip archive at charZip
    // without reading any other files in the archive into memory
    const characteristic = JSON.parse(
      extractZipFile(charZip, cfn).toString('utf8')
    ) as Characteristic;
    const inWaveDates = meta.wave.dates
      .filter((waveDate) => characteristic.in_waves.includes(waveDate[0]))
      .sort((a, b) => a[0] - b[0])
    const charName = characteristic.characteristic_name
    // Create a new directory at the path outdir + '/' + charName
    const charDir = outdir + '/' + charName;
    fs.mkdirSync(charDir, { recursive: true });
    vizConfig.layouts.forEach((layout) => {
      const splits = {
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

      // Create a gzipped JSON file for this layout
      const fileName = layout.breakpoint + '.gz';
      const filePath = charDir + '/' + fileName;
      const jsonString = JSON.stringify({
        ...splits,
        waves: inWaveDates
      });
      const gzippedData = zlib.gzipSync(jsonString);
      fs.writeFileSync(filePath, gzippedData);

    })
  })
}

export default function buildData(): void {
  runtimeData(metaPerf, charZipPathPerf, charZipFileNamesPerf, vizConfig, './public/perf')
  runtimeData(metaImp, charZipPathImp, charZipFileNamesImp, vizConfig, './public/imp')
}
