import { SpriteText } from "./sprite-text";
/**
 * Parameters to create a name tag.
 */
export type NameTagOptions = {
    /**
     * The font face to create the name tag. Defaults to `"monospace"`.
     */
    fontFace?: string;
    /**
     * The font size to create the name tag. Defaults to `0.1`.
     */
    fontSize?: number;
    /**
     * The y-offset of the nametag moved upwards. Defaults to `0`.
     */
    yOffset?: number;
    /**
     * The color of the name tag. Defaults to `0xffffff`.
     */
    color?: string;
    /**
     * The background color of the name tag. Defaults to `0x00000077`.
     */
    backgroundColor?: string;
};
/**
 * A class that allows you to create a name tag mesh. This name tag mesh also supports colored text
 * using the {@link ColorText} syntax. Name tags can be treated like any other mesh.
 *
 * ![Name tag](/img/docs/nametag.png)
 *
 * @noInheritDoc
 */
export declare class NameTag extends SpriteText {
    constructor(text: string, options?: Partial<NameTagOptions>);
}
//# sourceMappingURL=nametag.d.ts.map