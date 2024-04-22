import { AABB } from "@voxelize/aabb";
import { Coords3 } from "../../types";
import { UV } from "./uv";
export type BlockSimpleRule = {
    offset: Coords3;
    id?: number;
    rotation?: BlockRotation;
    stage?: number;
};
export declare enum BlockRuleLogic {
    And = "and",
    Or = "or",
    Not = "not"
}
export type BlockRule = {
    type: "none";
} | ({
    type: "simple";
} & BlockSimpleRule) | {
    type: "combination";
    logic: BlockRuleLogic;
    rules: BlockRule[];
};
export interface BlockConditionalPart {
    rule: BlockRule;
    faces: Block["faces"];
    aabbs: Block["aabbs"];
    isTransparent: Block["isTransparent"];
}
export interface BlockDynamicPattern {
    parts: BlockConditionalPart[];
}
/**
 * A block type in the world. This is defined by the server.
 */
export type Block = {
    /**
     * The block id.
     */
    id: number;
    /**
     * The name of the block.
     */
    name: string;
    /**
     * The red light level of the block.
     */
    redLightLevel: number;
    /**
     * The green light level of the block.
     */
    greenLightLevel: number;
    /**
     * The blue light level of the block.
     */
    blueLightLevel: number;
    /**
     * Whether or not is the block rotatable.
     */
    rotatable: boolean;
    /**
     * Whether or not the block is rotatable around the y-axis (has to face either PX or NX).
     */
    yRotatable: boolean;
    /**
     * Whether or not is this block empty. By default, only "air" is empty.
     */
    isEmpty: boolean;
    /**
     * Whether or not is the block a fluid block.
     */
    isFluid: boolean;
    /**
     * Whether or not is this block a light source.
     */
    isLight: boolean;
    /**
     * Whether or not should physics ignore this block.
     */
    isPassable: boolean;
    /**
     * Whether or not is this block opaque (not transparent).
     */
    isOpaque: boolean;
    /**
     * Whether or not is this block see-through (can be opaque and see-through at the same time).
     */
    isSeeThrough: boolean;
    /**
     * Whether or not is this block transparent viewing from all six sides. The sides
     * are defined as PX, PY, PZ, NX, NY, NZ.
     */
    isTransparent: [boolean, boolean, boolean, boolean, boolean, boolean];
    transparentStandalone: boolean;
    /**
     * A list of block face data that this block has.
     */
    faces: {
        corners: {
            pos: [number, number, number];
            uv: number[];
        }[];
        dir: [number, number, number];
        independent: boolean;
        isolated: boolean;
        range: UV;
        name: string;
    }[];
    /**
     * A list of axis-aligned bounding boxes that this block has.
     */
    aabbs: AABB[];
    /**
     * Whether or not should light reduce by 1 going through this block.
     */
    lightReduce: boolean;
    /**
     * Whether or not does the block generate dynamic faces or AABB's. If this is true, the block will use
     * `dynamicFn` to generate the faces and AABB's.
     */
    isDynamic: boolean;
    dynamicPatterns: BlockDynamicPattern[];
    /**
     * If this block is dynamic, this function will be called to generate the faces and AABB's. By default, this
     * just returns the faces and AABB's that are defined in the block data.
     *
     * @param pos The position of the block.
     * @param world The world instance.
     * @returns The dynamic faces and AABB's of the block.
     */
    dynamicFn: (pos: Coords3) => {
        faces: Block["faces"];
        aabbs: Block["aabbs"];
        isTransparent: Block["isTransparent"];
    };
    /**
     * A set of block face names that are independent (high resolution or animated). This is generated on the client side.
     */
    independentFaces: Set<string>;
    isolatedFaces: Set<string>;
    isEntity: boolean;
};
/**
 * A block update to make on the server.
 */
export type BlockUpdate = {
    /**
     * The voxel x-coordinate.
     */
    vx: number;
    /**
     * The voxel y-coordinate.
     */
    vy: number;
    /**
     * The voxel z-coordinate.
     */
    vz: number;
    /**
     * The voxel type.
     */
    type: number;
    /**
     * The optional rotation of the updated block.
     */
    rotation?: number;
    /**
     * The optional y-rotation of the updated block.
     */
    yRotation?: number;
};
export type BlockUpdateWithSource = {
    update: BlockUpdate;
    source: "client" | "server";
};
/**
 * The numerical representation of the positive Y rotation.
 */
export declare const PY_ROTATION = 0;
/**
 * The numerical representation of the negative Y rotation.
 */
export declare const NY_ROTATION = 1;
/**
 * The numerical representation of the positive X rotation.
 */
export declare const PX_ROTATION = 2;
/**
 * The numerical representation of the negative X rotation.
 */
export declare const NX_ROTATION = 3;
/**
 * The numerical representation of the positive Z rotation.
 */
export declare const PZ_ROTATION = 4;
/**
 * The numerical representation of the negative Z rotation.
 */
export declare const NZ_ROTATION = 5;
/**
 * The amount of Y-rotation segments should be allowed for y-rotatable blocks. In other words,
 * the amount of times the block can be rotated around the y-axis within 360 degrees.
 *
 * The accepted Y-rotation values will be from `0` to `Y_ROTATION_SEGMENTS - 1`.
 */
export declare const Y_ROT_SEGMENTS = 16;
/**
 * A rotational map used to get the closest y-rotation representation to a y-rotation value.
 */
export declare const Y_ROT_MAP: any[];
/**
 * A block rotation consists of two rotations: one is the axis this block is pointing towards,
 * and the other is the rotation around that axis (y-rotation). Y-rotation is only applicable
 * to the positive and negative x-axis.
 */
export declare class BlockRotation {
    /**
     * The axis this block is pointing towards.
     */
    value: number;
    /**
     * The rotation around the axis this block is pointing towards, rounded to the nearest
     * (360 / 16) degrees.
     */
    yRotation: number;
    /**
     * Create a new block rotation.
     *
     * @param value The axis this block is pointing towards.
     * @param yRotation The rotation around the axis this block is pointing towards, rounded to the nearest (360 / 16) degrees.
     */
    constructor(value?: number, yRotation?: number);
    /**
     * Encode two rotations into a new block rotation instance.
     *
     * @param value The axis this block is pointing towards.
     * @param yRotation The rotation around the axis this block is pointing towards.
     * @returns A new block rotation.
     */
    static encode: (value: number, yRotation?: number) => BlockRotation;
    /**
     * Decode a block rotation into two rotations.
     *
     * @param rotation The block rotation to decode.
     * @returns Two values, the first is the axis this block is pointing towards, and
     *   the second is the rotation around that axis.
     */
    static decode: (rotation: BlockRotation) => number[];
    /**
     * Rotate a 3D coordinate by this block rotation.
     *
     * @param node A 3D coordinate in the form of [x, y, z] to be rotated by this block rotation.
     * @param yRotate Whether or not should the y-rotation be applied.
     * @param translate Whether or not should the translation be applied.
     */
    rotateNode: (node: Coords3, yRotate?: boolean, translate?: boolean) => void;
    /**
     * Rotate an axis aligned bounding box by this block rotation, recalculating the new
     * maximum and minimum coordinates to this AABB.
     *
     * @param aabb The axis aligned bounding box to be rotated.
     * @param yRotate Whether or not should the y-rotation be applied.
     * @param translate Whether or not should the translation be applied.
     * @returns A new axis aligned bounding box.
     */
    rotateAABB: (aabb: AABB, yRotate?: boolean, translate?: boolean) => AABB;
    rotateTransparency([px, py, pz, nx, ny, nz]: [
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean
    ]): boolean[];
    /**
     * Rotate a 3D coordinate around the X axis.
     */
    private static rotateX;
    /**
     * Rotate a 3D coordinate around the Y axis.
     */
    private static rotateY;
    /**
     * Rotate a 3D coordinate around the Z axis.
     */
    private static rotateZ;
}
//# sourceMappingURL=block.d.ts.map