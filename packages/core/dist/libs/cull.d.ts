import { NdArray } from "ndarray";
import { Coords3 } from "../types";
export type MeshResultType = {
    positions: Float32Array;
    normals: Float32Array;
    indices: Float32Array;
};
export type CullOptionsType = {
    min: Coords3;
    max: Coords3;
    realMin: Coords3;
    realMax: Coords3;
    dimensions: Coords3;
};
export declare function cull(array: NdArray, options: CullOptionsType): Promise<MeshResultType>;
//# sourceMappingURL=cull.d.ts.map