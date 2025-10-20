//hooks
import { useState, useEffect, useRef } from "react";
//modules
import { gunzipSync, strFromU8 } from "fflate";
//types
import type { Breakpoint } from "./useBreakpoint";
import type { CoordinateData } from "../assets/config/meta"
import type { VizConfig } from "../assets/config/viz-config";
import type { PointPosition } from "../assets/config/meta";
import type { RefObject } from "react";
//config
import vizConfig from "../assets/config/viz-config.json";
const typedVizConfig = vizConfig as VizConfig
import metaPerf from "../assets/config/meta-perf.json";
import metaImp from "../assets/config/meta-imp.json";
import dataManifest from "../assets/config/data-manifest.json";
import type { DataManifest } from "../types/data-manifest";

// Types for data loading state
type DataLoadingState = "idle" | "pending" | "ready" | "error";


export interface Image {
  breakpoint: string,
  party: string,
  responsesExpanded: "collapsed" | "expanded",
  responseIndex: number,
  imagePath: string,
  image: HTMLImageElement
}


// Loaded data structure
interface CharacteristicData {
  impData: CoordinateData; // JSON data from imp/{characteristic}/{breakpoint}
  perfData: CoordinateData; // JSON data from perf/{characteristic}/{breakpoint}
  images: Image[];
}

interface CharacteristicDataState {
  state: DataLoadingState;
  data: CharacteristicData | null;
  error: string | null;
}

interface UseCharacteristicDataProps {
  characteristic: string | null;  //should be a characteristic short name, stripped of perf_/imp_ prefix
  breakpoint: Breakpoint;
}

export interface RespondentGroup {
  wave: [string, number[]];
  party: [string, string[]];
  response: {
    expanded: [string, string[]],
    collapsed: [string, string[]]
  };
  count: number;
  positions: (PointPosition | null)[];  //we allow null point positions 
  // so we can fudge thing if there are
  //  mis-matches in the point counts
  images: {
    collapsed: {
      party: HTMLImageElement | undefined,
      noParty: HTMLImageElement | undefined
    },
    expanded: {
      party: HTMLImageElement | undefined,
      noParty: HTMLImageElement | undefined
    },
    unSplit: HTMLImageElement | undefined
  };
  imageToDraw: HTMLImageElement | undefined;
}
// Previously a single RefObject holding an object with imp/perf arrays.
// Now we return an object containing two separate refs so mutations to one
// don't race with mutations to the other.
type RespondentsRef = {
  imp: RefObject<RespondentGroup[]>;
  perf: RefObject<RespondentGroup[]>;
}


function populateRespondents(
  charData: CharacteristicData,
  vizTab: "imp" | "perf",
  breakpoint: Breakpoint
): RespondentGroup[] {
  const respondents = [] as RespondentGroup[]
  const data = (vizTab === "imp") ? charData.impData : charData.perfData;
  const imageData = charData.images;
  data.splits.forEach((split) => {
    if (split.party !== null && split.wave !== null && split.responses !== null) {
      const wave = split.wave
      const party = split.party
      const partyImageString = (party.value[0].includes("Democrat")) ? "Democrat" : (
        (party.value[0].includes("Republican") ? "Republican" : "Independent")
      )
      split.responses.expanded.forEach((responseGroup, rgIdx) => {
        /*  
        Start brittle hack for mapping expanded responseGroup to collapsed response group
        */
        const collapsedResponseIdx = (rgIdx <= 1) ? 0 : 1
        const collapsedResponseGroup = (vizTab === "imp") ?
          metaImp.response.response_groups.collapsed[collapsedResponseIdx] :
          metaPerf.response.response_groups.collapsed[collapsedResponseIdx]
        /*End brittle hack*/
        const unSplitImage = imageData.find((image) => (
          image.breakpoint === breakpoint &&
          image.party === 'Noparty' &&
          image.responsesExpanded === "expanded" &&
          image.responseIndex === (
            (vizTab === "imp") ?
              metaImp.response.response_groups.expanded.length - 1 :
              metaPerf.response.response_groups.expanded.length - 1
          )
        ))?.image
        respondents.push({
          wave: wave.value,
          party: party.value,
          response: {
            expanded: responseGroup.response,
            collapsed: collapsedResponseGroup as [string, string[]]
          },
          count: responseGroup.count,
          positions: Array.from({ length: responseGroup.count }, () => ({ x: 0, y: 0, cx: 0, cy: 0 })),
          images: {
            expanded: {
              noParty: (imageData.find((image) => (
                image.breakpoint === breakpoint &&
                image.party === 'Noparty' &&
                image.responsesExpanded === "expanded" &&
                image.responseIndex === rgIdx
              )))?.image,
              party: (imageData.find((image) => (
                image.breakpoint === breakpoint &&
                image.party === partyImageString &&
                image.responsesExpanded === "expanded" &&
                image.responseIndex === rgIdx
              )))?.image
            },
            collapsed: {
              noParty: (imageData.find((image) => (
                image.breakpoint === breakpoint &&
                image.party === 'Noparty' &&
                image.responsesExpanded === "collapsed" &&
                image.responseIndex === collapsedResponseIdx
              )))?.image,
              party: (imageData.find((image) => (
                image.breakpoint === breakpoint &&
                image.party === partyImageString &&
                image.responsesExpanded === "collapsed" &&
                image.responseIndex === collapsedResponseIdx
              )))?.image
            },
            unSplit: unSplitImage
          },
          imageToDraw: unSplitImage
        })
      })
    }
  })
  return respondents
}


export const useCharacteristicData = ({
  characteristic,
  breakpoint
}: UseCharacteristicDataProps): [CharacteristicDataState, RespondentsRef] => {
  const [dataState, setDataState] = useState<CharacteristicDataState>({
    state: "idle",
    data: null,
    error: null,
  });
  // Create two independent refs so updates to one tab's respondents don't
  // mutate the other and so rapid switching can't interleave mutations.
  const impRespondents = useRef<RespondentGroup[]>([]);
  const perfRespondents = useRef<RespondentGroup[]>([]);
  // Keep a stable object identity for the returned refs so consumers
  // won't see a new object each render.
  const respondentsObjRef = useRef<RespondentsRef>({ imp: impRespondents, perf: perfRespondents });

  useEffect(() => {
    // This will run whenever the breakpoint or characterstic changes,
    // So we should always clear both respondents refs here
    impRespondents.current = [];
    perfRespondents.current = [];
    // Reset the data state when characteristic is null (no characteristic selected)
    if (!characteristic) {
      setDataState({
        state: "idle",
        data: null,
        error: null,
      });
      return;
    }

    // Start loading process when either characteristic OR breakpoint changes
    // Data files are specific to both the characteristic and breakpoint combination
    setDataState(prev => ({
      ...prev,
      state: "pending",
      error: null,
    }));

    // Load data based on BOTH the characteristic AND current breakpoint
    // Different breakpoints require different data files for the same characteristic
    const loadCharacteristicData = async (): Promise<void> => {
      try {
        // Check manifest for data availability
        const manifest = dataManifest as DataManifest;
        const charData = manifest.characteristics[characteristic];

        if (!charData) {
          throw new Error(`Characteristic '${characteristic}' not found in data manifest`);
        }

        const hasImpData = charData.imp.includes(breakpoint);
        const hasPerfData = charData.perf.includes(breakpoint);

        //console.warn(`Data availability for ${characteristic}/${breakpoint}: imp=${hasImpData}, perf=${hasPerfData}`);

        // Check if at least one file exists - it's valid to have only imp OR only perf data
        if (!hasImpData && !hasPerfData) {
          throw new Error(`No data files found for ${characteristic}/${breakpoint} in either imp or perf folders`);
        }

        // Only fetch files that we know exist
        const impResponsePromise = hasImpData ? fetch(`/imp/${characteristic}/${breakpoint}.gz`) : null;
        const perfResponsePromise = hasPerfData ? fetch(`/perf/${characteristic}/${breakpoint}.gz`) : null;

        const [impResponse, perfResponse] = await Promise.all([
          impResponsePromise,
          perfResponsePromise
        ]);        // Helper function to create empty CoordinateData structure
        const createEmptyCoordinateData = (): CoordinateData => ({
          splits: [],
          unsplitPositions: {
            error: false,
            data: []
          },
          waves: []
        });

        // Helper function to get JSON string from uint8 array (auto-detect compression)
        const getJsonString = (uint8Array: Uint8Array, filename: string): string => {
          // Check if data looks already decompressed (starts with '{' or '[')
          const firstChar = String.fromCharCode(uint8Array[0]);

          console.warn(`Processing ${filename}: first byte = ${uint8Array[0]} (char: '${firstChar}'), length = ${uint8Array.length}`);

          if (firstChar === '{' || firstChar === '[') {
            // Server auto-decompressed - use data as-is
            console.warn(`${filename}: Using already decompressed data`);
            return strFromU8(uint8Array);
          } else {
            // Manual decompression needed - server served raw gzipped bytes
            console.warn(`${filename}: Attempting manual decompression`);
            try {
              const decompressed = gunzipSync(uint8Array);
              return strFromU8(decompressed);
            } catch (gzipError) {
              console.error(`${filename}: Gzip decompression failed:`, gzipError);
              console.error(`${filename}: First 20 bytes:`, Array.from(uint8Array.slice(0, 20)));
              throw new Error(`Failed to decompress ${filename}: ${gzipError}`);
            }
          }
        };

        // Process files - handle cases where one or both might be missing
        let impData: CoordinateData;
        let perfData: CoordinateData;

        try {
          // Handle imp data
          if (impResponse && impResponse.ok) {
            console.warn(`Processing imp data: fetching arrayBuffer...`);
            const impArrayBuffer = await impResponse.arrayBuffer();
            const impUint8Array = new Uint8Array(impArrayBuffer);
            const impJsonString = getJsonString(impUint8Array, `imp/${characteristic}/${breakpoint}.gz`);
            impData = JSON.parse(impJsonString) as CoordinateData;
            console.warn(`Successfully parsed imp data`);
          } else {
            // No imp data available - use empty structure
            console.warn(`No imp data found for ${characteristic}/${breakpoint}, using empty structure`);
            impData = createEmptyCoordinateData();
          }

          // Handle perf data
          if (perfResponse && perfResponse.ok) {
            console.warn(`Processing perf data: fetching arrayBuffer...`);
            const perfArrayBuffer = await perfResponse.arrayBuffer();
            const perfUint8Array = new Uint8Array(perfArrayBuffer);
            const perfJsonString = getJsonString(perfUint8Array, `perf/${characteristic}/${breakpoint}.gz`);
            perfData = JSON.parse(perfJsonString) as CoordinateData;
            console.warn(`Successfully parsed perf data`);
          } else {
            // No perf data available - use empty structure
            console.warn(`No perf data found for ${characteristic}/${breakpoint}, using empty structure`);
            perfData = createEmptyCoordinateData();
          }

        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          throw new Error(`Failed to parse JSON data for ${characteristic}/${breakpoint}: ${jsonError}`);
        }



        //construct image objects
        const unLoadedImages: Image[] = []
        //loop through each layout
        typedVizConfig.layouts.forEach((layout) => {
          //loop through each party value
          typedVizConfig.colorConfig.parties.forEach((party) => {
            //loop through the shades for the collapsed response groups
            typedVizConfig.colorConfig.shades.collapsed.forEach((shade) => {
              unLoadedImages.push({
                breakpoint: layout.breakpoint,
                party: party,
                responsesExpanded: "collapsed",
                responseIndex: shade[0],
                imagePath: `circles/${layout.breakpoint}/${party}/collapsed/${shade[0].toString()}.png`,
                image: new Image()
              })
            })
            //loop through the shades for the expanded response groups
            typedVizConfig.colorConfig.shades.expanded.forEach((shade) => {
              unLoadedImages.push({
                breakpoint: layout.breakpoint,
                party: party,
                responsesExpanded: "expanded",
                responseIndex: shade[0],
                imagePath: `circles/${layout.breakpoint}/${party}/expanded/${shade[0].toString()}.png`,
                image: new Image()
              })
            })
          })
        })
        // try to load images
        const imagePromises = unLoadedImages.map((image) => {
          return new Promise<Image>((resolve, reject) => {
            image.image.onload = () => resolve(image);
            image.image.onerror = () => reject(new Error(`Failed to load image: ${image.imagePath}`));
            image.image.src = image.imagePath
          });
        });
        const images = await Promise.all(imagePromises);
        //previous line throws if any image failes to load.

        //if we get here, everything loaded successfully...
        //we can populate the respondents refs and set the data state to ready
        impRespondents.current = populateRespondents({ impData, perfData, images }, "imp", breakpoint);
        perfRespondents.current = populateRespondents({ impData, perfData, images }, "perf", breakpoint);
        setDataState({
          state: "ready",
          data: {
            impData,
            perfData,
            images
          },
          error: null,
        });
      } catch (error) {
        console.error("Data loading error:", error);
        console.error("Attempted data URLs:", `/imp/${characteristic}/${breakpoint}.gz`, `/perf/${characteristic}/${breakpoint}.gz`);
        setDataState({
          state: "error",
          data: null,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    };

    loadCharacteristicData();
  }, [characteristic, breakpoint]);

  return [dataState, respondentsObjRef.current];
};

export type { DataLoadingState, CharacteristicDataState, RespondentsRef };