import { Coords3 } from "types";
import { Block, BlockRotation, BlockRule } from "../core/world/block";
import { LightColor } from "./light-utils";
/**
 * A utility class for extracting and inserting voxel data from and into numbers.
 *
 * The voxel data is stored in the following format:
 * - Voxel type: `0x0000ffff`
 * - Rotation: `0x000f0000`
 * - Y-rotation: `0x00f00000`
 * - Stage: `0xff000000`
 *
 * TODO-DOCS
 * For more information about voxel data, see [here](/)
 *
 * # Example
 * ```ts
 * // Insert a voxel type 13 into zero.
 * const number = VoxelUtils.insertID(0, 13);
 * ```
 *
 * @category Utils
 */
export declare class BlockUtils {
    /**
     * Extract the voxel id from a number.
     *
     * @param voxel The voxel value to extract from.
     * @returns The extracted voxel id.
     */
    static extractID: (voxel: number) => number;
    /**
     * Insert a voxel id into a number.
     *
     * @param voxel The voxel value to insert the id into.
     * @param id The voxel id to insert.
     * @returns The inserted voxel value.
     */
    static insertID: (voxel: number, id: number) => number;
    /**
     * Extract the voxel rotation from a number.
     *
     * @param voxel The voxel value to extract from.
     * @returns The extracted voxel rotation.
     */
    static extractRotation: (voxel: number) => BlockRotation;
    /**
     * Insert a voxel rotation into a number.
     *
     * @param voxel The voxel value to insert the rotation into.
     * @param rotation The voxel rotation to insert.
     * @returns The inserted voxel value.
     */
    static insertRotation: (voxel: number, rotation: BlockRotation) => number;
    /**
     * Extract the voxel stage from a number.
     *
     * @param voxel The voxel value to extract from.
     * @returns The extracted voxel stage.
     */
    static extractStage: (voxel: number) => number;
    /**
     * Insert a voxel stage into a number.
     *
     * @param voxel The voxel value to insert the stage into.
     * @param stage The voxel stage to insert.
     * @returns The inserted voxel value.
     */
    static insertStage: (voxel: number, stage: number) => number;
    static insertAll: (id: number, rotation?: BlockRotation, stage?: number) => number;
    static getBlockTorchLightLevel: (block: Block, color: LightColor) => number;
    static getBlockRotatedTransparency(block: Block, rotation: BlockRotation): boolean[];
    static evaluateBlockRule: (rule: BlockRule, voxel: Coords3, functions: {
        getVoxelAt: (x: number, y: number, z: number) => number;
        getVoxelRotationAt: (x: number, y: number, z: number) => BlockRotation;
        getVoxelStageAt: (x: number, y: number, z: number) => number;
    }) => boolean;
    static getBlockEntityId(id: string, voxel: Coords3): string;
    private constructor();
}
//# sourceMappingURL=block-utils.d.ts.map