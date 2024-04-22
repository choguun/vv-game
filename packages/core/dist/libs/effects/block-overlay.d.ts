/// <reference types="types" />
import { Effect } from "postprocessing";
import { Color, PerspectiveCamera } from "three";
import { World } from "../../core/world";
/**
 * The block overlay effect is used to add a color blend whenever the camera is inside certain types of blocks.
 *
 * This module is dependent on the [`postprocessing`](https://github.com/pmndrs/postprocessing) package.
 *
 * # Example
 * ```ts
 * import { EffectComposer, RenderPass } from "postprocessing";
 *
 * const composer = new EffectComposer(renderer);
 * composer.addPass(new RenderPass(world, camera));
 *
 * const overlayEffect = new VOXELIZE.BlockOverlayEffect(world, camera);
 * overlayEffect.addOverlay("water", new THREE.Color("#5F9DF7"), 0.05);
 *
 * composer.addPass(
 *   new EffectPass(camera, overlayEffect)
 * );
 * ```
 *
 * ![Block overlay effect](/img/docs/overlay.png)
 *
 * @noInheritDoc
 * @category Effects
 */
export declare class BlockOverlayEffect extends Effect {
    world: World;
    camera: PerspectiveCamera;
    /**
     * A map of block IDs to overlay colors.
     */
    private overlays;
    /**
     * The old voxel ID that the camera was in.
     */
    private oldId;
    /**
     * Create a new block overlay effect.
     *
     * @param world The world that the effect is in.
     * @param camera The camera that the effect is applied to.
     */
    constructor(world: World, camera: PerspectiveCamera);
    /**
     * Add a new overlay to a certain voxel type.
     *
     * @param idOrName The block ID or name to add an overlay for.
     * @param color The color of the overlay.
     * @param opacity The opacity of the overlay.
     */
    addOverlay: (idOrName: number | string, color: Color, opacity: number) => void;
    /**
     * This is called by the effect composer to update the effect.
     *
     * @hidden
     */
    update: () => void;
    /**
     * Get the opacity of the overlay.
     */
    private get opacity();
    /**
     * Set the opacity of the overlay.
     */
    private set opacity(value);
    /**
     * Get the current overlay color.
     */
    private get overlay();
    /**
     * Set the current overlay color.
     */
    private set overlay(value);
}
//# sourceMappingURL=block-overlay.d.ts.map