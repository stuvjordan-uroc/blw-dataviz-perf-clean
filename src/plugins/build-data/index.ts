//load the question data
import type { Questions } from "../../assets/config/config-types";
import q from "../../assets/config/questions.json";
const questions = q as Questions;
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

export default function buildData() {
  return ({
    segments: {
      imp: makeSegments(vizConfig, metaImp),
      perf: makeSegments(vizConfig, metaPerf)
    }
  })
}
