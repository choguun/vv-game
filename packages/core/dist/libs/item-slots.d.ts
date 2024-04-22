import { DirectionalLight, Object3D, OrthographicCamera, Scene, Vector3, WebGLRenderer } from "three";
import { CameraPerspective } from "../common";
import { Inputs } from "../core/inputs";
export type ItemSlotsOptions = {
    wrapperClass: string;
    wrapperStyles: Partial<CSSStyleDeclaration>;
    slotClass: string;
    slotHoverClass: string;
    slotFocusClass: string;
    slotSubscriptClass: string;
    slotMargin: number;
    slotPadding: number;
    slotWidth: number;
    slotHeight: number;
    slotStyles: Partial<CSSStyleDeclaration>;
    slotSubscriptStyles: Partial<CSSStyleDeclaration>;
    horizontalCount: number;
    verticalCount: number;
    focusFirstByDefault: boolean;
    activatedByDefault: boolean;
    zoom: number;
    perspective: CameraPerspective;
    scrollable?: boolean;
};
export declare class ItemSlot<T = number> {
    itemSlots: ItemSlots<T>;
    row: number;
    col: number;
    scene: Scene;
    object: Object3D;
    light: DirectionalLight;
    camera: OrthographicCamera;
    element: HTMLDivElement;
    subscriptElement: HTMLDivElement;
    subscript: string;
    content: T;
    zoom: number;
    lightRotationOffset: number;
    offset: Vector3;
    constructor(itemSlots: ItemSlots<T>, row: number, col: number);
    getObject: () => Object3D<import("three").Object3DEventMap>;
    setObject: (object: Object3D) => void;
    getContent: () => T;
    setContent: (content: T) => void;
    getSubscript: () => string;
    setSubscript: (subscript: string) => void;
    triggerChange: () => void;
    setZoom: (zoom: number) => void;
    setPerspective: (perspective: CameraPerspective) => void;
    applyClass: (className: string) => void;
    removeClass: (className: string) => void;
    applySubscriptClass: (className: string) => void;
    removeSubscriptClass: (className: string) => void;
    applyStyles: (styles: Partial<CSSStyleDeclaration>) => void;
    applySubscriptStyles: (styles: Partial<CSSStyleDeclaration>) => void;
    private updateCamera;
}
export declare class ItemSlots<T = number> {
    options: ItemSlotsOptions;
    wrapper: HTMLDivElement;
    canvas: HTMLCanvasElement;
    renderer: WebGLRenderer;
    focusedRow: number;
    focusedCol: number;
    activated: boolean;
    slotTotalWidth: number;
    slotTotalHeight: number;
    onSlotClick: (slot: ItemSlot<T>) => void;
    onSlotUpdate: (slot: ItemSlot<T>) => void;
    onFocusChange: (callbackFunc: (prevSlot: ItemSlot<T>, nextSlot: ItemSlot<T>) => void) => void;
    triggerFocusChange: (prevSlot: ItemSlot<T>, nextSlot: ItemSlot<T>) => void;
    private slots;
    private focusChangeCallbacks;
    private animationFrame;
    constructor(options?: Partial<ItemSlotsOptions>);
    activate: () => void;
    deactivate: () => void;
    setObject: (row: number, col: number, object: Object3D) => void;
    setContent: (row: number, col: number, content: T) => void;
    setSubscript: (row: number, col: number, subscript: string) => void;
    setFocused: (row: number, col: number) => void;
    getObject: (row: number, col: number) => Object3D<import("three").Object3DEventMap>;
    getContent: (row: number, col: number) => T;
    getSubscript: (row: number, col: number) => string;
    getFocused: () => ItemSlot<T>;
    getRowColFromEvent: (event: MouseEvent) => {
        row: number;
        col: number;
    };
    getSlot: (row: number, col: number) => ItemSlot<T>;
    connect: (inputs: Inputs, namespace?: string) => () => void;
    render: () => void;
    get element(): HTMLDivElement;
    private generate;
}
//# sourceMappingURL=item-slots.d.ts.map