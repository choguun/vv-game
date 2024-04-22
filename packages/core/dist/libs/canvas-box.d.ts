import { Color, Group, Mesh, MeshBasicMaterial, Side, Texture } from "three";
/**
 * Parameters to create a canvas box.
 */
export type CanvasBoxOptions = {
    /**
     * The gap between the layers of the box. Defaults to `0`.
     */
    gap: number;
    /**
     * The number of layers of this box. Defaults to `1`.
     */
    layers: number;
    /**
     * THe width of the box. Defaults to `1`.
     */
    width: number;
    /**
     * The height of the box. Defaults to whatever `width` is.
     */
    height?: number;
    /**
     * The depth of the box. Defaults to whatever `width` is.
     */
    depth?: number;
    /**
     * The width segments of the box, which is the number of pixels of the canvases along the width.
     * Defaults to `8`.
     */
    widthSegments: number;
    /**
     * The height segments of the box, which is the number of pixels of the canvases along the height.
     * Defaults to whatever `widthSegments` is.
     */
    heightSegments?: number;
    /**
     * The depth segments of the box, which is the number of pixels of the canvases along the depth.
     * Defaults to whatever `widthSegments` is.
     */
    depthSegments?: number;
    /**
     * The side of the box to render. Defaults to `THREE.FrontSide`.
     */
    side: Side;
    /**
     * Whether or not should this canvas box be rendered as transparent. Defaults to `false`.
     */
    transparent?: boolean;
};
/**
 * A function to programmatically draw on a canvas.
 */
export type ArtFunction = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
/**
 * The sides of a canvas box.
 *
 * `"all"` means all six sides, and `"sides"` means all the sides except the top and bottom.
 */
export type BoxSides = "back" | "front" | "top" | "bottom" | "left" | "right" | "sides" | "all";
/**
 * The six default faces of a canvas box.
 */
export declare const BOX_SIDES: BoxSides[];
/**
 * A layer of a canvas box. This is a group of six canvases that are rendered as a single mesh.
 *
 * @noInheritDoc
 */
export declare class BoxLayer extends Mesh {
    /**
     * The materials of the six faces of this box layer.
     */
    materials: Map<string, MeshBasicMaterial>;
    /**
     * The width of the box layer.
     */
    width: number;
    /**
     * The height of the box layer.
     */
    height: number;
    /**
     * The depth of the box layer.
     */
    depth: number;
    /**
     * The width segments of the box layer.
     */
    widthSegments: number;
    /**
     * The height segments of the box layer.
     */
    heightSegments: number;
    /**
     * The depth segments of the box layer.
     */
    depthSegments: number;
    /**
     * The side of the box layer to render.
     */
    private side;
    /**
     * Whether or not should this canvas box be rendered as transparent.
     */
    private transparent;
    /**
     * Create a six-sided canvas box layer.
     *
     * @param width The width of the box layer.
     * @param height The height of the box layer.
     * @param depth The depth of the box layer.
     * @param widthSegments The width segments of the box layer.
     * @param heightSegments The height segments of the box layer.
     * @param depthSegments The depth segments of the box layer.
     * @param side The side of the box layer to render.
     * @param transparent Whether or not should this canvas box be rendered as transparent.
     */
    constructor(
    /**
     * Test
     */
    width: number, height: number, depth: number, widthSegments: number, heightSegments: number, depthSegments: number, side: Side, transparent: boolean);
    /**
     * Add art to the canvas(s) of this box layer.
     
     * @param side The side(s) of the box layer to draw on.
     * @param art The art or art function to draw on the box layer's side.
     */
    paint: (side: BoxSides[] | BoxSides, art: ArtFunction | Color | Texture) => void;
    /**
     * Create a canvas material for a given side of the box layer.
     */
    private createCanvasMaterial;
    /**
     * Get the width and height of a given side of the box layer.
     */
    private getDimensionFromSide;
}
/**
 * A canvas box is a group of `BoxLayer`s that are rendered as a single mesh.
 * Each box layer is a group of six canvases that are also rendered as a single mesh.
 * You can then paint on each canvas individually by calling `box.paint()`.
 *
 * # Example
 * ```ts
 * const box = new VOXELIZE.CanvasBox();
 *
 * box.paint("all", (ctx, canvas) => {
 *   ctx.fillStyle = "red";
 *   ctx.fillRect(0, 0, canvas.width, canvas.height);
 * });
 * ```
 *
 * ![Bobby from King of the Hill](/img/docs/bobby-canvas-box.png)
 *
 * @noInheritDoc
 */
export declare class CanvasBox extends Group {
    /**
     * Parameters for creating a canvas box.
     */
    options: CanvasBoxOptions;
    /**
     * The inner layers of the canvas box.
     */
    boxLayers: BoxLayer[];
    /**
     * The width of the canvas box.
     */
    width: number;
    /**
     * The height of the canvas box.
     */
    height: number;
    /**
     * The depth of the canvas box.
     */
    depth: number;
    /**
     * Create a new canvas box.
     *
     * @param options The options for creating a canvas box.
     */
    constructor(options?: Partial<CanvasBoxOptions>);
    /**
     * Add art to the canvas(s) of this box layer.
     *
     * @param side The side(s) of the box layer to draw on.
     * @param art The art or art function to draw on the box layer's side.
     * @param layer The layer to draw on.
     */
    paint: (side: BoxSides[] | BoxSides, art: ArtFunction | Color | Texture, layer?: number) => void;
    /**
     * The first layer of the canvas box.
     */
    get boxMaterials(): Map<string, MeshBasicMaterial>;
    private makeBoxes;
}
/**
 * A preset of art functions to draw on canvas boxes.
 */
export declare const artFunctions: {
    drawCrown: ArtFunction;
    drawSun: (sunRadius?: number, sunColor?: string) => (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
    drawMoon: (moonRadius?: number, moonColor?: string, phase?: number) => (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
    drawStars: (starCount?: number, starColors?: string[]) => (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
};
//# sourceMappingURL=canvas-box.d.ts.map