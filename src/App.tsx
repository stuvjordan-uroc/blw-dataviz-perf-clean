//hooks, etc.
import { useState } from "react";
import { useBreakpoint } from "./hooks/useBreakpoint";
//context for distributing stuff to children
import { BreakpointProvider } from "./contexts/BreakpointContext";
//css
import "./App.css";
//components
import { Viz } from "./components/Viz";
import CharacteristicPicker from "./components/CharacteristicPicker";
import Header from "./components/Header";
//vizConfig to get layout parameters
import vizConfig from "./assets/config/viz-config.json";
//types
import type { ReactElement } from "react";

function App(): ReactElement {
  //requested characteristic state
  const [requestedCharacteristic, setRequestedCharacteristic] = useState<
    null | string
  >(null);

  //current breakpoint state - App manages this directly
  const breakpoint = useBreakpoint();

  //handler for characteristic selection
  const handleCharacteristicSelect = (characteristic: string): void => {
    setRequestedCharacteristic(characteristic);
  };

  //this is for constraining the with of the App at the highest breakpoint
  const minOfMaxScreenWidth =
    vizConfig["layouts"][vizConfig["layouts"].length - 1][
      "screenWidthRange"
    ][0];

  return (
    <BreakpointProvider value={breakpoint}>
      <div className="app" style={{ maxWidth: minOfMaxScreenWidth + "px" }}>
        <Header />
        <CharacteristicPicker
          onCharacteristicSelect={handleCharacteristicSelect}
          selectedCharacteristic={requestedCharacteristic}
        />
        {requestedCharacteristic !== null && (
          <Viz requestedCharacteristic={requestedCharacteristic} />
        )}
      </div>
    </BreakpointProvider>
  );
}

export default App;
