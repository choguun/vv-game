import { Block } from ".";
export declare class Registry {
    blocksByName: Map<string, Block>;
    blocksById: Map<number, Block>;
    nameMap: Map<string, number>;
    idMap: Map<number, string>;
    /**
     * @hidden
     */
    constructor();
    serialize(): object;
    static deserialize(data: any): Registry;
}
//# sourceMappingURL=registry.d.ts.map