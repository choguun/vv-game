import { AABB } from '@voxelize/aabb';

declare function raycastAABB(origin: number[], normal: number[], aabb: AABB, maxDistance?: number): {
    axis: number;
    distance: number;
} | null;
declare function raycast(getVoxel: (vx: number, vy: number, vz: number) => AABB[], origin: number[], direction: number[], maxDistance: number): {
    point: number[];
    normal: number[];
    voxel: number[];
} | null;

export { raycast as default, raycast, raycastAABB };
