/**
 * This module is used to separate plain text into colored text objects to be further rendered.
 *
 * # Example
 * ```ts
 * const text = "$green$Hello, world!$yellow$The rest is yellow.";
 *
 * // Change the default splitter.
 * ColorText.SPLITTER = "$";
 *
 * // Parse the text into colored text objects.
 * const splitted = ColorText.split(text);
 *
 * // Expected:
 * // [
 * //   {
 * //     text: "Hello, world!",
 * //     color: "green"
 * //   },
 * //   {
 * //     text: "The rest is yellow.",
 * //     color: "yellow"
 * //   },
 * // ]
 * ```
 *
 * ![ColorText](/img/docs/colortext.png)
 *
 * @category Effects
 */
export declare class ColorText {
    /**
     * The symbol used to separate a text into a colored text object array.
     */
    static SPLITTER: string;
    /**
     * Split a text into a colored text object array by {@link ColorText.SPLITTER}.
     *
     * @param text The text to split.
     * @param defaultColor The default color to apply to the text.
     * @returns An array of colored text objects.
     */
    static split(text: string, defaultColor?: string): {
        color: string;
        text: string;
    }[];
}
//# sourceMappingURL=color-text.d.ts.map