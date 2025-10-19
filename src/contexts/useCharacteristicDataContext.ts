import { useContext } from "react";
import { CharacteristicDataContext } from "./characteristicDataContextValue";
import type { CharacteristicDataState } from "../hooks/useCharacteristicData";

export const useCharacteristicDataContext = (): CharacteristicDataState => {
  const ctx = useContext(CharacteristicDataContext);
  if (!ctx) {
    throw new Error("useCharacteristicDataContext must be used within a CharacteristicDataProvider");
  }
  return ctx;
};

