import { client as WebSocket, connection as WebSocketConnection } from "websocket";
import protocol from "./protocol";
import { MessageProtocol } from "./types";
export * from "./types";
export * from "./utils";
export { protocol };
/**
 * @noInheritDoc
 */
export declare class Transport extends WebSocket {
    reconnectTimeout?: number;
    connection: WebSocketConnection;
    static MessageTypes: typeof protocol.protocol.Message.Type;
    private address;
    private secret;
    private reconnection;
    constructor(reconnectTimeout?: number);
    onInit?: (event: MessageProtocol) => void;
    onJoin?: (event: MessageProtocol) => void;
    onLeave?: (event: MessageProtocol) => void;
    onError?: (event: MessageProtocol) => void;
    onPeer?: (event: MessageProtocol) => void;
    onEntity?: (event: MessageProtocol) => void;
    onLoad?: (event: MessageProtocol) => void;
    onUnload?: (event: MessageProtocol) => void;
    onUpdate?: (event: MessageProtocol) => void;
    onMethod?: (event: MessageProtocol) => void;
    onChat?: (event: MessageProtocol) => void;
    onTransport?: (event: MessageProtocol) => void;
    onEvent?: (event: MessageProtocol) => void;
    onAction?: (event: MessageProtocol) => void;
    connect: (address: string, secret: string) => Promise<void>;
    send: (event: MessageProtocol) => void;
    tryReconnect: () => void;
    private onMessage;
    static decodeSync: (buffer: any) => MessageProtocol;
    static encodeSync(message: any): Uint8Array;
}
//# sourceMappingURL=index.d.ts.map