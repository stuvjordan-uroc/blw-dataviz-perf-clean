import { useState } from "react";
import "./App.css";
import Viz from "./components/Viz";
import CharacteristicPicker from "./components/CharacteristicPicker";
import { useBreakpoint } from "./hooks/useBreakpoint";

function App() {
  const [requested_characteristic, setRequested_characteristic] = useState<
    null | string
  >(null);

  const current_breakpoint = useBreakpoint();

  const handleCharacteristicSelect = (characteristic: string): void => {
    setRequested_characteristic(characteristic);
  };

  return (
    <>
      <CharacteristicPicker
        onCharacteristicSelect={handleCharacteristicSelect}
        selectedCharacteristic={requested_characteristic}
      />
      {requested_characteristic !== null && (
        <Viz characteristic={requested_characteristic} />
      )}
    </>
  );
}

export default App;
