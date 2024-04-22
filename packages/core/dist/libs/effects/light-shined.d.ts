import { Object3D } from "three";
import { World } from "../../core";
/**
 * Parameters to create a light shine effect.
 */
export type LightShinedOptions = {
    /**
     * The lerping factor of the brightness of each mesh. Defaults to `0.1`.
     */
    lerpFactor: number;
};
/**
 * A class that allows mesh to dynamically change brightness based on the voxel light level at their position.
 *
 * By default, `VOXELIZE.Shadow` and `VOXELIZE.NameTag` is ignored by this effect.
 *
 * # Example
 * ```ts
 * // Create a light shined effect manager.
 * const lightShined = new VOXELIZE.LightShined();
 *
 * // Add the effect to a mesh.
 * lightShined.add(character);
 *
 * // In the render loop, update the effect.
 * lightShined.update();
 * ```
 *
 * ![Example](/img/docs/light-shined.png)
 *
 * @category Effects
 */
export declare class LightShined {
    world: World;
    /**
     * Parameters to customize the effect.
     */
    options: LightShinedOptions;
    /**
     * A list of meshes that are effected by this effect.
     */
    list: Set<Object3D>;
    /**
     * A list of types that are ignored by this effect.
     */
    ignored: Set<any>;
    /**
     * Construct a light shined effect manager.
     *
     * @param world The world that the effect is applied to.
     * @param options Parameters to customize the effect.
     */
    constructor(world: World, options?: Partial<LightShinedOptions>);
    /**
     * Add an object to be affected by this effect.
     *
     * @param obj A THREE.JS object to be shined on.
     */
    add: (obj: Object3D) => void;
    /**
     * Remove an object from being affected by this effect
     *
     * @param obj The object to be removed from the effect.
     */
    remove: (obj: Object3D) => void;
    /**
     * Update the light shined effect. This fetches the light level at the position of
     * each object and recursively updates the brightness of the object.
     *
     * This should be called in the render loop.
     */
    update: () => void;
    /**
     * Ignore a certain type of object from being affected by this effect.
     *
     * @example
     * ```ts
     * // Ignore all shadows. (This is done by default)
     * lightShined.ignore(VOXELIZE.Shadow);
     * ```
     *
     * @param types A type or a list of types to be ignored by this effect.
     */
    ignore: (...types: any[]) => void;
    private updateObject;
    /**
     * Recursively update an object and its children's brightness.
     */
    private recursiveUpdate;
}
//# sourceMappingURL=light-shined.d.ts.map