import { ChunkProtocol } from "@voxelize/transport/src/types";
import { Color, Vector4 } from "three";
import { Coords2 } from "types";
import { Chunk } from "./chunk";
import { BlockUpdate, BlockUpdateWithSource, CustomChunkShaderMaterial } from ".";
export declare class Chunks {
    /**
     * A map of all block faces to their corresponding ThreeJS shader materials. This also holds their corresponding textures.
     */
    materials: Map<string, CustomChunkShaderMaterial>;
    /**
     * The WebGL uniforms that are used in the chunk shader.
     */
    uniforms: {
        /**
         * The fog color that is applied onto afar chunks. It is recommended to set this to the
         * middle color of the sky. Defaults to a new THREE.JS white color instance.
         */
        fogColor: {
            /**
             * The value passed into the chunk shader.
             */
            value: Color;
        };
        /**
         * The near distance of the fog. Defaults to `100` units.
         */
        fogNear: {
            /**
             * The value passed into the chunk shader.
             */
            value: number;
        };
        /**
         * The far distance of the fog. Defaults to `200` units.
         */
        fogFar: {
            /**
             * The value passed into the chunk shader.
             */
            value: number;
        };
        /**
         * The ambient occlusion levels that are applied onto the chunk meshes. Check out [this article](https://0fps.net/2013/07/03/ambient-occlusion-for-minecraft-like-worlds/)
         * for more information on ambient occlusion for voxel worlds. Defaults to `new Vector4(100.0, 170.0, 210.0, 255.0)`.
         */
        ao: {
            /**
             * The value passed into the chunk shader.
             */
            value: Vector4;
        };
        /**
         * The minimum brightness of the world at light level `0`. Defaults to `0.2`.
         */
        minLightLevel: {
            /**
             * The value passed into the chunk shader.
             */
            value: number;
        };
        /**
         * The sunlight intensity of the world. Changing this to `0` would effectively simulate night time
         * in Voxelize. Defaults to `1.0`.
         */
        sunlightIntensity: {
            /**
             * The value passed into the chunk shader.
             */
            value: number;
        };
        /**
         * The time constant `performance.now()` that is used to animate the world. Defaults to `performance.now()`.
         */
        time: {
            /**
             * The value passed into the chunk shader.
             */
            value: number;
        };
        /**
         * The intensity of the sunlight. Defaults to `1.0`.
         */
        lightIntensityAdjustment: {
            /**
             * The value passed into the chunk shader.
             */
            value: number;
        };
    };
    requested: Map<string, number>;
    toAdd: Coords2[];
    toRequest: string[];
    toRequestSet: Set<string>;
    loaded: Map<string, Chunk>;
    toProcess: {
        source: "update" | "load";
        data: ChunkProtocol;
    }[];
    toProcessSet: Set<string>;
    toUpdate: BlockUpdateWithSource[];
    toEmit: BlockUpdate[];
    /**
     * @hidden
     */
    constructor();
}
//# sourceMappingURL=chunks.d.ts.map