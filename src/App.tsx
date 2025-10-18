//hooks, etc.
import { useState } from "react";
import { useCharacteristicData } from "./hooks/useCharacteristicData";
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
  const [requested_characteristic, setRequested_characteristic] = useState<
    null | string
  >(null);

  //current breakpoint state - App manages this directly
  const breakpoint = useBreakpoint();

  //set up the datastate.
  //note that the hook that returns dataState
  //set up a use-effect that causes data fetch whenever
  //either requested_characterstic or breakpoint changes.
  useCharacteristicData({
    characteristic: requested_characteristic,
    breakpoint: breakpoint,
  });

  //handler for characteristic selection
  const handleCharacteristicSelect = (characteristic: string): void => {
    setRequested_characteristic(characteristic);
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
