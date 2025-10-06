import type { VizConfig } from "../../../assets/config/config-types";
import type { Group, Meta, Response } from "../../../assets/raw-data/meta-types";

function counts(responseGroups: string[][], responses: Response[], sampleSize: number) {

}

function addCounts(responses: Response[], sampleSize: number, meta: Meta) {
  Object.entries(meta.response.response_groups).map(([groupType, responseGroups]) => ([
    groupType,
    counts(responseGroups, responses, sampleSize)
  ]))
}


export function makeSegments(
  vizConfig: VizConfig,
  meta: Meta
) {
  return vizConfig.layouts.map((layout) => {
    const withCounts = meta.response.characteristics.map((char) => ({
      ...char,
      groups: char.groups.map((group) => ({
        ...group,
        responses: group.responses === null ? null : addCounts(group.responses, vizConfig.sample_size, meta)
      }))
    }))
    return ([
      layout.breakpoint,
      meta.response.characteristics.map((char) => ({
        ...char,
        segments: char.proportions.map((p) => segment(p))
      }))
    ])
  })
}