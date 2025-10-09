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
//load the addCounts function
import { addCounts } from "./functions/add-counts";
import { addSegments } from "./functions/add-segments";

export default function buildData() {
  //construct the segments for each layout
  vizConfig.layouts.map((layout) => {
    /*  
    This is almost there, but not quite.

    addCounts and addSegments mutate the objects passed to them.
    But we need separate arrays of splits-with-segments FOR EACH layout.

    So I think we need to change addCounts and addSegments so that they
    do NOT mutate the underlying meta objects and instead return
    copies of those objects enhance with the segments.
    */
    metaPerf.response.characteristics.map((characteristic) => {
      characteristic.splits.map((split) => {
        if (split.responses) {
          //add the counts
          const expandedWithCounts = addCounts(split.responses.expanded, vizConfig.sample_size)
          const collapsedWithCounts = addCounts(split.responses.collapsed, vizConfig.sample_size)
          //add the segments
          const expandedWithSegments = addSegments(
            split.wave,
            split.party,
            expandedWithCounts,
            layout,
            metaPerf.wave.vals.length,
            metaPerf.pid3.response_groups
          )
          const collapsedWithSegments = addSegments(
            split.wave,
            split.party,
            collapsedWithCounts,
            layout,
            metaPerf.wave.vals.length,
            metaPerf.pid3.response_groups
          )
        }
      })
    })
  })
}
