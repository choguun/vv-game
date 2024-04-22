/**
 * A utility class for doing DOM manipulation.
 *
 * @category Utils
 */
export declare class DOMUtils {
    /**
     * Apply styles directly onto DOM element(s).
     *
     * @param ele The element(s) to add styles to.
     * @param style The style(s) to add.
     * @returns The element(s) with the added styles.
     */
    static applyStyles: (ele: HTMLElement | HTMLElement[] | undefined, style: Partial<CSSStyleDeclaration>) => HTMLElement | HTMLElement[];
    /**
     * Create a CSS color string from numbers.
     *
     * @param r Red channel
     * @param g Green channel
     * @param b Blue channel
     * @param a Alpha channel
     * @returns A CSS color string
     */
    static rgba: (r: number, g: number, b: number, a: number) => string;
    private constructor();
}
//# sourceMappingURL=dom-utils.d.ts.map