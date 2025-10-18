import { useState, useCallback } from "react";
import type { SplitViewMode, DataGranularity } from "../types/splits";

interface ViewState {
  splitViewMode: SplitViewMode;
  dataGranularity: DataGranularity;
}

interface UseViewStateReturn extends ViewState {
  setSplitViewMode: (mode: SplitViewMode) => void;
  setDataGranularity: (granularity: DataGranularity) => void;
  isGranularityControlEnabled: boolean;
}

export const useViewState = (): UseViewStateReturn => {
  const [viewState, setViewState] = useState<ViewState>({
    splitViewMode: 'all-data', // Default to "All Data" view
    dataGranularity: 'expanded' // Default granularity
  });

  const setSplitViewMode = useCallback((mode: SplitViewMode) => {
    setViewState(prev => ({
      ...prev,
      splitViewMode: mode
    }));
  }, []);

  const setDataGranularity = useCallback((granularity: DataGranularity) => {
    setViewState(prev => ({
      ...prev,
      dataGranularity: granularity
    }));
  }, []);

  // Granularity control is disabled when in "All Data" view
  const isGranularityControlEnabled = viewState.splitViewMode !== 'all-data';

  return {
    ...viewState,
    setSplitViewMode,
    setDataGranularity,
    isGranularityControlEnabled
  };
};