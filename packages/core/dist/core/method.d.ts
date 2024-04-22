import { MessageProtocol } from "@voxelize/transport/src/types";
import { NetIntercept } from "./network";
/**
 * A caller for a method on the server.
 *
 * TODO-DOC
 *
 * # Example
 * ```ts
 * const method = new VOXELIZE.Method();
 *
 * // Register the method caller with the network.
 * network.register(method);
 *
 * // Call a method on the server.
 * method.call("my-method", { hello: "world" });
 * ```
 */
export declare class Method implements NetIntercept {
    packets: MessageProtocol<any, any, any, any>[];
    /**
     * Create a method caller that can be used to call a method on the server.
     *
     * @hidden
     */
    constructor();
    /**
     * Call a defined method on the server.
     *
     * @param name The name of the method to call.
     * @param payload The JSON serializable payload to send to the server.
     */
    call: (name: string, payload?: any) => void;
}
//# sourceMappingURL=method.d.ts.map