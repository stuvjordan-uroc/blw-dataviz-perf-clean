import { useState, useEffect } from "react";
import { gunzipSync, strFromU8 } from "fflate";
import type { Breakpoint } from "./useBreakpoint";
//import type { Coordinates } from "../types/splits";
import type { CoordinateData } from "../assets/config/meta"
import vizConfig from "../assets/config/viz-config.json";

// Types for data loading state
type DataLoadingState = "idle" | "pending" | "ready" | "error";

// Loaded data structure
interface CharacteristicData {
  impData: CoordinateData; // JSON data from imp/{characteristic}/{breakpoint}
  perfData: CoordinateData; // JSON data from perf/{characteristic}/{breakpoint}
  images: Record<string, HTMLImageElement>; // PNG images keyed by filename
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

export const useCharacteristicData = ({
  characteristic,
  breakpoint
}: UseCharacteristicDataProps): CharacteristicDataState => {
  const [dataState, setDataState] = useState<CharacteristicDataState>({
    state: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    // Reset state when characteristic is null (no characteristic selected)
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
        // Load gzipped JSON data from both imp and perf folders
        const impResponse = await fetch(`/imp/${characteristic}/${breakpoint}.gz`);
        const perfResponse = await fetch(`/perf/${characteristic}/${breakpoint}.gz`);

        // Check if at least one file exists - it's valid to have only imp OR only perf data
        if (!impResponse.ok && !perfResponse.ok) {
          throw new Error(`No data files found for ${characteristic}/${breakpoint} in either imp or perf folders`);
        }

        // Helper function to create empty CoordinateData structure
        const createEmptyCoordinateData = (): CoordinateData => ({
          splits: [],
          unsplitPositions: {
            error: false,
            data: []
          },
          waves: []
        });

        // Helper function to get JSON string from uint8 array (auto-detect compression)
        const getJsonString = (uint8Array: Uint8Array): string => {
          // Check if data looks already decompressed (starts with '{' or '[')
          const firstChar = String.fromCharCode(uint8Array[0]);

          if (firstChar === '{' || firstChar === '[') {
            // Server auto-decompressed - use data as-is
            return strFromU8(uint8Array);
          } else {
            // Manual decompression needed - server served raw gzipped bytes
            const decompressed = gunzipSync(uint8Array);
            return strFromU8(decompressed);
          }
        };

        // Process files - handle cases where one or both might be missing
        let impData: CoordinateData;
        let perfData: CoordinateData;

        try {
          // Handle imp data
          if (impResponse.ok) {
            const impArrayBuffer = await impResponse.arrayBuffer();
            const impUint8Array = new Uint8Array(impArrayBuffer);
            const impJsonString = getJsonString(impUint8Array);
            impData = JSON.parse(impJsonString) as CoordinateData;
          } else {
            // No imp data available - use empty structure
            impData = createEmptyCoordinateData();
          }

          // Handle perf data
          if (perfResponse.ok) {
            const perfArrayBuffer = await perfResponse.arrayBuffer();
            const perfUint8Array = new Uint8Array(perfArrayBuffer);
            const perfJsonString = getJsonString(perfUint8Array);
            perfData = JSON.parse(perfJsonString) as CoordinateData;
          } else {
            // No perf data available - use empty structure
            perfData = createEmptyCoordinateData();
          }

        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          throw new Error(`Failed to parse JSON data for ${characteristic}/${breakpoint}: ${jsonError}`);
        }        // Generate image filenames dynamically from config
        const { parties, shades } = vizConfig.colorConfig;
        const radius = vizConfig.layouts.find(layout => layout.breakpoint === breakpoint)?.pointRadius || 4;

        const imageFileNames: string[] = [];
        parties.forEach(party => {
          shades.forEach(shade => {
            imageFileNames.push(`circle-${party}-${shade}-r${radius}.png`);
          });
        });

        // Load all images as Image objects
        const imagePromises = imageFileNames.map((fileName) => {
          return new Promise<[string, HTMLImageElement]>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve([fileName, img]);
            img.onerror = () => reject(new Error(`Failed to load image: ${fileName}`));
            img.src = `/generated-points/${breakpoint}/${fileName}`;
          });
        });

        const imageResults = await Promise.all(imagePromises);
        const images = Object.fromEntries(imageResults);

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
        console.error("Attempted URLs:", `/imp/${characteristic}/${breakpoint}.gz`, `/perf/${characteristic}/${breakpoint}.gz`);
        setDataState({
          state: "error",
          data: null,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    };

    loadCharacteristicData();
  }, [characteristic, breakpoint]);

  return dataState;
};

export type { DataLoadingState, CharacteristicDataState };