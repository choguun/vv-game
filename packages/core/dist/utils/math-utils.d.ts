import { Quaternion } from "three";
/**
 * A utility class for doing math operations.
 *
 * @category Utils
 */
export declare class MathUtils {
    /**
     * Round a number to a given precision.
     *
     * @param n The number to round.
     * @param digits The number of digits after decimal to round to.
     * @returns The rounded number.
     */
    static round: (n: number, digits: number) => number;
    /**
     * Normalizes an angle to be between -2PI and 2PI.
     *
     * @param angle The angle to normalize.
     * @returns The normalized angle.
     */
    static normalizeAngle: (angle: number) => number;
    /**
     * Convert a direction vector to a quaternion.
     *
     * @param dx X component of the direction vector.
     * @param dy Y component of the direction vector.
     * @param dz Z component of the direction vector.
     * @returns The quaternion representing the direction vector.
     */
    static directionToQuaternion: (dx: number, dy: number, dz: number) => Quaternion;
    private constructor();
}
//# sourceMappingURL=math-utils.d.ts.map