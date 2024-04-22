import { RigidControls } from "../core/controls";
import { Inputs } from "../core/inputs";
import { World } from "../core/world";
/**
 * Parameters to create a new {@link Perspective} instance.
 */
export type PerspectiveOptions = {
    /**
     * The maximum distance the camera can go from the player's center.
     * Defaults to `5`.
     */
    maxDistance: number;
    /**
     * The margin between the camera and any block that the camera is colliding with.
     * This prevents the camera from clipping into blocks. Defaults to `0.3`.
     */
    blockMargin: number;
    /**
     * The lerping factor for the camera's position. Defaults to `0.5`.
     */
    lerpFactor: number;
    /**
     * Whether or not should the camera ignore see-through block collisions. Defaults to `true`.
     */
    ignoreSeeThrough: boolean;
    /**
     * Whether or not should the camera ignore fluid block collisions. Defaults to `true`.
     */
    ignoreFluids: boolean;
};
/**
 * A class that allows you to switch between first, second and third person perspectives for
 * a {@link RigidControls} instance. By default, the key to switch between perspectives is <kbd>C</kbd>.
 *
 * # Example
 * ```ts
 * // Initialize the perspective with the rigid controls.
 * const perspective = new VOXELIZE.Perspective(controls, world);
 *
 * // Bind the keyboard inputs to switch between perspectives.
 * perspective.connect(inputs, "in-game");
 *
 * // Switch to the first person perspective.
 * perspective.state = "third";
 *
 * // Update the perspective every frame.
 * perspective.update();
 * ```
 */
export declare class Perspective {
    /**
     * Parameters to configure the perspective.
     */
    options: PerspectiveOptions;
    /**
     * The rigid controls that this perspective instance is attached to.
     */
    controls: RigidControls;
    /**
     * The world that this perspective instance is working with.
     */
    world: World;
    /**
     * The input manager that binds the perspective's keyboard inputs.
     */
    inputs?: Inputs<any>;
    /**
     * The internal state of the perspective.
     */
    private _state;
    /**
     * A cache to save the first person camera position.
     */
    private firstPersonPosition;
    /**
     * This is the identifier that is used to bind the perspective's keyboard inputs
     * when {@link Perspective.connect} is called.
     */
    static readonly INPUT_IDENTIFIER = "voxelize-perspective";
    /**
     * Create a new perspective instance that is attached to the given rigid controls. The default
     * perspective is the first person perspective.
     *
     * @param controls The rigid controls that this perspective instance is attached to.
     * @param world The world that this perspective instance is working with.
     * @param options Parameters to configure the perspective.
     */
    constructor(controls: RigidControls, world: World, options?: Partial<PerspectiveOptions>);
    /**
     * A method that can be implemented and is called when the perspective's state changes.
     */
    onChangeState: (state: "first" | "second" | "third") => void;
    /**
     * Connect the perspective to the given input manager. This will bind the perspective's keyboard inputs, which
     * by default is <kbd>C</kbd> to switch between perspectives. This function returns a function that when called
     * unbinds the perspective's keyboard inputs. Keep in mind that remapping the original inputs will render this
     * function useless.
     *
     * @param inputs The {@link Inputs} instance to bind the perspective's keyboard inputs to.
     * @param namespace The namespace to bind the perspective's keyboard inputs to.
     */
    connect: (inputs: Inputs, namespace?: string) => () => void;
    /**
     * Toggle between the first, second and third person perspectives. The order goes from first person to
     * third person and then to second person.
     */
    toggle: () => void;
    /**
     * This updates the perspective. Internally, if the perspective isn't in first person, it raycasts to find the closest
     * block and then ensures that the camera is not clipping into any blocks.
     */
    update: () => void;
    /**
     * Setter for the perspective's state. This will call {@link Perspective.onChangeState} if it is implemented.
     */
    set state(state: "first" | "second" | "third");
    /**
     * Getter for the perspective's state.
     */
    get state(): "first" | "second" | "third";
}
//# sourceMappingURL=perspective.d.ts.map