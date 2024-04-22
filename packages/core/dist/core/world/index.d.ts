import { AABB } from "@voxelize/aabb";
import { Engine as PhysicsEngine } from "@voxelize/physics-engine";
import { EntityOperation, MessageProtocol } from "@voxelize/transport/src/types";
import { NetIntercept } from "core/network";
import { Color, Group, Scene, ShaderMaterial, Texture, Uniform, Vector3 } from "three";
import { Coords2, Coords3 } from "../../types";
import { LightColor } from "../../utils";
import { Block, BlockDynamicPattern, BlockRotation, BlockUpdate } from "./block";
import { Chunk } from "./chunk";
import { Chunks } from "./chunks";
import { Clouds, CloudsOptions } from "./clouds";
import { Loader } from "./loader";
import { Registry } from "./registry";
import { Sky, SkyOptions } from "./sky";
export * from "./block";
export * from "./chunk";
export * from "./clouds";
export * from "./loader";
export * from "./registry";
export * from "./shaders";
export * from "./sky";
export * from "./textures";
export * from "./uv";
export type LightNode = {
    voxel: Coords3;
    level: number;
};
export type BlockUpdateListener = (args: {
    oldValue: number;
    newValue: number;
    voxel: Coords3;
}) => void;
export type BlockEntityUpdateListener<T> = (args: {
    id: string;
    voxel: Coords3;
    operation: EntityOperation;
    oldValue: T | null;
    newValue: T | null;
}) => void;
/**
 * Custom shader material for chunks, simply a `ShaderMaterial` from ThreeJS with a map texture. Keep in mind that
 * if you want to change its map, you also have to change its `uniforms.map`.
 */
export type CustomChunkShaderMaterial = ShaderMaterial & {
    /**
     * The texture that this map runs on.
     */
    map: Texture;
};
/**
 * The client-side options to create a world. These are client-side only and can be customized to specific use.
 */
export type WorldClientOptions = {
    /**
     * The maximum chunk requests this world can request from the server per world update. Defaults to `12` chunks.
     */
    maxChunkRequestsPerUpdate: number;
    /**
     * The maximum amount of chunks received from the server that can be processed per world update.
     * By process, it means to be turned into a `Chunk` instance. Defaults to `8` chunks.
     */
    maxProcessesPerUpdate: number;
    /**
     * The maximum voxel updates that can be sent to the server per world update. Defaults to `1000` updates.
     */
    maxUpdatesPerUpdate: number;
    maxMeshesPerUpdate: number;
    /**
     * Whether or not should the world generate ThreeJS meshes. Defaults to `true`.
     */
    shouldGenerateChunkMeshes: boolean;
    /**
     * The minimum light level even when sunlight and torch light levels are at zero. Defaults to `0.04`.
     */
    minLightLevel: number;
    /**
     * The fraction of the day that sunlight starts to appear. Defaults to `0.25`.
     */
    sunlightStartTimeFrac: number;
    /**
     * The fraction of the day that sunlight starts to disappear. Defaults to `0.7`.
     */
    sunlightEndTimeFrac: number;
    /**
     * The fraction of the day that sunlight takes to change from appearing to disappearing
     * or disappearing to appearing. Defaults to `0.1`.
     */
    sunlightChangeSpan: number;
    /**
     * The interval between each time a chunk is re-requested to the server. Defaults to `300` updates.
     */
    chunkRerequestInterval: number;
    /**
     * The default render radius of the world, in chunks. Change this through `world.renderRadius`. Defaults to `8` chunks.
     */
    defaultRenderRadius: number;
    /**
     * The default dimension to a single unit of a block face texture. If any texture loaded is greater, it will be downscaled to this resolution.
     * Defaults to `8` pixels.
     */
    textureUnitDimension: number;
    /**
     * The exponent applied to the ratio that chunks are loaded, which would then be used to determine whether an angle to a chunk is worth loading.
     * Defaults to `8`.
     */
    chunkLoadExponent: number;
    /**
     * The options to create the sky. Defaults to `{}`.
     */
    skyOptions: Partial<SkyOptions>;
    /**
     * The options to create the clouds. Defaults to `{}`.
     */
    cloudsOptions: Partial<CloudsOptions>;
    /**
     * The uniforms to overwrite the default chunk material uniforms. Defaults to `{}`.
     */
    chunkUniformsOverwrite: Partial<Chunks["uniforms"]>;
    /**
     * The threshold to force the server's time to the client's time. Defaults to `0.1`.
     */
    timeForceThreshold: number;
    /**
     * The interval between each time the world requests the server for its stats. Defaults to 500ms.
     */
    statsSyncInterval: number;
    maxLightsUpdateTime: number;
};
/**
 * The options defined on the server-side, passed to the client on network joining.
 */
export type WorldServerOptions = {
    /**
     * The number of sub-chunks that divides a chunk vertically.
     */
    subChunks: number;
    /**
     * The width and depth of a chunk, in blocks.
     */
    chunkSize: number;
    /**
     * The height of a chunk, in blocks.
     */
    maxHeight: number;
    /**
     * The maximum light level that propagates in this world, including sunlight and torch light.
     */
    maxLightLevel: number;
    /**
     * The minimum chunk coordinate of this world, inclusive.
     */
    minChunk: [number, number];
    /**
     * The maximum chunk coordinate of this world, inclusive.
     */
    maxChunk: [number, number];
    /**
     * The gravity of everything physical in this world.
     */
    gravity: number[];
    /**
     * The minimum bouncing impulse of everything physical in this world.
     */
    minBounceImpulse: number;
    doesTickTime: boolean;
    /**
     * The air drag of everything physical.
     */
    airDrag: number;
    /**
     * The fluid drag of everything physical.
     */
    fluidDrag: number;
    /**
     * The density of the fluid in this world.
     */
    fluidDensity: number;
    /**
     * The time per day in seconds.
     */
    timePerDay: number;
};
/**
 * The options to create a world. This consists of {@link WorldClientOptions} and {@link WorldServerOptions}.
 */
export type WorldOptions = WorldClientOptions & WorldServerOptions;
/**
 * A Voxelize world handles the chunk loading and rendering, as well as any 3D objects.
 * **This class extends the [ThreeJS `Scene` class](https://threejs.org/docs/#api/en/scenes/Scene).**
 * This means that you can add any ThreeJS objects to the world, and they will be rendered. The world
 * also implements {@link NetIntercept}, which means it intercepts chunk-related packets from the server
 * and constructs chunk meshes from them. You can optionally disable this by setting `shouldGenerateChunkMeshes` to `false`
 * in the options.
 *
 * There are a couple components that are by default created by the world that holds data:
 * - {@link World.registry}: A block registry that handles block textures and block instances.
 * - {@link World.chunks}: A chunk manager that stores all the chunks in the world.
 * - {@link World.physics}: A physics engine that handles voxel AABB physics simulation of client-side physics.
 * - {@link World.loader}: An asset loader that handles loading textures and other assets.
 * - {@link World.sky}: A sky that can render the sky and the sun.
 * - {@link World.clouds}: A clouds that renders the cubical clouds.
 *
 * One thing to keep in mind that there are no specific setters like `setVoxelByVoxel` or `setVoxelRotationByVoxel`.
 * This is because, instead, you should use `updateVoxel` and `updateVoxels` to update voxels.
 *
 * # Example
 * ```ts
 * const world = new VOXELIZE.World();
 *
 * // Update the voxel at `(0, 0, 0)` to a voxel type `12` in the world across the network.
 * world.updateVoxel(0, 0, 0, 12)
 *
 * // Register the interceptor with the network.
 * network.register(world);
 *
 * // Register an image to block sides.
 * world.applyBlockTexture("Test", VOXELIZE.ALL_FACES, "https://example.com/test.png");
 *
 * // Update the world every frame.
 * world.update(controls.position);
 * ```
 *
 * ![World](/img/docs/world.png)
 *
 * @category Core
 * @noInheritDoc
 */
export declare class World<T = any> extends Scene implements NetIntercept {
    /**
     * The options to create the world.
     */
    options: WorldOptions;
    /**
     * The block registry that holds all block data, such as texture and block properties.
     */
    registry: Registry;
    /**
     * An asset loader to load in things like textures, images, GIFs and audio buffers.
     */
    loader: Loader;
    /**
     * The manager that holds all chunk-related data, such as chunk meshes and voxel data.
     */
    chunks: Chunks;
    /**
     * The voxel physics engine using `@voxelize/physics-engine`.
     */
    physics: PhysicsEngine;
    /**
     * The sky that renders the sky and the sun.
     */
    sky: Sky;
    /**
     * The clouds that renders the cubical clouds.
     */
    clouds: Clouds;
    /**
     * Whether or not this world is connected to the server and initialized with data from the server.
     */
    isInitialized: boolean;
    /**
     * The network packets to be sent to the server.
     * @hidden
     */
    packets: MessageProtocol[];
    /**
     * The voxel cache that stores previous values.
     */
    private oldBlocks;
    /**
     * The internal clock.
     */
    private clock;
    /**
     * A map of initialize listeners on chunks.
     */
    private chunkInitializeListeners;
    private blockEntitiesMap;
    private blockEntityUpdateListeners;
    private blockUpdateListeners;
    /**
     * The JSON data received from the world. Call `initialize` to initialize.
     */
    private initialData;
    private initialEntities;
    /**
     * The internal time in seconds.
     */
    private _time;
    /**
     * The internal render radius in chunks.
     */
    private _renderRadius;
    /**
     * The internal delete radius in chunks.
     */
    private _deleteRadius;
    private meshWorkerPool;
    private chunksTracker;
    private isTrackingChunks;
    /**
     * Create a new Voxelize world.
     *
     * @param options The options to create the world.
     */
    constructor(options?: Partial<WorldOptions>);
    meshChunkLocally(cx: number, cz: number, level: number): Promise<void>;
    /**
     * Apply a texture to a face or faces of a block. This will automatically load the image from the source
     * and draw it onto the block's texture atlas.
     *
     * @param idOrName The ID or name of the block.
     * @param faceNames The face names to apply the texture to.
     * @param source The source of the texture.
     */
    applyBlockTexture(idOrName: number | string, faceNames: string | string[], source: string | Color | HTMLImageElement | Texture): Promise<void>;
    getIsolatedBlockMaterialAt(voxel: Coords3, faceName: string, defaultDimension?: number): CustomChunkShaderMaterial;
    applyBlockTextureAt(idOrName: number | string, faceName: string, source: Texture, voxel: Coords3): CustomChunkShaderMaterial;
    /**
     * Apply multiple block textures at once. See {@link applyBlockTexture} for more information.
     *
     * @param data The data to apply the block textures.
     * @returns A promise that resolves when all the textures are applied.
     */
    applyBlockTextures(data: {
        idOrName: number | string;
        faceNames: string | string[];
        source: string | Color;
    }[]): Promise<void[]>;
    /**
     * Apply a set of keyframes to a block. This will load the keyframes from the sources and start the animation
     * to play the keyframes on the block's texture atlas.
     *
     * @param idOrName The ID or name of the block.
     * @param faceNames The face name or names to apply the texture to.
     * @param keyframes The keyframes to apply to the texture.
     * @param fadeFrames The number of frames to fade between each keyframe.
     */
    applyBlockFrames(idOrName: number | string, faceNames: string | string[], keyframes: [number, string | Color | HTMLImageElement][], fadeFrames?: number): Promise<void>;
    /**
     * Apply a GIF animation to a block. This will load the GIF from the source and start the animation
     * using {@link applyBlockFrames} internally.
     *
     * @param idOrName The ID or name of the block.
     * @param faceNames The face name or names to apply the texture to.
     * @param source The source of the GIF. Note that this must be a GIF file ending with `.gif`.
     * @param interval The interval between each frame of the GIF in milliseconds. Defaults to `66.666667ms`.
     */
    applyBlockGif(idOrName: string, faceNames: string[] | string, source: string, interval?: number): Promise<void>;
    /**
     * Apply a resolution to a block. This will set the resolution of the block's texture atlas.
     * Keep in mind that this face or faces must be independent.
     *
     * @param idOrName The ID or name of the block.
     * @param faceNames The face name or names to apply the resolution to.
     * @param resolution The resolution to apply to the block, in pixels.
     */
    setResolutionOf(idOrName: number | string, faceNames: string | string[], resolution: number | {
        x: number;
        y: number;
    }): Promise<void>;
    getBlockFacesByFaceNames(id: number, faceNames: string | string[] | RegExp): {
        corners: {
            pos: [number, number, number];
            uv: number[];
        }[];
        dir: [number, number, number];
        independent: boolean;
        isolated: boolean;
        range: import("./uv").UV; /**
         * The texture that this map runs on.
         */
        name: string;
    }[];
    /**
     * Get a chunk by its name.
     *
     * @param name The name of the chunk to get.
     * @returns The chunk with the given name, or undefined if it does not exist.
     */
    getChunkByName(name: string): Chunk;
    /**
     * Get a chunk by its 2D coordinates.
     *
     * @param cx The x coordinate of the chunk.
     * @param cz The z coordinate of the chunk.
     * @returns The chunk at the given coordinates, or undefined if it does not exist.
     */
    getChunkByCoords(cx: number, cz: number): Chunk;
    /**
     * Get a chunk that contains a given position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @returns The chunk that contains the position at the given position, or undefined if it does not exist.
     */
    getChunkByPosition(px: number, py: number, pz: number): Chunk;
    /**
     * Get a voxel by a 3D world position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @returns The voxel at the given position, or 0 if it does not exist.
     */
    getVoxelAt(px: number, py: number, pz: number): number;
    setVoxelAt(px: number, py: number, pz: number, voxel: number): void;
    /**
     * Get a voxel rotation by a 3D world position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @returns The voxel rotation at the given position, or the default rotation if it does not exist.
     */
    getVoxelRotationAt(px: number, py: number, pz: number): BlockRotation;
    /**
     * Set a voxel rotation at a 3D world position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @param rotation The rotation to set.
     */
    setVoxelRotationAt(px: number, py: number, pz: number, rotation: BlockRotation): void;
    /**
     * Get a voxel stage by a 3D world position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @returns The voxel stage at the given position, or 0 if it does not exist.
     */
    getVoxelStageAt(px: number, py: number, pz: number): number;
    /**
     * Get a voxel sunlight by a 3D world position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @returns The voxel sunlight at the given position, or 0 if it does not exist.
     */
    getSunlightAt(px: number, py: number, pz: number): number;
    setSunlightAt(px: number, py: number, pz: number, level: number): void;
    /**
     * Get a voxel torch light by a 3D world position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @param color The color of the torch light.
     * @returns The voxel torchlight at the given position, or 0 if it does not exist.
     */
    getTorchLightAt(px: number, py: number, pz: number, color: LightColor): number;
    setTorchLightAt(px: number, py: number, pz: number, level: number, color: LightColor): void;
    /**
     * Get a color instance that represents what an object would be like
     * if it were rendered at the given 3D voxel coordinate. This is useful
     * to dynamically shade objects based on their position in the world. Also
     * used in {@link LightShined}.
     *
     * @param vx The voxel's X position.
     * @param vy The voxel's Y position.
     * @param vz The voxel's Z position.
     * @returns The voxel's light color at the given coordinate.
     */
    getLightColorAt(vx: number, vy: number, vz: number): Color;
    /**
     * Get the block type data by a 3D world position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @returns The block at the given position, or null if it does not exist.
     */
    getBlockAt(px: number, py: number, pz: number): Block;
    /**
     * Get the highest block at a x/z position. Highest block means the first block counting downwards that
     * isn't empty (`isEmpty`).
     *
     * @param px The x coordinate of the position.
     * @param pz The z coordinate of the position.
     * @returns The highest block at the given position, or 0 if it does not exist.
     */
    getMaxHeightAt(px: number, pz: number): number;
    /**
     * Get the previous value of a voxel by a 3D world position.
     *
     * @param px The x coordinate of the position.
     * @param py The y coordinate of the position.
     * @param pz The z coordinate of the position.
     * @param count By how much to look back in the history. Defaults to `1`.
     * @returns
     */
    getPreviousValueAt(px: number, py: number, pz: number, count?: number): number;
    getBlockOf(idOrName: number | string): Block;
    /**
     * Get the block type data by a block id.
     *
     * @param id The block id.
     * @returns The block data for the given id, or null if it does not exist.
     */
    getBlockById(id: number): Block;
    /**
     * Get the block type data by a block name.
     *
     * @param name The block name.
     * @returns The block data for the given name, or null if it does not exist.
     */
    getBlockByName(name: string): Block;
    getBlockEntityDataAt(px: number, py: number, pz: number): T | null;
    setBlockEntityDataAt(px: number, py: number, pz: number, data: T): void;
    /**
     * Get the status of a chunk.
     *
     * @param cx The x 2D coordinate of the chunk.
     * @param cz The z 2D coordinate of the chunk.
     * @returns The status of the chunk.
     */
    getChunkStatus(cx: number, cz: number): "to request" | "requested" | "processing" | "loaded";
    getBlockFaceMaterial(idOrName: number | string, faceName?: string, voxel?: Coords3): CustomChunkShaderMaterial;
    /**
     * Add a listener to a chunk. This listener will be called when this chunk is loaded and ready to be rendered.
     * This is useful for, for example, teleporting the player to the top of the chunk when the player just joined.
     *
     * @param coords The chunk coordinates to listen to.
     * @param listener The listener to add.
     */
    addChunkInitListener: (coords: Coords2, listener: (chunk: Chunk) => void) => void;
    addBlockUpdateListener: (listener: BlockUpdateListener) => () => void;
    addBlockEntityUpdateListener: (listener: BlockEntityUpdateListener<T>) => () => void;
    /**
     * Whether or not if this chunk coordinate is within (inclusive) the world's bounds. That is, if this chunk coordinate
     * is within {@link WorldServerOptions | WorldServerOptions.minChunk} and {@link WorldServerOptions | WorldServerOptions.maxChunk}.
     *
     * @param cx The chunk's X position.
     * @param cz The chunk's Z position.
     * @returns Whether or not this chunk is within the bounds of the world.
     */
    isWithinWorld(cx: number, cz: number): boolean;
    isChunkInView(center: Coords2, target: Coords2, direction: Vector3, threshold: number): boolean;
    /**
     * Raycast through the world of voxels and return the details of the first block intersection.
     *
     * @param origin The origin of the ray.
     * @param direction The direction of the ray.
     * @param maxDistance The maximum distance of the ray.
     * @param options The options for the ray.
     * @param options.ignoreFluids Whether or not to ignore fluids. Defaults to `true`.
     * @param options.ignorePassables Whether or not to ignore passable blocks. Defaults to `false`.
     * @param options.ignoreSeeThrough Whether or not to ignore see through blocks. Defaults to `false`.
     * @param options.ignoreList A list of blocks to ignore. Defaults to `[]`.
     * @returns
     */
    raycastVoxels: (origin: Coords3, direction: Coords3, maxDistance: number, options?: {
        ignoreFluids?: boolean;
        ignorePassables?: boolean;
        ignoreSeeThrough?: boolean;
        ignoreList?: number[];
    }) => {
        point: number[];
        normal: number[];
        voxel: number[];
    };
    getBlockAABBsByIdAt: (id: number, vx: number, vy: number, vz: number) => AABB[];
    getBlockAABBsAt: (vx: number, vy: number, vz: number) => AABB[];
    getBlockAABBsForDynamicPatterns: (vx: number, vy: number, vz: number, dynamicPatterns: BlockDynamicPattern[]) => AABB[];
    /**
     * This sends a block update to the server and updates across the network. Block updates are queued to
     * {@link World.chunks | World.chunks.toUpdate} and scaffolded to the server {@link WorldClientOptions | WorldClientOptions.maxUpdatesPerUpdate} times
     * per tick. Keep in mind that for rotation and y-rotation, the value should be one of the following:
     * - Rotation: {@link PX_ROTATION} | {@link NX_ROTATION} | {@link PY_ROTATION} | {@link NY_ROTATION} | {@link PZ_ROTATION} | {@link NZ_ROTATION}
     * - Y-rotation: 0 to {@link Y_ROT_SEGMENTS} - 1.
     *
     * This ignores blocks that are not defined, and also ignores rotations for blocks that are not {@link Block | Block.rotatable} (Same for if
     * block is not {@link Block | Block.yRotatable}).
     *
     * @param vx The voxel's X position.
     * @param vy The voxel's Y position.
     * @param vz The voxel's Z position.
     * @param type The type of the voxel.
     * @param rotation The major axis rotation of the voxel.
     * @param yRotation The Y rotation on the major axis. Applies to blocks with major axis of PY or NY.
     */
    updateVoxel: (vx: number, vy: number, vz: number, type: number, rotation?: number, yRotation?: number, source?: "client" | "server") => void;
    /**
     * This sends a list of block updates to the server and updates across the network. Block updates are queued to
     * {@link World.chunks | World.chunks.toUpdate} and scaffolded to the server {@link WorldClientOptions | WorldClientOptions.maxUpdatesPerUpdate} times
     * per tick. Keep in mind that for rotation and y-rotation, the value should be one of the following:
     *
     * - Rotation: {@link PX_ROTATION} | {@link NX_ROTATION} | {@link PY_ROTATION} | {@link NY_ROTATION} | {@link PZ_ROTATION} | {@link NZ_ROTATION}
     * - Y-rotation: 0 to {@link Y_ROT_SEGMENTS} - 1.
     *
     * This ignores blocks that are not defined, and also ignores rotations for blocks that are not {@link Block | Block.rotatable} (Same for if
     * block is not {@link Block | Block.yRotatable}).
     *
     * @param updates A list of updates to send to the server.
     */
    updateVoxels: (updates: BlockUpdate[], source?: "client" | "server") => void;
    floodLight(queue: LightNode[], color: LightColor, min?: Coords3, max?: Coords3): void;
    removeLight(voxel: Coords3, color: LightColor): void;
    /**
     * Get a mesh of the model of the given block.
     *
     * @param id The ID of the block.
     * @param options The options of creating this block mesh.
     * @param options.material The type of material to use for this generated mesh.
     * @param options.separateFaces: Whether or not to separate the faces of the block into different meshes.
     * @param options.crumbs: Whether or not to mess up the block mesh's faces and UVs to make it look like crumbs.
     * @returns A 3D mesh (group) of the block model.
     */
    makeBlockMesh: (idOrName: number | string, options?: Partial<{
        separateFaces: boolean;
        crumbs: boolean;
        material: "basic" | "standard";
    }>) => Group<import("three").Object3DEventMap>;
    customizeMaterialShaders: (idOrName: number | string, faceName?: string | null, data?: {
        vertexShader: string;
        fragmentShader: string;
        uniforms?: {
            [key: string]: Uniform<any>;
        };
    }) => CustomChunkShaderMaterial;
    customizeBlockDynamic: (idOrName: number | string, fn: Block["dynamicFn"]) => void;
    /**
     * Initialize the world with the data received from the server. This includes populating
     * the registry, setting the options, and creating the texture atlas.
     */
    initialize(): Promise<void>;
    update(position?: Vector3, direction?: Vector3): void;
    /**
     * The message interceptor.
     *
     * @hidden
     */
    onMessage(message: MessageProtocol<any, unknown, {
        voxel: Coords3;
        json: string;
    }>): void;
    private handleEntities;
    get time(): number;
    set time(time: number);
    get renderRadius(): number;
    set renderRadius(radius: number);
    get deleteRadius(): number;
    private requestChunks;
    private processChunks;
    private maintainChunks;
    private triggerBlockUpdateListeners;
    private attemptBlockCache;
    /**
     * Update the physics engine by ticking all inner AABBs.
     */
    private updatePhysics;
    updateSkyAndClouds(position: Vector3): void;
    /**
     * Update the uniform values.
     */
    private updateUniforms;
    private buildChunkMesh;
    private setupComponents;
    private setupUniforms;
    private processLightUpdates;
    private processClientUpdates;
    private processDirtyChunks;
    /**
     * Scaffold the server updates onto the network, including chunk requests and block updates.
     */
    private emitServerUpdates;
    /**
     * Make a chunk shader material with the current atlas.
     */
    private makeShaderMaterial;
    private loadMaterials;
    private makeChunkMaterialKey;
    private trackChunkAt;
    /**
     * A sanity check to make sure that an action is not being performed after
     * the world has been isInitialized.
     */
    private checkIsInitialized;
}
//# sourceMappingURL=index.d.ts.map