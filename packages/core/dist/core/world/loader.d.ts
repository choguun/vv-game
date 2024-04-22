import { Texture } from "three";
/**
 * An asset loader that can load textures and audio files. This class is used internally by the world
 * and can be accessed via {@link World.loader}.
 *
 * @category Core
 */
declare class Loader {
    /**
     * A map of all textures loaded by Voxelize.
     */
    textures: Map<string, Texture>;
    images: Map<string, HTMLImageElement | HTMLImageElement[]>;
    /**
     * A map of all audios loaded by Voxelize.
     */
    audioBuffers: Map<string, AudioBuffer>;
    /**
     * The progress at which Loader has loaded, zero to one.
     */
    progress: number;
    /**
     * The internal loading manager used by the loader.
     */
    private manager;
    /**
     * The internal texture loader used by the loader.
     */
    private textureLoader;
    /**
     * The internal audio loader used by the loader.
     */
    private audioLoader;
    /**
     * A map of promises to load assets.
     */
    private assetPromises;
    /**
     * A map of callbacks to load audios.
     */
    private audioCallbacks;
    /**
     * Construct a Voxelize loader.
     *
     * @hidden
     */
    constructor();
    loadGifImages: (source: string, onLoaded?: (images: HTMLImageElement[]) => void) => Promise<HTMLImageElement[]>;
    loadTexture: (source: string, onLoaded?: (texture: Texture) => void) => Promise<Texture>;
    loadImage: (source: string, onLoaded?: (image: HTMLImageElement) => void) => Promise<HTMLImageElement>;
    /**
     * Get a loaded texture by its source.
     *
     * @param source The source to the texture file to load from.
     * @returns A texture instance loaded from the source.
     */
    getTexture: (source: string) => Texture;
    /**
     * Get a loaded gif texture with this function.
     *
     * @param source The source to the texture file loaded from.
     * @returns A list of textures for each frame of the gif.
     */
    getGifTexture: (source: string) => Texture[];
    /**
     * Add an audio file to be loaded from.
     *
     * @param source The source to the audio file to load from.
     * @param onLoaded A callback to run when the audio is loaded.
     */
    loadAudioBuffer: (source: string, onLoaded?: (buffer: AudioBuffer) => void) => Promise<AudioBuffer>;
    /**
     * Load all assets other than the textures. Called internally by the world.
     * This can be used to ensure that a function runs after all assets are loaded.
     *
     * @example
     * ```ts
     * world.loader.load().then(() => {});
     * ```
     *
     * @returns A promise that resolves when all assets are loaded.
     */
    load: () => Promise<void>;
    /**
     * Load all audio loader callbacks.
     */
    private loadAudios;
}
export { Loader };
//# sourceMappingURL=loader.d.ts.map