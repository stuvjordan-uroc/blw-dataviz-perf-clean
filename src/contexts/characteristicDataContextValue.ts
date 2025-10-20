import { createContext } from "react";
import type { CharacteristicDataState, RespondentsRef } from "../hooks/useCharacteristicData";

export const CharacteristicDataContext = createContext<[CharacteristicDataState, RespondentsRef] | null>(null);

export default CharacteristicDataContext;
