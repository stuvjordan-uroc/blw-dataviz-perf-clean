import { useState, useEffect } from "react";
import type { Breakpoint } from "./useBreakpoint";
import vizConfig from "../assets/config/viz-config.json";

// Types for data loading state
type DataLoadingState = "idle" | "pending" | "ready" | "error";

// Loaded data structure
interface CharacteristicData {
  impData: unknown; // JSON data from imp/{characteristic}/{breakpoint}
  perfData: unknown; // JSON data from perf/{characteristic}/{breakpoint}
  images: Record<string, HTMLImageElement>; // PNG images keyed by filename
}

interface CharacteristicDataState {
  state: DataLoadingState;
  data: CharacteristicData | null;
  error: string | null;
}

interface UseCharacteristicDataProps {
  characteristic: string | null;
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
        // Load JSON data from both imp and perf folders
        const impResponse = await fetch(`/imp/${characteristic}/${breakpoint}`);
        const perfResponse = await fetch(`/perf/${characteristic}/${breakpoint}`);

        if (!impResponse.ok || !perfResponse.ok) {
          throw new Error(`Failed to load data files for ${characteristic}/${breakpoint}`);
        }

        const impData = await impResponse.json();
        const perfData = await perfResponse.json();

        // Generate image filenames dynamically from config
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