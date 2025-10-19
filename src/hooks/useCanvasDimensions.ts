//config
import vizConfig from "../assets/config/viz-config.json"
import metaImp from "../assets/config/meta-imp.json"
import metaPerf from "../assets/config/meta-perf.json"
//types
import type { VizConfig, Layout } from "../assets/config/viz-config"
import type { Meta } from "../assets/config/meta"

interface UseCanvasDimensionsProps {
  breakpoint: string,
  vizTab: "imp" | "perf"
}

export default function useCanvasDimensions({ breakpoint, vizTab }: UseCanvasDimensionsProps): {
  width: number,
  height: number
} {
  const typedVizConfig = vizConfig as unknown as VizConfig
  //get the current layout, falling back to first layout if no layout matching
  //the breakpoint is found
  const layoutFound: Layout | undefined = typedVizConfig.layouts.find(
    (layout) => layout.breakpoint === breakpoint
  )
  const currentLayout: Layout = layoutFound || typedVizConfig.layouts[0]
  //get the layout dimensions from the meta config file
  const meta = vizTab === "imp" ? (metaImp as Meta) : (metaPerf as Meta)
  const numWaves = meta.wave.response_groups.length;
  return ({
    width: currentLayout.vizWidth,
    height: currentLayout.labelHeight + numWaves * (currentLayout.labelHeight + currentLayout.waveHeight)
  })
}