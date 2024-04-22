import { MessageProtocol } from "@voxelize/transport/src/types";
import { Group } from "three";
import { NetIntercept } from "./network";
export declare class Entity<T = any> extends Group {
    entId: string;
    constructor(id: string);
    /**
     * Called when the entity is created.
     */
    onCreate: (data: T) => void;
    onUpdate: (data: T) => void;
    onDelete: (data: T) => void;
}
/**
 * A network interceptor that can be used to handle `ENTITY` messages. This is useful
 * for creating custom entities that can be sent over the network.
 *
 * TODO-DOCS
 *
 * # Example
 * ```ts
 * const entities = new VOXELIZE.Entities();
 *
 * // Define an entity type.
 * class MyEntity extends VOXELIZE.Entity<{ position: VOXELIZE.Coords3 }> {
 *   onUpdate = (data) => {
 *     // Do something with `data.position`.
 *   };
 * }
 *
 * // Register the entity type.
 * entities.setClass("my-entity", MyEntity);
 *
 * // Register the interceptor with the network.
 * network.register(entities);
 * ```
 *
 * @noInheritDoc
 * @category Core
 */
export declare class Entities extends Group implements NetIntercept {
    map: Map<string, Entity>;
    types: Map<string, new (id: string) => Entity>;
    /**
     * Set a new entity type to the entities manager.
     *
     * @param type The type of entity to register.
     * @param entity The entity class to register.
     */
    setClass: (type: string, entity: new (id: string) => Entity) => void;
    /**
     * The network intercept implementation for entities.
     *
     * DO NOT CALL THIS METHOD OR CHANGE IT UNLESS YOU KNOW WHAT YOU ARE DOING.
     *
     * @hidden
     * @param message The message to intercept.
     */
    onMessage: (message: MessageProtocol) => void;
    private createEntityOfType;
}
//# sourceMappingURL=entities.d.ts.map