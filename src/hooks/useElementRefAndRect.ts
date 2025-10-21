//hooks
import { useRef, useState, useLayoutEffect } from "react";
//types
import type { DependencyList, RefObject } from "react";

// Make the hook generic so callers can specify a narrower element type, e.g. HTMLFormElement
export default function useElementRefAndRect<T extends HTMLElement = HTMLElement>(
  dependencies?: DependencyList
): [RefObject<T | null>, DOMRect] {
  const elementRef = useRef<T | null>(null);
  const [elementRect, setElementRect] = useState<DOMRect>(new DOMRect());
  useLayoutEffect(() => {
    if (elementRef.current) {
      setElementRect(elementRef.current.getBoundingClientRect());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies ? dependencies : []);
  return ([elementRef, elementRect]);
}