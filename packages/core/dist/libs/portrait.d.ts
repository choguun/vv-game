import { Object3D, OrthographicCamera, Scene, WebGLRenderer } from "three";
import { CameraPerspective } from "../common";
/**
 * Parameters to create a portrait with.
 */
export type PortraitOptions = {
    /**
     * The arbitrary zoom from the camera to the object. This is used to calculate the zoom
     * of the camera. Defaults to `1`.
     */
    zoom: number;
    /**
     * The position of where the camera should be looking at. Defaults to `pxyz`, which
     * means that the camera will be looking at the center of the object from the positive
     * x, y, and z axis scaled by the zoom.
     */
    perspective: CameraPerspective;
    /**
     * The width of the portrait canvas. Defaults to `100` pixels.
     */
    width: number;
    /**
     * The height of the portrait canvas. Defaults to `100` pixels.
     */
    height: number;
    /**
     * Whether or not should this portrait only render once. Defaults to `false`.
     */
    renderOnce: boolean;
    /**
     * The rotation around the y axis about the camera. This is used to calculate the
     * position of the light. Defaults to `-Math.PI / 8`.
     */
    lightRotationOffset: number;
};
/**
 * This class allows you to render a single THREE.js object to a canvas element.
 * This is useful for generating images of objects for use in the game. However, there
 * are performance bottlenecks that you should be aware of:
 * - The THREE.js renderer is shared between all instances of this class. This is because
 *   there is a limit to how many webgl contexts can be created.
 * - Each individual portrait has their own render loop. This means that if you have a lto
 *   of portraits, you will be rendering a lot of frames per second. This can be mitigated
 *   by either using the renderOnce parameter or utilizing the {@link ItemSlots} class, which
 *   batch renders objects in a grid-like fashion.
 *
 * # Example
 * ```ts
 * const portrait = new Portrait(world.makeBlockMesh(5));
 * document.body.appendChild(portrait.canvas);
 * ```
 */
export declare class Portrait {
    /**
     * The shared THREE.js webgl renderer. This is shared because there is a limit to
     * how many webgl contexts can be created.
     */
    static renderer: WebGLRenderer;
    /**
     * Parameters to create this portrait with.
     */
    options: PortraitOptions;
    /**
     * The THREE.js camera to use for rendering this portrait.
     */
    camera: OrthographicCamera;
    /**
     * The THREE.js scene to use for rendering this portrait.
     */
    scene: Scene;
    /**
     * The canvas element to render this portrait to.
     */
    canvas: HTMLCanvasElement;
    /**
     * The target of this portrait.
     */
    object: Object3D;
    /**
     * The animation frame id of the render loop.
     */
    private animationFrameId;
    /**
     * Create a new portrait. This automatically starts a render loop.
     *
     * @param object The object to render to the canvas.
     * @param options The options to create this portrait with.
     */
    constructor(object: Object3D, options?: Partial<PortraitOptions>);
    /**
     * Set the object to render to the canvas.
     *
     * @param object The object to render to the canvas.
     */
    setObject: (object: Object3D) => void;
    /**
     * Dispose of this portrait. This stops the render loop and removes the object from the scene.
     * However, it does not remove the canvas from the DOM.
     */
    dispose: () => void;
    /**
     * The render loop that is fired off when this portrait is created.
     */
    private render;
}
//# sourceMappingURL=portrait.d.ts.map