/**
 * A utility class for extracting and inserting light data from and into numbers.
 *
 * The light data is stored in the following format:
 * - Sunlight: `0xff000000`
 * - Red light: `0x00ff0000`
 * - Green light: `0x0000ff00`
 * - Blue light: `0x000000ff`
 *
 * TODO-DOCS
 * For more information about lighting data, see [here](/)
 *
 * # Example
 * ```ts
 * // Insert a level 13 sunlight into zero.
 * const number = LightUtils.insertSunlight(0, 13);
 * ```
 *
 * @category Utils
 */
export declare class LightUtils {
    /**
     * Extract the sunlight level from a number.
     *
     * @param light The light value to extract from.
     * @returns The extracted sunlight value.
     */
    static extractSunlight: (light: number) => number;
    /**
     * Insert a sunlight level into a number.
     *
     * @param light The light value to insert the level into.
     * @param level The sunlight level to insert.
     * @returns The inserted light value.
     */
    static insertSunlight: (light: number, level: number) => number;
    /**
     * Extract the red light level from a number.
     *
     * @param light The light value to extract from.
     * @returns The extracted red light value.
     */
    static extractRedLight: (light: number) => number;
    /**
     * Insert a red light level into a number.
     *
     * @param light The light value to insert the level into.
     * @param level The red light level to insert.
     * @returns The inserted light value.
     */
    static insertRedLight: (light: number, level: number) => number;
    /**
     * Extract the green light level from a number.
     *
     * @param light The light value to extract from.
     * @returns The extracted green light value.
     */
    static extractGreenLight: (light: number) => number;
    /**
     * Insert a green light level into a number.
     *
     * @param light The light value to insert the level into.
     * @param level The green light level to insert.
     * @returns The inserted light value.
     */
    static insertGreenLight: (light: number, level: number) => number;
    /**
     * Extract the blue light level from a number.
     *
     * @param light The light value to extract from.
     * @returns The extracted blue light value.
     */
    static extractBlueLight: (light: number) => number;
    /**
     * Insert a blue light level into a number.
     *
     * @param light The light value to insert the level into.
     * @param level The blue light level to insert.
     * @returns The inserted light value.
     */
    static insertBlueLight: (light: number, level: number) => number;
    /**
     * Check to see if light can go "into" one block, disregarding the source.
     *
     * @param target The target block's transparency.
     * @param dx The change in x direction.
     * @param dy The change in y direction.
     * @param dz The change in z direction.
     * @returns Whether light can enter into the target block.
     */
    static canEnterInto: (target: boolean[], dx: number, dy: number, dz: number) => boolean;
    /**
     * Check to see if light can enter from one block to another.
     *
     * @param source The source block's transparency.
     * @param target The target block's transparency.
     * @param dx The change in x direction.
     * @param dy The change in y direction.
     * @param dz The change in z direction.
     * @returns Whether light can enter from the source block to the target block.
     */
    static canEnter: (source: boolean[], target: boolean[], dx: number, dy: number, dz: number) => boolean;
    private constructor();
}
/**
 * The string representation of red light.
 */
export declare const RED_LIGHT = "RED";
/**
 * The string representation of green light.
 */
export declare const GREEN_LIGHT = "GREEN";
/**
 * The string representation of blue light.
 */
export declare const BLUE_LIGHT = "BLUE";
/**
 * The string representation of sunlight.
 */
export declare const SUNLIGHT = "SUNLIGHT";
/**
 * Sunlight or the color of torch light.
 */
export type LightColor = "RED" | "GREEN" | "BLUE" | "SUNLIGHT";
//# sourceMappingURL=light-utils.d.ts.map