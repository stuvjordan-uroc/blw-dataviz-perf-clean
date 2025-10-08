import lodash from 'lodash'
export interface PointPosition {
  x: number,
  y: number,
  cx: number,
  cy: number
}
export function pointPositions(
  topLeftX: number,
  topLeftY: number,
  buildingWidth: number,
  buildingHeight: number,
  numResidents: number,
  pointRadius: number
): { error: boolean, data: PointPosition[] } {
  /* 
  Divide a rectangle of width buildingWidth and height buildingHeight into "windows", 
  each large enough to fit a circle of radius pointRadius, subject to their being enough windows to fit 
  numResidents.

  Then assign coordinates to the circles so that each one is randomly jittered within it's own apartment window.
  */



  //if there are zero points, return an empty array
  if (numResidents <= 0) {
    return { error: false, data: [] }
  }


  /*
  first construct the apartment windows.

  Let R be the number of rows of windows and C be the number of columns.

  For the windows to be big enough for the points, we must have

  R <= buildingHeight/(2*pointRadius)

  and

  C <= buildingWidth/(2*pointRadius)

  Further, for there to be enough windows, we must have

  numResidents <= R * C
  */

  //first set R and C to their maximum values, so that the windows are at their smallest
  let R = Math.floor(buildingHeight / (2 * pointRadius));
  let C = Math.floor(buildingWidth / (2 * pointRadius));
  if (R * C < numResidents) {
    /* 
    Here, when we set the rows and columns to the max values that fit the points,
    There are not enough windows in the building to fit all the points.
    We need some fallback in this case to assign positions for points.

    What we're going to do is set R = Math.ceil(Math.sqrt(numPoints)) and C = R.
    This will result in a total number of windows just above numPoints, with aspect
    ratios close to that of the building.  These windows will not be big 
    enough to fit the points, so we'll have overlapping of points.
    */
    R = Math.ceil(Math.sqrt(numResidents))
    C = R
    //each point will go in the middle of its window
    const windowWidth = buildingWidth / C;
    const windowHeight = buildingHeight / R;
    const allWindows = [] // as PointCoordinates[];
    for (let r = 1; r <= R; r++) {
      for (let c = 1; c <= C; c++) {
        const cx = topLeftX + (c - 1) * windowWidth + 0.5 * windowWidth;
        const cy = topLeftY + (r - 1) * windowHeight + 0.5 * windowHeight;
        allWindows.push({
          x: cx - pointRadius,
          y: cy - pointRadius,
          cx: cx,
          cy: cy,
        });
      }
    }
    //now select the indices of windows that will be empty at random
    const emptyIndices = lodash.sampleSize(
      allWindows.map((_el, idx) => idx),
      numResidents - R * C
    );
    return {
      error: true,
      data: allWindows.filter((_w, wIdx) => !emptyIndices.includes(wIdx))
    }
  }
  //if we get here, setting the smallest possible windows gives us more windows
  //than we need.  So we can start enlarging the windows up the point where we have 
  //enough for all th epoints
  let stepIsOdd = true;
  while ((R - 1) * C >= numResidents || R * (C - 1) >= numResidents) {
    if (!((R - 1) * C >= numResidents)) {
      //we can decrement C but not R
      C = C - 1;
    } else if (!(R * (C - 1) >= numResidents)) {
      //we can decrement R but not C
      R = R - 1;
    } else {
      //we can decrement either R or C
      if (stepIsOdd) {
        C = C - 1;
      } else {
        R = R - 1;
      }
      stepIsOdd = !stepIsOdd;
    }
  }
  //We now have C and R set to their minium possible values that can still fit all the points.  
  //This means the minimum number of windows of the maximum possible size.
  //now generate a random position within each window
  const windowWidth = buildingWidth / C;
  const windowHeight = buildingHeight / R;
  const allWindows = [] // as PointCoordinates[];
  for (let r = 1; r <= R; r++) {
    for (let c = 1; c <= C; c++) {
      const cx =
        topLeftX +
        (c - 1) * windowWidth +
        pointRadius +
        Math.random() * (windowWidth - 2 * pointRadius);
      const cy =
        topLeftY +
        (r - 1) * windowHeight +
        pointRadius +
        Math.random() * (windowHeight - 2 * pointRadius);
      allWindows.push({
        x: cx - pointRadius,
        y: cy - pointRadius,
        cx: cx,
        cy: cy,
      });
    }
  }
  //now select the indices of windows that will be empty at random
  const emptyIndices = lodash.sampleSize(
    allWindows.map((_el, idx) => idx),
    numResidents - R * C
  );
  return {
    error: false,
    data: allWindows.filter((_w, wIdx) => !emptyIndices.includes(wIdx))
  }
}