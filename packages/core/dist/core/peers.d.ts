import { MessageProtocol, PeerProtocol } from "@voxelize/transport/src/types";
import { Group, Object3D } from "three";
import { NetIntercept } from "./network";
/**
 * Parameters to customize the peers manager.
 */
export type PeersOptions = {
    /**
     * Whether or not should the client themselves be counted as "updated". In other words,
     * whether or not should the update function be called on the client's own data. Defaults
     * to `false`.
     */
    countSelf: boolean;
    /**
     * Whether or not should the peers manager automatically call `update` on any children
     * mesh. Defaults to `true`.
     */
    updateChildren: boolean;
};
/**
 * A class that allows you to add multiplayer functionality to your Voxelize game. This implements
 * a {@link NetIntercept} that intercepts all peer-related messages and allows you to customize
 * the behavior of multiplayer functionality. This class also extends a `THREE.Group` that allows
 * you to dynamically turn on/off multiplayer visibility.
 *
 * Override {@link Peers.packInfo} to customize the information that is sent to other peers.
 *
 * TODO-DOC
 *
 * # Example
 * ```ts
 * // Create a peers manager.
 * const peers = new VOXELIZE.Peers<VOXELIZE.Character>();
 *
 * // Add the peers group to the world.
 * world.add(peers);
 *
 * // Define what a new peer looks like.
 * peers.createPeer = (id) => {
 *   const character = new VOXELIZE.Character();
 *   character.username = id;
 *   return character;
 * };
 *
 * // Define what happens when a peer data is received.
 * peers.onPeerUpdate = (peer, data) => {
 *   peer.set(data.position, data.direction);
 * };
 *
 * // In the render loop, update the peers manager.
 * peers.update();
 * ```
 *
 * ![Example](/img/docs/peers.png)
 *
 * @noInheritDoc
 * @param C The type of the character. Defaults to `Object3D`.
 * @param T The type of peer metadata. Defaults to `{ direction: number[], position: number[] }`.
 * @category Core
 */
export declare class Peers<C extends Object3D = Object3D, T = {
    direction: number[];
    position: number[];
}> extends Group implements NetIntercept {
    object?: Object3D;
    /**
     * Parameters to customize the peers manager.
     */
    options: PeersOptions;
    /**
     * The client's own peer ID. This is set when the client first connects to the server.
     */
    ownID: string;
    /**
     * The client's own username. This is set when the client first connects to the server.
     */
    ownUsername: string;
    ownPeer?: C;
    /**
     * A list of packets that will be sent to the server.
     *
     * @hidden
     */
    packets: MessageProtocol<any, any, any, any>[];
    /**
     * Create a peers manager to add multiplayer functionality to your Voxelize game.
     *
     * @param object The object that is used to send client's own data back to the server.
     * @param options Parameters to customize the effect.
     */
    constructor(object?: Object3D, options?: Partial<PeersOptions>);
    /**
     * A function called when a new player joins the game. This function should be implemented
     * to create and return a new peer object.
     *
     * @param id The ID of the new peer.
     */
    createPeer: (id: string) => C;
    /**
     * A function called when a player joins the game. By default, the function calls the {@link Peers.createPeer}
     * function to create a new peer object and adds it to the peers group. Customize this function to add additional
     * behavior.
     *
     * @param id The new peer's ID.
     */
    onPeerJoin: (id: string, peer: C) => void;
    /**
     * A function called to update a peer object with new data. This function should be implemented to
     * customize the behavior of the peer object.
     *
     * @param object The peer object.
     * @param data The new data.
     * @param info The peer's information.
     * @param info.id The peer's ID.
     * @param info.username The peer's username.
     */
    onPeerUpdate: (object: C, data: T, info: {
        id: string;
        username: string;
    }) => void;
    /**
     * A function called when a player leaves the game. Internally, when a player leaves, its object is removed
     * from the peers group. Customize this function to add additional behavior.
     *
     * @param id The ID of the peer that left the game.
     */
    onPeerLeave: (id: string, peer: C) => void;
    /**
     * The network intercept implementation for peers.
     *
     * DO NOT CALL THIS METHOD OR CHANGE IT UNLESS YOU KNOW WHAT YOU ARE DOING.
     *
     * @hidden
     * @param message The message to intercept.
     */
    onMessage: (message: MessageProtocol<{
        id: string;
    }, T>, { username }: {
        username: string;
    }) => void;
    /**
     * Set the client's own peer instance.
     *
     * @param peer The peer instance that is going to be the client themselves.
     */
    setOwnPeer(peer: C): void;
    /**
     * Set the client's own username. This will be broadcasted to the server.
     *
     * @param username The username of the client.
     */
    setOwnUsername(username: string): void;
    /**
     * Create a packet to send to the server. By default, this function sends the position and direction
     * as metadata to the server. Override this function to customize the information sent.
     *
     * If customized and nothing is returned, no packets will be sent.
     *
     * @returns A peer protocol message
     */
    packInfo(): PeerProtocol<T> | void;
    /**
     * Get a peer instance by its ID. This uses the `getObjectByName` method of the peers group.
     *
     * @param id The ID of the peer to get.
     * @returns The peer object with the given ID.
     */
    getPeerById: (id: string) => C;
    /**
     * Update the peers manager. Internally, this attempts to call any children that has a `update` method.
     * You can turn this behavior off by setting `options.updateChildren` to `false`.
     *
     * This function should be called in the render loop.
     */
    update(): void;
}
//# sourceMappingURL=peers.d.ts.map