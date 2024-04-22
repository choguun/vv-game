import { Object3D } from "three";
export declare const TRANSPARENT_RENDER_ORDER = 100000;
export declare const OPAQUE_RENDER_ORDER = 100;
export declare const TRANSPARENT_SORT: (object: Object3D) => (a: any, b: any) => number;
/**
 * Literally do nothing.
 *
 * @hidden
 */
export declare const noop: () => void;
export type CameraPerspective = "px" | "nx" | "py" | "ny" | "pz" | "nz" | "pxy" | "nxy" | "pxz" | "nxz" | "pyz" | "nyz" | "pxyz" | "nxyz";
//# sourceMappingURL=common.d.ts.map