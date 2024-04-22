import { ChatProtocol, MessageProtocol } from "@voxelize/transport/src/types";
import { NetIntercept } from "./network";
/**
 * A process that gets run when a command is triggered.
 */
export type CommandProcessor = (rest: string) => void;
/**
 * A network interceptor that gives flexible control over the chat feature of
 * the game. This also allows for custom commands to be added.
 *
 * # Example
 * ```ts
 * const chat = new VOXELIZE.Chat();
 *
 * // Listen to incoming chat messages.
 * chat.onChat = (chat: ChatMessage) => {
 *   console.log(chat);
 * };
 *
 * // Sending a chat message.
 * chat.send({
 *   type: "CLIENT",
 *   sender: "Mr. Robot",
 *   body: "Hello world!",
 * });
 *
 * // Register to the network.
 * network.register(chat);
 * ```
 *
 * ![Chat](/img/docs/chat.png)
 *
 * @category Core
 */
export declare class Chat implements NetIntercept {
    /**
     * A list of commands added by `addCommand`.
     */
    private commands;
    /**
     * An array of network packets that will be sent on `network.flush` calls.
     *
     * @hidden
     */
    packets: MessageProtocol[];
    /**
     * The symbol that is used to trigger commands.
     */
    private _commandSymbol;
    /**
     * Send a chat to the server.
     *
     * @param chat The chat message to send.
     */
    send(chat: ChatProtocol): void;
    onChat: (chat: ChatProtocol) => void;
    /**
     * Add a command to the chat system. Commands are case sensitive.
     *
     * @param trigger - The text to trigger the command, needs to be one single word without spaces.
     * @param process - The process run when this command is triggered.
     */
    addCommand(trigger: string, process: CommandProcessor, aliases?: string[]): void;
    /**
     * Remove a command from the chat system. Case sensitive.
     *
     * @param trigger - The trigger to remove.
     */
    removeCommand(trigger: string): boolean;
    /**
     * The network intercept implementation for chats.
     *
     * DO NOT CALL THIS METHOD OR CHANGE IT UNLESS YOU KNOW WHAT YOU ARE DOING.
     *
     * @hidden
     * @param message The message to intercept.
     */
    onMessage: (message: MessageProtocol) => void;
    /**
     * The symbol that is used to trigger commands.
     */
    get commandSymbol(): string;
}
//# sourceMappingURL=chat.d.ts.map