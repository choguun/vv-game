import { CircleGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
import { World } from "../core/world/index";
/**
 * Parameters to create a shadow.
 */
export type ShadowOptions = {
    /**
     * The maximum distance from the object to the ground to cast a shadow. The shadow's scale scales inversely with distance. Defaults to `10`.
     */
    maxDistance: number;
    /**
     * The maximum radius the shadow can have. That is, the radius of the shadow when the object is on the ground. Defaults to `0.5`.
     */
    maxRadius: number;
};
/**
 * A shadow that is just a circle underneath an object that scales smaller with distance. Shadows ignore fluids.
 *
 * @noInheritDoc
 */
export declare class Shadow extends Mesh {
    world: World;
    /**
     * The options of the shadow.
     */
    options: ShadowOptions;
    /**
     * The shared material for all shadows.
     */
    static readonly MATERIAL: MeshBasicMaterial;
    /**
     * The shared geometry for all shadows.
     */
    static readonly GEOMETRY: CircleGeometry;
    /**
     * The y-offset of the shadow from the ground.
     */
    static readonly Y_OFFSET = 0.01;
    /**
     * Create a shadow instance.
     *
     * @param world The world to cast shadows in.
     * @param options The options of the shadow.
     */
    constructor(world: World, options?: Partial<ShadowOptions>);
    /**
     * This raycasts from the shadow's parent to the ground and determines the shadow's scale by the distance.
     */
    update: () => void;
}
/**
 * A manager for all shadows in the world. Shadows should be updated every frame.
 *
 * # Example
 * ```ts
 * // Create a shadow manager.
 * const shadows = new VOXELIZE.Shadows(world);
 *
 * // Add a shadow to an object managed by the shadow manager.
 * shadows.add(object);
 *
 * // Update the shadows every frame.
 * shadows.update();
 * ```
 *
 * @noInheritDoc
 */
export declare class Shadows extends Array<Shadow> {
    /**
     * The world to cast shadows in.
     */
    world: World;
    /**
     * Create a shadow manager.
     *
     * @param world The world to cast shadows in.
     */
    constructor(world: World);
    /**
     * Loops through all tracked shadows and updates them. This should be called every frame.
     * This also removes any shadows that are no longer attached to an object.
     */
    update: () => void;
    /**
     * Add a shadow to an object under the shadow manager.
     *
     * @param object The object to add a shadow to.
     * @param options The options of the shadow.
     */
    add: (object: Object3D, options?: Partial<ShadowOptions>) => void;
}
//# sourceMappingURL=shadows.d.ts.map