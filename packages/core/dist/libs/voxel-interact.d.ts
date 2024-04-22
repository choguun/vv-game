import { Color, Group, Object3D } from "three";
import { World } from "../core/world";
import { Coords3 } from "../types";
/**
 * Parameters to customize the {@link VoxelInteract} instance.
 */
export type VoxelInteractOptions = {
    /**
     * The maximum distance of reach for the {@link VoxelInteract} instance. Defaults to `32`.
     */
    reachDistance: number;
    /**
     * Whether or not should the {@link VoxelInteract} instance ignore fluids when raycasting. Defaults to `true`.
     */
    ignoreFluids: boolean;
    /**
     * Whether or not should the {@link VoxelInteract} instance reverse the raycasting direction. Defaults to `false`.
     */
    inverseDirection: boolean;
    /**
     * The scale of the block highlight. Defaults to `1.002`.
     */
    highlightScale: number;
    /**
     * The type of the block highlight. Box would be a semi-transparent box, while outline would be 12 lines that outline the block's AABB union.
     * Defaults to `"box"`.
     */
    highlightType: "box" | "outline";
    /**
     * The lerping factor of the highlight. Defaults to `0.8`.
     */
    highlightLerp: number;
    /**
     * The color of the highlight. Defaults to `0xffffff`.
     */
    highlightColor: Color;
    /**
     * The opacity of the highlight. Defaults to `0.8`.
     */
    highlightOpacity: number;
    /**
     * @debug
     * Whether or not should there be arrows indicating the potential block placement's orientations. Defaults to `false`.
     */
    potentialVisuals: boolean;
};
/**
 * The VoxelInteract class is used to interact with voxels in the {@link World} instance. It consists of two main parts:
 *
 * - {@link VoxelInteract.potential}: The potential block placement. This is the data of a block's orientation that can be placed.
 * - {@link VoxelInteract.target}: The targeted block. This is the voxel that the camera is looking at.
 *
 * You can use these two properties to place blocks, remove blocks, and more.
 *
 * # Example
 * ```ts
 * // Create a new VoxelInteract instance.
 * const voxelInteract = new VoxelInteract(camera, world);
 *
 * // Add the voxel interact to the scene.
 * world.add(voxelInteract);
 *
 * // Set the target block to air.
 * if (voxelInteract.target) {
 *   const [vx, vy, vz] = voxelInteract.target;
 *   world.updateVoxel(vx, vy, vz, 0);
 * }
 *
 * // Update the interaction every frame.
 * voxelInteract.update();
 * ```
 *
 * ![VoxelInteract](/img/docs/voxel-interact.png)
 *
 * @noInheritDoc
 */
export declare class VoxelInteract extends Group {
    object: Object3D;
    world: World;
    /**
     * Parameters to customize the {@link VoxelInteract} instance.
     */
    options: VoxelInteractOptions;
    /**
     * Whether or not is this {@link VoxelInteract} instance currently active.
     */
    active: boolean;
    /**
     * The potential orientation and location of the block placement. If no block placement is possible, this will be `null`.
     */
    potential: {
        /**
         * The 3D coordinates of the potential block placement.
         */
        voxel: Coords3;
        /**
         * The rotation that the block placement's major axis should be facing.
         */
        rotation: number;
        /**
         * The rotation along the Y axis that the block placement's major axis should be facing.
         * This only works if rotation is {@link PY_ROTATION} or {@link NY_ROTATION}.
         */
        yRotation: number;
    } | null;
    /**
     * The targeted voxel coordinates of the block that the camera is looking at. If no block is targeted, this will be `null`.
     */
    target: Coords3 | null;
    /**
     * The new scale of the target for highlighting.
     */
    private newTargetScale;
    /**
     * The new position of the target for highlighting.
     */
    private newTargetPosition;
    /**
     * A Three.js group that contains the target block's highlight.
     */
    private targetGroup;
    /**
     * A Three.js group that contains the potential block placement's arrows.
     */
    private potentialGroup;
    /**
     * An arrow that points to the major axis of the potential block placement.
     */
    private potentialArrow;
    /**
     * An arrow that points to the y axis rotation of the potential block placement.
     */
    private yRotArrow;
    /**
     * Create a new VoxelInteract instance.
     *
     * @param object The object that the interactions should be raycasting from.
     * @param world The {@link World} instance that the interactions should be raycasting in.
     * @param options Parameters to customize the {@link VoxelInteract} instance.
     */
    constructor(object: Object3D, world: World, options?: Partial<VoxelInteractOptions>);
    /**
     * Toggle on/off of this {@link VoxelInteract} instance.
     *
     * @param force Whether or not should it be a forceful toggle on/off. Defaults to `null`.
     */
    toggle: (force?: any) => void;
    /**
     * Raycasts from the given object's position and direction to find the targeted voxel and potential block placement.
     * If no block is targeted, then {@link VoxelInteract.target} and {@link VoxelInteract.potential} will both be `null`.
     */
    update: () => void;
    /**
     * Get the voxel ID of the targeted voxel. `null` if no voxel is targeted.
     */
    get lookingAt(): import("../core/world").Block;
    /**
     * Setup the highlighter.
     */
    private setup;
}
//# sourceMappingURL=voxel-interact.d.ts.map