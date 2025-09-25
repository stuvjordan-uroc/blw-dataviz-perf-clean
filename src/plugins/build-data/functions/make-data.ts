//zod for parsing raw data json
import { z } from "zod";
//node fs and fflate for defalting and reading .gz files
import { decompressSync, strFromU8 } from "fflate";
import fs from "node:fs"
//full list of questions
import questions from "../../../assets/config/questions.json"


//for parsing raw data from json files
const RawDataSchema = z.object({
  columns: z.array(z.string()),
  data: z.array(z.array(z.union([z.string(), z.number(), z.null()]))),
});
type RawData = z.infer<typeof RawDataSchema>;

function coerceToStringOrNull(val: string | number | null | undefined): string | null {
  if (val === null || val === undefined) {
    return null;
  } else {
    if (typeof val === "string") {
      return val === "" ? null : val;
    }
    if (typeof val === "number") {
      return isNaN(val) ? null : val.toString();
    }
    return null;
  }
}

function coerceToNumberOrNull(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) {
    return null;
  } else {
    if (typeof val === "string") {
      return val === "" ? null : parseFloat(val);
    }
    if (typeof val === "number") {
      return isNaN(val) ? null : val;
    }
    return null;
  }
}

function getUtilityColumnIndices(rawData: RawData, columnName: string) {
  return rawData.columns.findIndex((c) => c === columnName)
}

//to do...write a function that takes both the perf and the imp raw data
//and produces a single list of all characteristics covered by both

export function makeData(rawPerfDataPath: string, rawImpDataPath: string) {

  try {
    //try to read the data
    const rawPerfData: RawData = RawDataSchema.parse(
      JSON.parse(strFromU8(decompressSync(fs.readFileSync(rawPerfDataPath))))
    );
    const rawImpData: RawData = RawDataSchema.parse(
      JSON.parse(strFromU8(decompressSync(fs.readFileSync(rawImpDataPath))))
    );
    //get the utility columns
    const utilityCols = {
      perf: Object.fromEntries(
        ["wave", "weight", "pid3"].map((colName) => ([
          colName,
          rawPerfData.columns.findIndex((c) => c === colName)
        ]))
      ),
      imp: Object.fromEntries(
        ["wave", "weight", "pid3"].map((colName) => ([
          colName,
          rawImpData.columns.findIndex((c) => c === colName)
        ]))
      )
    }
    Object.entries(utilityCols).forEach(([varType, ucols]) => {
      Object.entries(ucols).forEach(([colName, colIdx]) => {
        if (colIdx === -1) {
          console.warn(`Raw ${varType} data has no column with name ${colName}`)
        }
      })
    })

  } catch (error) {
    console.error(
      `Raw data has the wrong format.`,
      error
    );
    return undefined;
  }
}


export function makePerfData(rawDataPathString: string): undefined | {
  characteristics: string[],
  waves: number[],
  responses: Set<string>,
  data: 
} {
  try {
    const rawData: RawData = RawDataSchema.parse(
      JSON.parse(strFromU8(decompressSync(fs.readFileSync(rawDataPathString))))
    );
    const weightColumnIndex = rawData.columns.findIndex((c) => c === "weight");
    if (weightColumnIndex === -1) {
      console.warn(
        `WARNING: Raw data at ${rawDataPathString} has no weight column`
      );
      return undefined;
    }
    const pid3ColumnIndex = rawData.columns.findIndex((c) => c === "pid3");
    if (pid3ColumnIndex === -1) {
      console.warn(
        `WARNING: Raw data at ${rawDataPathString} has no pid3 column`
      );
      return undefined;
    }
    const waveColumnIndex = rawData.columns.findIndex((c) => c === "wave");
    if (waveColumnIndex === -1) {
      console.warn(
        `WARNING: Raw data at ${rawDataPathString} has no wave column`
      );
      return undefined;
    }
    const perfCols = rawData.columns
      .map((col, colIdx) => ({
        colName: col,
        colIdx: colIdx,
      }))
      .filter((col) => col.colName.startsWith("perf_"))
      .map((col) => ({
        colName: col.colName.replace(/^perf_/, ""),
        colIdx: col.colIdx,
      }));
    const outData = rawData.data.map((row) => ({
      weight: coerceToNumberOrNull(row[weightColumnIndex]),
      pid3: coerceToStringOrNull(row[pid3ColumnIndex]),
      wave: coerceToNumberOrNull(row[waveColumnIndex]),
      perf: Object.fromEntries(
        perfCols.map((perfCol) => [perfCol.colName, row[perfCol.colIdx]])
      ),
    }));
    //construct the arrays of waves in which some imp or perf questions are included
    const allWaves = new Set(outData.map((row) => row.wave));
    //get the rows in which all perf questions are empty
    const allPerfQuestionsEmpty = outData.filter((row) => {
      const arrayOfIsEmpty = Object.keys(row.perf).map(
        (perfKey) => row.perf[perfKey] === null
      );
      return !arrayOfIsEmpty.includes(true);
    });
    const setOfWavesWithPerf = allWaves.difference(
      new Set(
        allPerfQuestionsEmpty
          .map((row) => row.wave)
          .filter((wave) => wave !== null)
      )
    );
    return {
      characteristics: perfCols.map((impCol) => impCol.colName).sort(),
      waves: [...setOfWavesWithPerf].sort((a, b) => a! - b!) as number[],
      responses: new Set(
        perfCols
          .map((perfCol) => outData.map((row) => row.perf[perfCol.colIdx]!))
          .flat(Infinity) as string[]
      ),
      data: outData,
    };
  } catch (error) {
    console.error(
      `Raw data at ${rawDataPathString} has the wrong format.`,
      error
    );
    return undefined;
  }
}

export function makeImpData(rawDataPathString: string) {
  try {
    const rawData: RawData = RawDataSchema.parse(
      JSON.parse(strFromU8(decompressSync(fs.readFileSync(rawDataPathString))))
    );
    const weightColumnIndex = rawData.columns.findIndex((c) => c === "weight");
    if (weightColumnIndex === -1) {
      console.warn(
        `WARNING: Raw data at ${rawDataPathString} has no weight column`
      );
      return undefined;
    }
    const pid3ColumnIndex = rawData.columns.findIndex((c) => c === "pid3");
    if (pid3ColumnIndex === -1) {
      console.warn(
        `WARNING: Raw data at ${rawDataPathString} has no pid3 column`
      );
      return undefined;
    }
    const waveColumnIndex = rawData.columns.findIndex((c) => c === "wave");
    if (waveColumnIndex === -1) {
      console.warn(
        `WARNING: Raw data at ${rawDataPathString} has no wave column`
      );
      return undefined;
    }
    const impCols = rawData.columns
      .map((col, colIdx) => ({
        colName: col,
        colIdx: colIdx,
      }))
      .filter((col) => col.colName.startsWith("imp_"))
      .map((col) => ({
        colName: col.colName.replace(/^imp_/, ""),
        colIdx: col.colIdx,
      }));
    const outData = rawData.data.map((row) => ({
      weight: coerceToNumberOrNull(row[weightColumnIndex]),
      pid3: coerceToStringOrNull(row[pid3ColumnIndex]),
      wave: coerceToNumberOrNull(row[waveColumnIndex]),
      imp: Object.fromEntries(
        impCols.map((impCol) => [impCol.colName, row[impCol.colIdx]])
      )
    }));
    //construct the arrays of waves in which some imp or perf questions are included
    const allWaves = new Set(outData.map((row) => row.wave));
    //get the rows in which all imp questions are empty
    const allImpQuestionsEmpty = outData.filter((row) => {
      const arrayOfIsEmpty = Object.keys(row.imp).map(
        (impKey) => row.imp[impKey] === null
      );
      return !arrayOfIsEmpty.includes(true);
    });
    const setOfWavesWithImp = allWaves.difference(
      new Set(
        allImpQuestionsEmpty
          .map((row) => row.wave)
          .filter((wave) => wave !== null)
      )
    );
    return {
      characteristics: impCols.map((impCol) => impCol.colName),
      waves: [...setOfWavesWithImp].sort((a, b) => a! - b!),
      responses: new Set(
        impCols
          .map((impCol) => outData.map((row) => row.imp[impCol.colIdx]!))
          .flat(Infinity) as string[]
      ),
      data: outData,
    };
  } catch (error) {
    console.error(
      `Raw data at ${rawDataPathString} has the wrong format.`,
      error
    );
    return undefined;
  }
}