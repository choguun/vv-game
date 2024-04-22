import { ArrowHelper, Color } from "three";
/**
 * Parameters to create an arrow.
 */
export type ArrowOptions = {
    /**
     * The radius of the body of the arrow. Defaults to `0.1`.
     */
    radius: number;
    /**
     * The height of the body of the arrow. Defaults to `0.8`.
     */
    height: number;
    /**
     * The radius of the head of the arrow. Defaults to `0.2`.
     */
    coneRadius: number;
    /**
     * The height of the head of the arrow. Defaults to `0.2`.
     */
    coneHeight: number;
    /**
     * The color of the arrow. Defaults to `red`.
     */
    color: string | Color;
};
/**
 * A helper for visualizing a direction. This is useful for debugging.
 *
 * This arrow is essentially a Voxelize version of the [`ArrowHelper`](https://threejs.org/docs/#api/en/helpers/ArrowHelper) from Three.js.
 *
 * # Example
 * ```ts
 * const arrow = new VOXELIZE.Arrow();
 *
 * arrow.position.set(10, 0, 10);
 * arrow.setDirection(new THREE.Vector3(1, 0, 0));
 *
 * world.add(arrow);
 * ```
 *
 * ![Arrow](/img/docs/arrow.png)
 *
 * @noInheritDoc
 */
export declare class Arrow extends ArrowHelper {
    /**
     * Parameters used to create the arrow.
     */
    options: ArrowOptions;
    /**
     * Create a new arrow.
     *
     * @param options - Parameters to create the arrow.
     */
    constructor(options?: Partial<ArrowOptions>);
}
//# sourceMappingURL=arrow.d.ts.map