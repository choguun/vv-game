/**
 * This is the default shaders used for the chunks.
 */
export declare const DEFAULT_CHUNK_SHADERS: {
    vertex: string;
    fragment: string;
};
export declare const customShaders: {
    /**
     * Create a custom shader that sways the chunk with the wind. This shader's swaying is based on the y axis
     * subtracted by the floored y axis. Therefore, blocks on integer y axis values will not sway.
     *
     * @options options The options to pass into the shader.
     * @options options.speed The speed of the sway.
     * @options options.amplitude The amplitude of the sway.
     * @options options.scale The scale that is applied to the final sway.
     * @options options.rooted Whether or not should the y-value be floored to 0 first.
     * @options options.yScale The scale that is applied to the y-axis.
     * @returns Shaders to pass into {@link World.overwriteTransparentMaterial}
     */
    sway(options?: Partial<{
        speed: number;
        amplitude: number;
        scale: number;
        rooted: boolean;
        yScale: number;
    }>): {
        vertexShader: string;
        fragmentShader: string;
    };
};
//# sourceMappingURL=shaders.d.ts.map