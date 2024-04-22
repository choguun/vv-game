import { Group } from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
/**
 * Parameters to create a {@link Debug} instance.
 */
export type DebugOptions = {
    /**
     * Whether or not should [stats.js](https://github.com/mrdoob/stats.js/) be enabled. Defaults to `true`.
     */
    stats: boolean;
    /**
     * Whether or not should the debug panel be displayed by default when the page loads. Defaults to `true`.
     * You can toggle the debug panel by calling {@link Debug.toggle}.
     */
    onByDefault: boolean;
    /**
     * Styles to apply to the wrapper of all debug entries.
     */
    entryStyles: Partial<CSSStyleDeclaration>;
    /**
     * A class to add to the wrapper of all debug entries.
     */
    entriesClass: string;
    /**
     * Styles to apply to each of the debug entry line (top left).
     */
    lineStyles: Partial<CSSStyleDeclaration>;
    /**
     * A class to add to each of the debug entry line (top left).
     */
    lineClass: string;
    /**
     * Styles to apply to the wrapper of the top-left debug panel.
     */
    dataStyles: Partial<CSSStyleDeclaration>;
    /**
     * A class to add to the wrapper of the top-left debug panel.
     */
    dataClass: string;
    /**
     * Whether or not should `Voxelize x.x.x` be displayed in the top-left debug panel. Defaults to `true`.
     */
    showVoxelize: boolean;
    asyncPeriod: number;
};
/**
 * A class for general debugging purposes in Voxelize, including FPS, value tracking, and real-time value testing.
 *
 * # Example
 * ```ts
 * const debug = new VOXELIZE.Debug();
 *
 * // Track the voxel property of `controls`.
 * debug.registerDisplay("Position", controls, "voxel");
 *
 * // Add a function to track sunlight dynamically.
 * debug.registerDisplay("Sunlight", () => {
 *   return world.getSunlightByVoxel(...controls.voxel);
 * });
 *
 * // In the game loop, trigger debug updates.
 * debug.update();
 * ```
 *
 * ![Debug](/img/docs/debug.png)
 *
 * @noInheritDoc
 */
export declare class Debug extends Group {
    /**
     * Parameters to create a {@link Debug} instance.
     */
    options: DebugOptions;
    /**
     * The stats.js instance, situated in the top-left corner after the data entries.
     */
    stats?: Stats;
    /**
     * The HTML element that wraps all the debug entries and stats.js instance, located
     * on the top-left by default.
     */
    dataWrapper: HTMLDivElement;
    /**
     * A HTML element wrapping all registered debug entries.
     */
    entriesWrapper: HTMLDivElement;
    /**
     * The DOM element to append the debug panel to. Defaults to `document.body`.
     */
    domElement: HTMLElement;
    /**
     * Data entries to track individual values.
     */
    private dataEntries;
    /**
     * Create a new {@link Debug} instance.
     *
     * @param domElement The DOM element to append the debug panel to.
     * @param options Parameters to create a {@link Debug} instance.
     */
    constructor(domElement?: HTMLElement, options?: Partial<DebugOptions>);
    /**
     * Register a new object attribute to track. Needs to call {@link Debug.update} in the game loop
     * to update the value.
     *
     * @param title The title of the debug entry.
     * @param object The object to track.
     * @param attribute The attribute of the object to track.
     * @param formatter A function to format the value of the attribute.
     * @returns The debug instance for chaining.
     */
    registerDisplay: <T = any>(title: string, object?: T, attribute?: keyof T, formatter?: (str: string) => string) => this;
    /**
     * Remove a registered object attribute from tracking.
     *
     * @param title The title of the debug entry.
     */
    removeDisplay: (title: string) => void;
    /**
     * Add a static title to the debug entries for grouping.
     *
     * @param title A title to display.
     * @returns The debug instance for chaining.
     */
    displayTitle: (title: string) => this;
    /**
     * Add an empty line to the debug entries for spacing.
     *
     * @returns The debug instance for chaining.
     */
    displayNewline: () => this;
    /**
     * Toggle the debug instance on/off.
     *
     * @param force Whether or not to force the debug panel to be shown/hidden.
     */
    toggle: (force?: any) => void;
    /**
     * Update the debug entries with the latest values. This should be called in the game loop.
     * Utilizes requestAnimationFrame to reduce lag spikes by not overloading the main thread.
     */
    update: () => void;
    /**
     * Make a new data entry element.
     */
    private makeDataEntry;
    /**
     * Prepare the debug panel to be mounted.
     */
    private makeDOM;
    /**
     * Final setup of the debug panel.
     */
    private setup;
    /**
     * Mount the debug panel to the DOM.
     */
    private mount;
}
//# sourceMappingURL=debug.d.ts.map