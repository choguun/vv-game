import { Sprite } from "three";
/**
 * A sprite that can be used to display text. This is highly inspired by the
 * [THREE.SpriteText](https://github.com/vasturiano/three-spritetext) library.
 *
 * Sprite text uses {@link ColorText} internally to generate the texture that supports
 * multiple colors in the same text.
 *
 * ![Sprite text](/img/docs/sprite-text.png)
 *
 * @noInheritDoc
 */
export declare class SpriteText extends Sprite {
    private _text;
    private _textHeight;
    private _backgroundColor;
    private _padding;
    private _borderWidth;
    private _borderRadius;
    private _borderColor;
    private _strokeWidth;
    private _strokeColor;
    private _fontFace;
    private _fontSize;
    private _fontWeight;
    private _canvas;
    /**
     * Create a new sprite text.
     *
     * @param text The text to display.
     * @param textHeight The height of the text in pixels.
     */
    constructor(text?: string, textHeight?: number);
    /**
     * Get the text rendered in the sprite.
     */
    get text(): string;
    /**
     * Set the text to display. This will regenerate the sprite.
     */
    set text(text: string);
    /**
     * Get the text height in pixels.
     */
    get textHeight(): number;
    /**
     * Set the text height to display. This will regenerate the sprite.
     */
    set textHeight(textHeight: number);
    /**
     * Get the background color of the sprite text.
     */
    get backgroundColor(): string | false;
    /**
     * Set the background color of the sprite text. This will regenerate the sprite.
     */
    set backgroundColor(color: string | false);
    /**
     * Get the padding of the sprite text. This is the space between the text and
     * the border.
     */
    get padding(): number;
    /**
     * Set the padding of the sprite text. This is the space between the text and
     * the border. This will regenerate the sprite.
     */
    set padding(padding: number);
    /**
     * Get the border width of the sprite text.
     */
    get borderWidth(): number;
    /**
     * Set the border width of the sprite text. This will regenerate the sprite.
     */
    set borderWidth(borderWidth: number);
    /**
     * Get the border radius of the sprite text.
     */
    get borderRadius(): number;
    /**
     * Set the border radius of the sprite text. This will regenerate the sprite.
     */
    set borderRadius(borderRadius: number);
    /**
     * Get the border color of the sprite text.
     */
    get borderColor(): string;
    /**
     * Set the border color of the sprite text. This will regenerate the sprite.
     */
    set borderColor(borderColor: string);
    /**
     * Get the font face of the sprite text.
     */
    get fontFace(): string;
    /**
     * Set the font face of the sprite text. This will regenerate the sprite.
     */
    set fontFace(fontFace: string);
    /**
     * Get the font size of the sprite text.
     */
    get fontSize(): number;
    /**
     * Set the font size of the sprite text. This will regenerate the sprite.
     */
    set fontSize(fontSize: number);
    /**
     * Get the font weight of the sprite text.
     */
    get fontWeight(): string;
    /**
     * Set the font weight of the sprite text. This will regenerate the sprite.
     */
    set fontWeight(fontWeight: string);
    /**
     * Get the stroke width of the sprite text.
     */
    get strokeWidth(): number;
    /**
     * Set the stroke width of the sprite text. This will regenerate the sprite.
     */
    set strokeWidth(strokeWidth: number);
    /**
     * Get the stroke color of the sprite text. In other words, the color of the
     * text.
     */
    get strokeColor(): string;
    /**
     * Set the stroke color of the sprite text. In other words, the color of the
     * text. This will regenerate the sprite.
     */
    set strokeColor(strokeColor: string);
    /**
     * Regenerate the sprite text.
     */
    private generate;
}
//# sourceMappingURL=sprite-text.d.ts.map