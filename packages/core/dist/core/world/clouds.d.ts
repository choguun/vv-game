import { Color, Group, Mesh, ShaderMaterial, Vector3 } from "three";
import { Coords2, Coords3 } from "../../types";
/**
 * Parameters used to create a new {@link Clouds} instance.
 */
export type CloudsOptions = {
    /**
     * The scale of the noise used to generate the clouds. Defaults to `0.08`.
     */
    noiseScale: number;
    /**
     * The horizontal count of how many cloud blocks are in a cloud cell. Defaults to `8`.
     */
    width: number;
    /**
     * The vertical count of how many cloud blocks are in a cloud cell. This is also
     * used to determine the overall count of cloud blocks of all the clouds. Defaults to `3`.
     */
    height: number;
    /**
     * The y-height at which the clouds are generated. Defaults to `256`.
     */
    cloudHeight: number;
    /**
     * The dimension of each cloud block. Defaults to `[20, 20, 20]`.
     */
    dimensions: Coords3;
    /**
     * The threshold at which noise values are considered to be "cloudy" and should generate a new
     * cloud block. Defaults to `0.05`.
     */
    threshold: number;
    /**
     * The lerp factor used to translate cloud blocks from their original position to their
     * new position. Defaults to `0.3`.
     */
    lerpFactor: number;
    /**
     * The speed at which the clouds move. Defaults to `8`.
     */
    speedFactor: number;
    /**
     * The color of the clouds. Defaults to `#fff`.
     */
    color: string;
    /**
     * The opacity of the clouds. Defaults to `0.8`.
     */
    alpha: number;
    /**
     * The seed used to generate the clouds. Defaults to `-1`.
     */
    seed: number;
    /**
     * The number of cloud cells to generate, `count` * `count`. Defaults to `16`.
     */
    count: number;
    /**
     * The number of octaves used to generate the noise. Defaults to `5`.
     */
    octaves: number;
    /**
     * The noise falloff factor used to generate the clouds. Defaults to `0.9`.
     */
    falloff: number;
    /**
     * An object that is used as the uniform for the clouds fog near shader.
     */
    uFogNear?: {
        value: number;
    };
    /**
     * An object that is used as the uniform for the clouds fog far shader.
     */
    uFogFar?: {
        value: number;
    };
    /**
     * An object that is used as the uniform for the clouds fog color shader.
     */
    uFogColor?: {
        value: Color;
    };
};
/**
 * A class that generates and manages clouds. Clouds are essentially a 2D grid of cells that contain further sub-grids of
 * cloud blocks. This 2D grid move altogether in the `+x` direction, and is generated at the start asynchronously using
 * web workers using simplex noise.
 *
 * When using {@link Clouds.update}, new clouds will be generated if the center of the grid
 * does not match the passed in position.
 *
 * ![Clouds](/img/docs/clouds.png)
 *
 * @noInheritDoc
 */
export declare class Clouds extends Group {
    /**
     * Parameters used to create a new {@link Clouds} instance.
     */
    options: CloudsOptions;
    /**
     * Whether or not are the clouds done generating.
     */
    isInitialized: boolean;
    /**
     * The shard shader material used to render the clouds.
     */
    material: ShaderMaterial;
    /**
     * A 2D array of cloud meshes. The first dimension is the x-axis, and the second dimension is the z-axis.
     */
    meshes: Mesh[][];
    /**
     * The x-offset of the clouds since initialization. This is determined by diffing the `locatedCell` and the
     * position passed into {@link Clouds.update}.
     */
    xOffset: number;
    /**
     * The z-offset of the clouds since initialization. This is determined by diffing the `locatedCell` and the
     * position passed into {@link Clouds.update}.
     */
    zOffset: number;
    /**
     * The cell that this cloud is currently centered around.
     */
    locatedCell: Coords2;
    /**
     * The new position to lerp the clouds.
     */
    private newPosition;
    /**
     * The worker pool used to generate the clouds.
     */
    private pool;
    /**
     * A inner THREE.JS clock used to determine the time delta between frames.
     */
    private clock;
    /**
     * Create a new {@link Clouds} instance, initializing it asynchronously automatically.
     *
     * @param options Parameters used to create a new {@link Clouds} instance.
     */
    constructor(options?: Partial<CloudsOptions>);
    /**
     * Reset the clouds to their initial state.
     */
    reset: () => Promise<void>;
    /**
     * Move the clouds to centering around the passed in position. If there aren't enough cloud
     * cells at any side, new clouds are generated.
     *
     * @param position The new position that this cloud should be centered around.
     */
    update: (position: Vector3) => void;
    /**
     * Initialize the clouds asynchronously.
     */
    private initialize;
    /**
     * Generate a new cloud row in the `+/- x` direction.
     */
    private shiftX;
    /**
     * Generate a new cloud row in the `+/- z` direction.
     */
    private shiftZ;
    /**
     * Generate a new cloud cell's mesh.
     *
     * @param x The x position of the cell.
     * @param z The z position of the cell.
     * @param mesh The mesh to update.
     * @returns The mesh that was generated.
     */
    private makeCell;
}
//# sourceMappingURL=clouds.d.ts.map