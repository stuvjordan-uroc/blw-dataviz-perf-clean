//hooks, etc.
import { useState } from "react";
//css
import "./App.css";
//components
import { Viz } from "./components/Viz";
import CharacteristicPicker from "./components/CharacteristicPicker";
import Header from "./components/Header";
import { BreakpointProvider } from "./contexts/BreakpointContext";
//vizConfig to get layout parameters
import vizConfig from "./assets/config/viz-config.json";
//types
import type { ReactElement } from "react";

function App(): ReactElement {
  const [requested_characteristic, setRequested_characteristic] = useState<
    null | string
  >(null);

  const minOfMaxScreenWidth =
    vizConfig["layouts"][vizConfig["layouts"].length - 1][
      "screenWidthRange"
    ][0];

  const handleCharacteristicSelect = (characteristic: string): void => {
    setRequested_characteristic(characteristic);
  };

  return (
    <BreakpointProvider>
      <div className="app" style={{ maxWidth: minOfMaxScreenWidth + "px" }}>
        <Header />
        <CharacteristicPicker
          onCharacteristicSelect={handleCharacteristicSelect}
          selectedCharacteristic={requested_characteristic}
        />
        {requested_characteristic !== null && (
          <Viz characteristic={requested_characteristic} />
        )}
      </div>
    </BreakpointProvider>
  );
}

export default App;
