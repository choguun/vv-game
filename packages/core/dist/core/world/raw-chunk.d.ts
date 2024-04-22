import { ChunkProtocol } from "@voxelize/transport/src/types";
import { NdArray } from "ndarray";
import { Coords2, Coords3 } from "../../types";
import { LightColor } from "../../utils/light-utils";
import { BlockRotation } from "./block";
export type RawChunkOptions = {
    size: number;
    maxHeight: number;
    maxLightLevel: number;
    subChunks: number;
};
export declare class RawChunk {
    options: RawChunkOptions;
    id: string;
    name: string;
    coords: Coords2;
    min: Coords3;
    max: Coords3;
    voxels: NdArray<Uint32Array>;
    lights: NdArray<Uint32Array>;
    constructor(id: string, coords: Coords2, options: RawChunkOptions);
    serialize(): [object, ArrayBuffer[]];
    static deserialize(data: any): RawChunk;
    setData(data: ChunkProtocol): void;
    /**
     * Get the raw voxel value at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @returns The raw voxel value at the given voxel coordinate. If the voxel is not within
     * the chunk, this method returns `0`.
     */
    getRawValue(vx: number, vy: number, vz: number): number;
    /**
     * Set the raw voxel value at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @param value The raw voxel value to set at the given voxel coordinate.
     * @returns The raw voxel value at the given voxel coordinate.
     */
    setRawValue(vx: number, vy: number, vz: number, val: number): number;
    /**
     * Get the raw light value at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @returns The raw light value at the given voxel coordinate.
     */
    getRawLight(vx: number, vy: number, vz: number): number;
    /**
     * Set the raw light value at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @param level The raw light level to set at the given voxel coordinate.
     * @returns The raw light level at the given voxel coordinate.
     */
    setRawLight(vx: number, vy: number, vz: number, level: number): number;
    /**
     * Get the voxel type ID at a given voxel or world coordinate.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @returns The voxel type ID at the given voxel coordinate.
     */
    getVoxel(vx: number, vy: number, vz: number): number;
    /**
     * Set the voxel type ID at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @param id The voxel type ID to set at the given voxel coordinate.
     * @returns The voxel type ID at the given voxel coordinate.
     */
    setVoxel(vx: number, vy: number, vz: number, id: number): number;
    /**
     * Get the voxel rotation at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @returns The voxel rotation at the given voxel coordinate.
     */
    getVoxelRotation(vx: number, vy: number, vz: number): BlockRotation;
    /**
     * Set the voxel rotation at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @param rotation The voxel rotation to set at the given voxel coordinate.
     */
    setVoxelRotation(vx: number, vy: number, vz: number, rotation: BlockRotation): void;
    /**
     * Get the voxel stage at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @returns The voxel stage at the given voxel coordinate.
     */
    getVoxelStage(vx: number, vy: number, vz: number): number;
    /**
     * Set the voxel stage at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @param stage The voxel stage to set at the given voxel coordinate.
     * @returns The voxel stage at the given voxel coordinate.
     */
    setVoxelStage(vx: number, vy: number, vz: number, stage: number): number;
    /**
     * Get the red light level at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate.
     * @param vy The y voxel coordinate.
     * @param vz The z voxel coordinate.
     * @returns The red light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    getRedLight(vx: number, vy: number, vz: number): number;
    /**
     * Set the red light level at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @param level The red light level to set at the given voxel coordinate.
     * @returns The red light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    setRedLight(vx: number, vy: number, vz: number, level: number): number;
    /**
     * Get the green light level at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @returns The green light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    getGreenLight(vx: number, vy: number, vz: number): number;
    /**
     * Set the green light level at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @param level The green light level to set at the given voxel coordinate.
     * @returns The green light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    setGreenLight(vx: number, vy: number, vz: number, level: number): number;
    /**
     * Get the blue light level at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @returns The blue light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    getBlueLight(vx: number, vy: number, vz: number): number;
    /**
     * Set the blue light level at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @param level The blue light level to set at the given voxel coordinate.
     * @returns The blue light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    setBlueLight(vx: number, vy: number, vz: number, level: number): number;
    /**
     * Get the colored torch light level at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @param color The color of the light to get at the given voxel coordinate.
     * @returns The light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    getTorchLight(vx: number, vy: number, vz: number, color: LightColor): number;
    /**
     * Set the colored torch light level at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @param level The light level to set at the given voxel coordinate.
     * @param color The color of the light to set at the given voxel coordinate.
     * @returns The light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    setTorchLight(vx: number, vy: number, vz: number, level: number, color: LightColor): number;
    /**
     * Get the sunlight level at a given voxel coordinate.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @returns The sunlight level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    getSunlight(vx: number, vy: number, vz: number): number;
    /**
     * Set the sunlight level at a given voxel coordinate.
     *
     * Note: This method is purely client-side and does not affect the actual values on the server.
     *
     * @param vx The x voxel coordinate
     * @param vy The y voxel coordinate
     * @param vz The z voxel coordinate
     * @param level The sunlight level to set at the given voxel coordinate.
     * @returns The sunlight level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
     */
    setSunlight(vx: number, vy: number, vz: number, level: number): number;
    /**
     * Whether or not is this chunk ready to be rendered and seen in the world.
     */
    get isReady(): boolean;
    private getLocalRedLight;
    private setLocalRedLight;
    private getLocalGreenLight;
    private setLocalGreenLight;
    private getLocalBlueLight;
    private setLocalBlueLight;
    private getLocalSunlight;
    private setLocalSunlight;
    private toLocal;
    private contains;
}
//# sourceMappingURL=raw-chunk.d.ts.map