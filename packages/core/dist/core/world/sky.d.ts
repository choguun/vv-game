import { Color, Vector3 } from "three";
import { CanvasBox, CanvasBoxOptions } from "../../libs/canvas-box";
export type SkyShadingCycleData = {
    start: number;
    name: string;
    color: {
        top: Color | string;
        middle: Color | string;
        bottom: Color | string;
    };
    skyOffset: number;
    voidOffset: number;
};
export type SkyOptions = {
    /**
     * The dimension of the dodecahedron sky. The inner canvas box is 0.8 times this dimension.
     */
    dimension: number;
    /**
     * The lerp factor for the sky gradient. The sky gradient is updated every frame by lerping the current color to the target color.
     * set by the `setTopColor`, `setMiddleColor`, and `setBottomColor` methods.
     */
    lerpFactor: number;
    transitionSpan: number;
};
/**
 * Sky consists of both a large dodecahedron used to render the 3-leveled sky gradient and a {@link CanvasBox} that renders custom sky textures (
 * for a sky box) within the dodecahedron sky.
 *
 * # Example
 * ```ts
 * // Create the sky texture.
 * const sky = new VOXELIZE.Sky();
 *
 * // Load a texture and paint it to the top of the sky.
 * world.loader.addTexture(ExampleImage, (texture) => {
 *   sky.paint("top", texture);
 * })
 *
 * // Add the sky to the scene.
 * world.add(sky);
 *
 * // Update the sky per frame.
 * sky.update(camera.position);
 * ```
 *
 * ![Sky](/img/docs/sky.png)
 *
 */
export declare class Sky extends CanvasBox {
    options: CanvasBoxOptions & SkyOptions;
    /**
     * The top color of the sky gradient. Change this by calling {@link Sky.setTopColor}.
     */
    uTopColor: {
        value: Color;
    };
    /**
     * The middle color of the sky gradient. Change this by calling {@link Sky.setMiddleColor}.
     */
    uMiddleColor: {
        value: Color;
    };
    /**
     * The bottom color of the sky gradient. Change this by calling {@link Sky.setBottomColor}.
     */
    uBottomColor: {
        value: Color;
    };
    uSkyOffset: {
        value: number;
    };
    uVoidOffset: {
        value: number;
    };
    shadingData: SkyShadingCycleData[];
    /**
     * Create a new sky instance.
     *
     * @param dimension The dimension of the dodecahedron sky. The inner canvas box is 0.8 times this dimension.
     * @param lerpFactor The lerp factor for the sky gradient. The sky gradient is updated every frame by lerping the current color to the target color.
     */
    constructor(options?: Partial<SkyOptions>);
    setShadingPhases: (data: SkyShadingCycleData[]) => void;
    /**
     * Get the current top color of the sky gradient. This can be used as shader uniforms's value.
     *
     * @returns The current top color of the sky gradient.
     */
    getTopColor: () => Color;
    /**
     * Get the current middle color of the sky gradient. This can be used as shader uniforms's value. For instance,
     * this can be used to set the color of the fog in the world.
     *
     * @returns The current middle color of the sky gradient.
     */
    getMiddleColor: () => Color;
    /**
     * Get the current bottom color of the sky gradient. This can be used as shader uniforms's value.
     *
     * @returns The current bottom color of the sky gradient.
     */
    getBottomColor: () => Color;
    /**
     * Update the position of the sky box to the camera's x/z position, and lerp the sky gradient colors.
     *
     * @param position The new position to center the sky at.
     */
    update: (position: Vector3, time: number, timePerDay: number) => void;
    /**
     * Create the dodecahedron sky gradient.
     */
    private createSkyShading;
}
//# sourceMappingURL=sky.d.ts.map