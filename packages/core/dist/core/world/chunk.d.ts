import { ChunkProtocol } from "@voxelize/transport/src/types";
import { Group, Mesh } from "three";
import { Coords2 } from "../../types";
import { RawChunk, RawChunkOptions } from "./raw-chunk";
export declare class Chunk extends RawChunk {
    meshes: Map<number, Mesh<import("three").BufferGeometry<import("three").NormalBufferAttributes>, import("three").Material | import("three").Material[], import("three").Object3DEventMap>[]>;
    added: boolean;
    isDirty: boolean;
    group: Group<import("three").Object3DEventMap>;
    constructor(id: string, coords: Coords2, options: RawChunkOptions);
    setData(data: ChunkProtocol): void;
    dispose(): void;
}
//# sourceMappingURL=chunk.d.ts.map