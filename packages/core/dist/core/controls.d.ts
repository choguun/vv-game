import { EventEmitter } from "events";
import { RigidBody } from "@voxelize/physics-engine";
import { MessageProtocol } from "@voxelize/transport/src/types";
import { Group, PerspectiveCamera, Vector3 } from "three";
import { Character, Hud } from "../libs";
import { Coords3 } from "../types";
import { Inputs } from "./inputs";
import { NetIntercept } from "./network";
import { World } from "./world";
/**
 * The state of which a Voxelize {@link Controls} is in.
 */
export type RigidControlState = {
    /**
     * In radians, the heading y-rotation of the client. Defaults to `0`.
     */
    heading: number;
    /**
     * Whether if the client is running. Defaults to `false`.
     */
    running: boolean;
    /**
     * Whether if the client is attempting to jump, if the jump key is pressed. Defaults to `false`.
     */
    jumping: boolean;
    /**
     * Whether if the client is attempting to sprint, if the sprint key is pressed. Defaults to `false`.
     */
    sprinting: boolean;
    /**
     * Whether if the client is attempting to crouch, if the crouch key is pressed. Defaults to `false`.
     */
    crouching: boolean;
    /**
     * How many times has the client jumped. Defaults to `0`.
     */
    jumpCount: number;
    /**
     * Whether or not is the client jumping, in the air. Defaults to `false`.
     */
    isJumping: boolean;
    /**
     * The current amount of time spent in the air from jump. Defaults to `0`.
     */
    currentJumpTime: number;
};
/**
 * Parameters to initialize the Voxelize {@link Controls}.
 */
export type RigidControlsOptions = {
    /**
     * The mouse sensitivity. Defaults to `100`.
     */
    sensitivity: number;
    /**
     * Minimum polar angle that camera can look down to. Defaults to `Math.PI * 0.01`.
     */
    minPolarAngle: number;
    /**
     * Maximum polar angle that camera can look up to. Defaults to `Math.PI * 0.99`
     */
    maxPolarAngle: number;
    /**
     * Initial position of the client. Defaults to `(0, 80, 10)`.
     */
    initialPosition: Coords3;
    initialDirection: Coords3;
    /**
     * The interpolation factor of the client's rotation. Defaults to `0.9`.
     */
    rotationLerp: number;
    /**
     * The force upwards when a client tries to jump in water. Defaults to `0.3`.
     */
    fluidPushForce: number;
    /**
     * The interpolation factor of the client's position. Defaults to `1.0`.
     */
    positionLerp: number;
    /**
     * The interpolation factor when the client is auto-stepping. Defaults to `0.6`.
     */
    stepLerp: number;
    /**
     * The width of the client's avatar. Defaults to `0.8` blocks.
     */
    bodyWidth: number;
    /**
     * The height of the client's avatar. Defaults to `1.55` blocks.
     */
    bodyHeight: number;
    /**
     * The depth of the client's avatar. Defaults to `0.8` blocks.
     */
    bodyDepth: number;
    /**
     * The ratio to `bodyHeight` at which the camera is placed from the ground. Defaults at `0.9193548387096774`.
     */
    eyeHeight: number;
    /**
     * The maximum level of speed of a client. Default is `6` .
     */
    maxSpeed: number;
    /**
     * The level of force of which the client can move at. Default is `30`.
     */
    moveForce: number;
    /**
     * The level of responsiveness of a client to movements. Default is `240`.
     */
    responsiveness: number;
    /**
     * Default running friction of a client. Defaults to `0.1`.
     */
    runningFriction: number;
    /**
     * Default standing friction of a client. Defaults to `4`.
     */
    standingFriction: number;
    /**
     * The level of speed at which a client flies at. Defaults to `40`.
     */
    flySpeed: number;
    /**
     * The level of force at which a client flies at. Defaults to `80`.
     */
    flyForce: number;
    /**
     * The level impulse of which a client flies at. Defaults to `2.5`.
     */
    flyImpulse: number;
    /**
     * The inertia of a client when they're flying. Defaults to `6`.
     */
    flyInertia: number;
    /**
     * The factor to the movement speed when sprint is applied. Defaults to `1.4`.
     */
    sprintFactor: number;
    /**
     * The factor to the movement speed when crouch is applied. Defaults to `0.6`.
     */
    crouchFactor: number;
    /**
     * Sprint factor would be on always. Defaults to `false`.
     */
    alwaysSprint: boolean;
    /**
     * The factor applied to the movements of the client in air, such as while half-jump. Defaults to `0.7`.
     */
    airMoveMult: number;
    /**
     * The level of impulse at which the client jumps upwards. Defaults to `8`.
     */
    jumpImpulse: number;
    /**
     * The level of force applied to the client when jumping. Defaults to `1`.
     */
    jumpForce: number;
    /**
     * The time, in milliseconds, that a client can be jumping. Defaults to `50`ms.
     */
    jumpTime: number;
    /**
     * How many times can a client jump in the air. Defaults to `0`.
     */
    airJumps: number;
    /**
     * How tall a client can step up. Defaults to `0.5`.
     */
    stepHeight: number;
};
/**
 * Inspired by THREE.JS's PointerLockControls, a rigid body based first person controls.
 *
 * ## Example
 * ```ts
 * // Create the controls.
 * const controls = new RigidControls(
 *   camera,
 *   renderer.domElement,
 *   world
 * );
 *
 * // Printing the voxel that the client is in.
 * console.log(controls.voxel);
 *
 * // Call the controls update function in the render loop.
 * controls.update();
 * ```
 *
 * @noInheritDoc
 * @category Core
 */
export declare class RigidControls extends EventEmitter implements NetIntercept {
    /**
     * Parameters to initialize the Voxelize controls.
     */
    options: RigidControlsOptions;
    /**
     * Reference linking to the Voxelize camera instance.
     */
    camera: PerspectiveCamera;
    /**
     * Reference linking to the Voxelize {@link Inputs} instance. You can link an inputs manager by calling
     * {@link RigidControls.connect}, which registers the keyboard inputs for the controls.
     */
    inputs?: Inputs;
    /**
     * Reference linking to the Voxelize world instance.
     */
    world: World;
    /**
     * A potential link to a {@link Character} instance. This can be added by
     * calling {@link RigidControls.attachCharacter} to add a mesh for 2nd and 3rd person
     * view.
     */
    character?: Character;
    /**
     * A potential link to a {@link Hud} instance. This can be added by
     * calling {@link RigidControls.attachHud} to add a mesh for the first person
     * view.
     */
    hud?: Hud;
    /**
     * The DOM element that pointerlock controls are applied to.
     */
    domElement: HTMLElement;
    /**
     * A THREE.JS object, parent to the camera for pointerlock controls.
     */
    object: Group<import("three").Object3DEventMap>;
    /**
     * The state of the control, indicating things like whether or not the client is running.
     */
    state: RigidControlState;
    /**
     * Flag indicating whether pointerlock controls have control over the cursor.
     */
    isLocked: boolean;
    /**
     * The physical rigid body of the client, dimensions described by:
     * - `options.bodyWidth`
     * - `options.bodyHeight`
     * - `options.bodyDepth`
     */
    body: RigidBody;
    /**
     * Whether or not the client has certain movement potentials. For example, if the forward
     * key is pressed, then "front" would be `true`. Vice versa for "back".
     */
    movements: {
        up: boolean;
        down: boolean;
        left: boolean;
        right: boolean;
        front: boolean;
        back: boolean;
        sprint: boolean;
    };
    /**
     * The callback to locking the pointer.
     */
    private lockCallback;
    /**
     * The callback to unlocking the pointer.
     */
    private unlockCallback;
    /**
     * An internal euler for sharing rotation calculations.
     */
    private euler;
    /**
     * An internal quaternion for sharing position calculations.
     */
    private quaternion;
    /**
     * An internal vector for sharing position calculations.
     */
    private vector;
    /**
     * The new position of the controls. This is used to lerp the position of the controls.
     */
    private newPosition;
    /**
     * Whether or not is the first movement back on lock. This is because Chrome has a bug where
     * movementX and movementY becomes 60+ on the first movement back.
     */
    private justUnlocked;
    /**
     * An internal clock instance for calculating delta time.
     */
    private clock;
    /**
     * This is the identifier that is used to bind the rigid controls' keyboard inputs
     * when {@link RigidControls.connect} is called.
     */
    static readonly INPUT_IDENTIFIER = "voxelize-rigid-controls";
    /**
     * Construct a Voxelize rigid body based first person controls. This adds a rigid body
     * to the world's physics engine, and applies movement to the camera.
     *
     * @param camera The camera to apply the controls to.
     * @param domElement The DOM element to apply the controls to.
     * @param world The world to apply the controls to.
     * @param options The options to initialize the controls with.
     */
    constructor(camera: PerspectiveCamera, domElement: HTMLElement, world: World, options?: Partial<RigidControlsOptions>);
    onMessage: (message: MessageProtocol<any, any, any, [number, number, number]>) => void;
    /**
     * An event handler for when the pointerlock is locked/unlocked.
     * The events supported so far are:
     * - `lock`: When the pointerlock is locked.
     * - `unlock`: When the pointerlock is unlocked.
     *
     * @param event The event name, either `lock` or `unlock`.
     * @param listener The listener to call when the event is emitted.
     * @returns The controls instance for chaining.
     */
    on(event: "lock" | "unlock", listener: () => void): this;
    /**
     * Update for the camera of the game. This should be called in the game update loop.
     * What this does is that it updates the rigid body, and then interpolates the camera's position and rotation
     * to the new position and rotation. If a character is attached, then the character is also updated.
     * If the hud is attached, then the hud is also updated.
     */
    update: () => void;
    /**
     * Sets up all event listeners for controls, including:
     * - Mouse move event
     * - Pointer-lock events
     * - Canvas click event
     * - Key up/down events
     * - Control lock/unlock events
     *
     * This function returns a function that can be called to disconnect the controls.
     * Keep in mind that if {@link Inputs.remap} is used to remap any controls, they will
     * not be unbound when the returned function is called.
     *
     * @options inputs {@link Inputs} instance to bind the controls to.
     * @options namespace The namespace to bind the controls to.
     */
    connect: (inputs: Inputs, namespace?: string) => () => void;
    /**
     * Get the direction that the client is looking at.
     */
    getDirection: () => Vector3;
    /**
     * Lock the cursor to the game, calling `requestPointerLock` on the dom element.
     * Needs to be called within a DOM event listener callback!
     *
     * @param callback - Callback to be run once done.
     */
    lock: (callback?: () => void) => void;
    /**
     * Unlock the cursor from the game, calling `exitPointerLock` on the HTML document.
     * Needs to be called within a DOM event listener callback!
     *
     * @param callback - Callback to be run once done.
     */
    unlock: (callback?: () => void) => void;
    /**
     * Teleport this rigid controls to a new voxel coordinate.
     *
     * @param vx The x voxel coordinate to teleport to.
     * @param vy The y voxel coordinate to teleport to.
     * @param vz The z voxel coordinate to teleport to.
     */
    teleport: (vx: number, vy: number, vz: number) => void;
    /**
     * Teleport the rigid controls to the top of this voxel column.
     */
    teleportToTop: (vx?: number, vz?: number) => void;
    /**
     * Make the client look at a coordinate.
     *
     * @param x X-coordinate to look at.
     * @param y Y-coordinate to look at.
     * @param z Z-coordinate to look at.
     */
    lookAt: (x: number, y: number, z: number) => void;
    /**
     * Reset all of the control's movements.
     */
    resetMovements: () => void;
    /**
     * Toggle ghost mode. Ghost mode is when a client can fly through blocks.
     */
    toggleGhostMode: () => void;
    /**
     * Toggle fly mode. Fly mode is like ghost mode, but the client can't fly through blocks.
     */
    toggleFly: () => void;
    /**
     * Reset the controls instance. This will reset the camera's position and rotation, and reset all movements.
     */
    reset: () => void;
    /**
     * Move the client forward/backward by a certain distance.
     *
     * @param distance - Distance to move forward by.
     */
    moveForward: (distance: number) => void;
    /**
     * Move the client left/right by a certain distance.
     *
     * @param distance - Distance to move left/right by.
     */
    moveRight: (distance: number) => void;
    /**
     * Attach a {@link Character} to this controls instance. This can be seen in 2nd/3rd person mode.
     *
     * @param character The {@link Character} to attach to this controls instance.
     * @param newLerpFactor The new lerp factor to use for the character.
     */
    attachCharacter: (character: Character, newLerpFactor?: number) => void;
    /**
     * Attach a {@link Hud} to this controls instance. This can be seen in 1st person mode.
     *
     * @param hud The {@link Hud} to attach to this controls instance.
     */
    attachHud: (hud: Hud) => void;
    /**
     * Whether if the client is in ghost mode. Ghost mode means client can fly through blocks.
     */
    get ghostMode(): boolean;
    /**
     * Whether if the client is in fly mode. Fly mode means client can fly but not through blocks.
     */
    get flyMode(): boolean;
    /**
     * The voxel coordinates that the client is at. This is where the bottom of the client's body is located,
     * floored to the voxel coordinate.
     */
    get voxel(): Coords3;
    /**
     * The 3D world coordinates that the client is at. This is where the bottom of the client's body is located.
     */
    get position(): Vector3;
    /**
     * The chunk that the client is situated in.
     */
    get chunk(): import("../types").Coords2;
    /**
     * Move the client's rigid body according to the current movement state.
     */
    private moveRigidBody;
    /**
     * Update the rigid body by the physics engine.
     */
    private updateRigidBody;
    /**
     * The mouse move handler. This is active when the pointer is locked.
     */
    private onMouseMove;
    /**
     * When the pointer change event is fired, this will be called.
     */
    private onPointerlockChange;
    /**
     * This happens when you try to lock the pointer too recently.
     */
    private onPointerlockError;
    /**
     * Locks the pointer.
     */
    private onDocumentClick;
    /**
     * When the pointer is locked, this will be called.
     */
    private onLock;
    /**
     * When the pointer is unlocked, this will be called.
     */
    private onUnlock;
}
//# sourceMappingURL=controls.d.ts.map