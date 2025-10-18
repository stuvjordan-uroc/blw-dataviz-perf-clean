//css
import "./VizControls.css";
//types
import type { ReactElement, Dispatch, SetStateAction } from "react";
import type { RequestedSplit, ResponsesExpanded } from "./VizRoot";
//components
import { Toggle, ToggleGroup } from "radix-ui";

/*
We're going to distinguish between a TOGGLE BUTTON and a TOGGLE SWITCH

A TOGGLE BUTTON very specifically has an 'on' or 'off' state.  The button label refers to the state
and stays constant, but the button appearance changes to indicate whether the state is 'on' or 'off'

A TOGGLE SWITCH is a generalization of a toggle button, where the two states are any arbitrary mutually
exclusive values, and both appear as always-visible labels.


We're going to use TOGGLE BUTTONs for everything.  The labels will be:

+ "collapse responses"
+ "split by response"
+ "split by administration"
+ "split by party"

Radix-UI's Toggle component is a TOGGLE BUTTON
*/

function listOfSplitsOn(requestedSplit: RequestedSplit): string[] {
  return Object.entries(requestedSplit)
    .filter(([_splitDim, split]) => split) //get the splits that are "on"
    .map(([splitDim, _split]) => splitDim); //get the names of those "on" splits
}

export default function VizControls({
  requestedSplit,
  setRequestedSplit,
  responsesExpanded,
  setResponsesExpanded,
}: {
  requestedSplit: RequestedSplit;
  setRequestedSplit: Dispatch<SetStateAction<RequestedSplit>>;
  responsesExpanded: ResponsesExpanded;
  setResponsesExpanded: Dispatch<SetStateAction<ResponsesExpanded>>;
}): ReactElement {
  return (
    <>
      <ToggleGroup.Root
        type="multiple"
        value={listOfSplitsOn(requestedSplit)}
        onValueChange={(newSplitDimsOn) => {
          setRequestedSplit((prevRequestedSplit) => {
            const newSplit = Object.fromEntries(
              Object.keys(prevRequestedSplit).map((splitDim) => [
                splitDim,
                newSplitDimsOn.includes(splitDim),
              ])
            );
            if (newSplit["response"]) {
              return newSplit as {
                response: true;
                wave: boolean;
                party: boolean;
              };
            }
            setResponsesExpanded("expanded");
            return {
              response: false,
              party: false,
              wave: false,
            };
          });
        }}
      >
        {["response", "wave", "party"].map((splitDim) => (
          <ToggleGroup.Item
            value={splitDim}
            disabled={splitDim !== "response" && !requestedSplit.response}
            key={splitDim}
            className="toggle-split"
          >
            {`split by ${splitDim}`}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <Toggle.Root
        pressed={responsesExpanded === "collapsed"}
        onPressedChange={(newPressed) => {
          setResponsesExpanded(newPressed ? "collapsed" : "expanded");
        }}
        disabled={!requestedSplit.response}
        className="toggle-split"
      >
        collapse responses
      </Toggle.Root>
    </>
  );
}
