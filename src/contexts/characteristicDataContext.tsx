import React from "react";
import { CharacteristicDataContext } from "./characteristicDataContextValue";
import type {
  CharacteristicDataState,
  RespondentsRef,
} from "../hooks/useCharacteristicData";

export const CharacteristicDataProvider: React.FC<{
  value: [CharacteristicDataState, RespondentsRef];
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <CharacteristicDataContext.Provider value={value}>
      {children}
    </CharacteristicDataContext.Provider>
  );
};

export default CharacteristicDataProvider;
