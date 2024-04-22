/**
 * Axis-aligned Bounding Box.
 */
declare class AABB {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
    constructor(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number);
    /**
     * Width of the AABB, maxX - minX.
     *
     * @readonly
     */
    get width(): number;
    /**
     * Height of the AABB, maxY - minY.
     *
     * @readonly
     */
    get height(): number;
    /**
     * Depth of the AABB, maxZ - minZ.
     *
     * @readonly
     */
    get depth(): number;
    /**
     * Magnitude of the AABB.
     *
     * @readonly
     */
    get mag(): number;
    /**
     * Get the minimum coordinate at an axis.
     *
     * @param axis - Which axis to get min coordinate of
     */
    getMin: (axis: number) => number;
    /**
     * Set the minimum coordinate at an axis.
     *
     * @param axis - Which axis to set min coordinate of
     */
    setMin: (axis: number, value: number) => void;
    /**
     * Get the maximum coordinate at an axis.
     *
     * @param axis - Which axis to get max coordinate of
     */
    getMax: (axis: number) => number;
    /**
     * Set the maximum coordinate at an axis.
     *
     * @param axis - Which axis to set max coordinate of
     */
    setMax: (axis: number, value: number) => void;
    /**
     * Translate the AABB by an amount.
     *
     * @param delta - By how much is the AABB moved
     */
    translate: ([dx, dy, dz]: number[]) => this;
    /**
     * Translate the AABB on a certain axis.
     *
     * @param axis - Axis to translate on
     */
    translateAxis: (axis: number, delta: number) => this;
    /**
     * Move the entire AABB to a coordinate.
     *
     * @param point - Base of which the AABB should be moved to
     */
    setPosition: ([px, py, pz]: number[]) => this;
    /**
     * Check to see if AABB intersects with another AABB.
     *
     * @param aabb - Another AABB to test with
     */
    intersects: (aabb: AABB) => boolean;
    /**
     * Check to see if AABB is touching another AABB.
     *
     * @param aabb - Another AABB to test with
     */
    touches: (aabb: AABB) => boolean;
    /**
     * Get a new AABB of the union of the two AABB's.
     *
     * @param aabb - Another AABB to union with
     */
    union: (aabb: AABB) => AABB;
    /**
     * Get a new AABB of the intersection between two AABB's.
     *
     * @param aabb - Another AABB to intersect with
     */
    intersection: (aabb: AABB) => AABB;
    /**
     * Suppose this AABB should move in the X-axis by `deltaX`, check to see
     * the actual distance available to move with another AABB in the way.
     *
     * @param aabb - AABB in the way
     * @param deltaX - How much supposed to move
     */
    computeOffsetX(aabb: AABB, deltaX: number): number;
    /**
     * Suppose this AABB should move in the Y-axis by `deltaY`, check to see
     * the actual distance available to move with another AABB in the way.
     *
     * @param aabb - AABB in the way
     * @param deltaY - How much supposed to move
     */
    computeOffsetY(aabb: AABB, deltaY: number): number;
    /**
     * Suppose this AABB should move in the Z-axis by `deltaZ`, check to see
     * the actual distance available to move with another AABB in the way.
     *
     * @param aabb - AABB in the way
     * @param deltaZ - How much supposed to move
     */
    computeOffsetZ(aabb: AABB, deltaZ: number): number;
    /**
     * Create a clone of this AABB instance.
     */
    clone: () => AABB;
    static union: (all: AABB[]) => AABB;
}

export { AABB };
