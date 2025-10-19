import { createContext } from "react";
import type { CharacteristicDataState } from "../hooks/useCharacteristicData";

export const CharacteristicDataContext = createContext<CharacteristicDataState | null>(null);

export default CharacteristicDataContext;
