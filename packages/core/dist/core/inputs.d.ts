import { EventEmitter } from "events";
/**
 * Three types of clicking for mouse input listening.
 */
export type ClickType = "left" | "middle" | "right";
/**
 * The occasion that the input should be fired.
 */
export type InputOccasion = "keydown" | "keypress" | "keyup";
/**
 * The specific options of the key to listen to.
 */
export type InputSpecifics = {
    /**
     * A special identifier to tag this input with. This is useful for removing specific
     * inputs from the input listener later on.
     */
    identifier?: string;
    /**
     * The occasion that the input should be fired. Defaults to `keydown`.
     */
    occasion?: InputOccasion;
    /**
     * The type of key to check for. Defaults to `key`.
     */
    checkType?: "key" | "code";
};
/**
 * A key and mouse binding manager for Voxelize.
 *
 * Inputs allow you to bind keys and mouse buttons to functions
 * and also gives an organized way to manage keyboard and mouse inputs using namespaces. Namespaces are used to
 * separate groups of inputs. For example, you can have a namespace for the main menu
 * and another namespace for the game. You can then bind keys and mouse buttons to functions for each namespace.
 *
 * Another use of inputs is to bind keys and mouse buttons for some built-in functionality. As of now, the following
 * requires inputs to be bound:
 * - [RigidControls.connect](/api/client/classes/RigidControls#connect): <kbd>WASD</kbd> and <kbd>Space</kbd> for movement, <kbd>Shift</kbd> for going down and <kbd>R</kbd> for sprinting.
 * - [Perspective.connect](/api/client/classes/Perspective#connect): <kbd>C</kbd> for switching between perspectives.
 *
 * You can change the above bindings by calling {@link Inputs.remap} with the corresponding input identifiers, namely
 * `RigidControls.INPUT_IDENTIFIER` and `Perspectives.INPUT_IDENTIFIER`.
 *
 * ## Example
 * ```typescript
 * // Create a new inputs manager.
 * const inputs = new VOXELIZE.Inputs();
 *
 * // Bind the space bar to a function.
 * inputs.bind(" ", (event) => {
 *   console.log("Space bar pressed!", event);
 * });
 *
 * // Bind rigid controls to the inputs manager.
 * rigidControls.connect(inputs);
 * ```
 *
 * @noInheritDoc
 * @param T The list of input namespaces. For instance, `T` could be "menu" and "game".
 * @category Core
 */
export declare class Inputs<T extends string = any> extends EventEmitter {
    /**
     * The namespace that the Voxelize inputs is in. Use `setNamespace` to
     * set the namespace to something else.
     */
    namespace: T | "*";
    /**
     * A map for click callbacks.
     */
    private clickCallbacks;
    /**
     * A map for scroll callbacks.
     */
    private scrollCallbacks;
    /**
     * A map for keydown callbacks.
     */
    private keyDownCallbacks;
    /**
     * A map for keyup callbacks.
     */
    private keyUpCallbacks;
    /**
     * A map for key press callbacks.
     */
    private keyPressCallbacks;
    /**
     * A map for key binds.
     */
    private keyBounds;
    /**
     * A list of functions to unbind all inputs.
     */
    private unbinds;
    /**
     * Listen to an event emitted by the input instance. The following events are emitted:
     * - `namespace`: Emitted when the namespace is changed.
     *
     * @param event An event to listen on.
     * @param listener A listener to call when the event is emitted.
     * @returns The input instance for chaining.
     */
    on(event: "namespace", listener: (namespace: string) => void): this;
    /**
     * Construct a Voxelize inputs instance.
     */
    constructor();
    /**
     * Add a mouse click event listener.
     *
     * @param type The type of click to listen for. Either "left", "middle" or "right".
     * @param callback The callback to call when the click is fired, passing the MouseEvent.
     * @param namespace The namespace to bind the click to. Defaults to "*", which means that the click will be fired regardless of the namespace.
     * @returns A function to unbind the click.
     */
    click: (type: ClickType, callback: (event: MouseEvent) => void, namespace?: T | "*") => () => boolean;
    /**
     * Add a scroll event listener.
     *
     * @param up The callback to call when the scroll wheel is scrolled up.
     * @param down The callback to call when the scroll wheel is scrolled down.
     * @param namespace The namespace to bind the scroll to. Defaults to "*", which means that the scroll will be fired regardless of the namespace.
     * @returns A function to unbind the scroll.
     */
    scroll: (up: (delta?: number) => void, down: (delta?: number) => void, namespace?: T | "*") => () => boolean;
    /**
     * Bind a keyboard key to a callback.
     *
     * @param key The key to listen for. This checks the `event.key` or the `event.code` property.
     * @param callback The callback to call when the key is pressed.
     * @param namespace The namespace to bind the key to. Defaults to "*", which means that the key will be fired regardless of the namespace.
     * @param specifics The specific options of the key to listen for.
     * @returns A function to unbind the key.
     */
    bind: (key: string, callback: (event: KeyboardEvent) => void, namespace?: T | "*", specifics?: InputSpecifics) => () => void;
    /**
     * Unbind a keyboard key.
     *
     * @param key The key to unbind.
     * @param specifics The specifics of the key to unbind.
     * @returns Whether or not if the unbinding was successful.
     */
    unbind: (key: string, specifics?: InputSpecifics) => boolean;
    /**
     * Swap two keys with each other.
     *
     * @param keyA The first key to swap.
     * @param keyB The second key to swap.
     * @param specifics The specifics of the keys to swap.
     */
    swap: (keyA: string, keyB: string, specifics?: {
        occasion?: InputOccasion;
        identifier?: string;
    }) => void;
    /**
     * Remap a key to another key.
     *
     * @param oldKey The old key to replace.
     * @param newKey The new key to replace the old key with.
     * @param specifics The specifics of the keys to replace.
     */
    remap: (oldKey: string, newKey: string, specifics?: {
        occasion?: InputOccasion;
        identifier?: string;
    }) => void;
    /**
     * Set the namespace of the input instance. This emits a "namespace" event.
     *
     * @param namespace The new namespace to set.
     */
    setNamespace: (namespace: T) => void;
    /**
     * Reset all keyboard keys by unbinding all keys.
     */
    reset: () => void;
    /**
     * Make everything lower case.
     */
    private modifyKey;
    /**
     * Initialize the keyboard input listeners.
     */
    private initializeKeyListeners;
    /**
     * Initialize the mouse input listeners.
     */
    private initializeClickListeners;
    /**
     * Initialize the mouse scroll listeners.
     */
    private initializeScrollListeners;
}
//# sourceMappingURL=inputs.d.ts.map