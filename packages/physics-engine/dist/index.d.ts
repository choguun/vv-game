import { AABB } from '@voxelize/aabb';

declare class RigidBody {
    aabb: AABB;
    mass: number;
    friction: number;
    restitution: number;
    gravityMultiplier: number;
    stepHeight: number;
    onStep?: ((newAABB: AABB, resting: number[]) => void) | undefined;
    onCollide?: ((impacts?: number[]) => void) | undefined;
    airDrag: number;
    fluidDrag: number;
    resting: number[];
    velocity: number[];
    inFluid: boolean;
    ratioInFluid: number;
    forces: number[];
    impulses: number[];
    sleepFrameCount: number;
    constructor(aabb: AABB, mass: number, friction: number, restitution: number, gravityMultiplier: number, stepHeight: number, onStep?: ((newAABB: AABB, resting: number[]) => void) | undefined, onCollide?: ((impacts?: number[]) => void) | undefined);
    setPosition: (p: number[]) => void;
    getPosition: () => number[];
    applyForce: (f: number[]) => void;
    applyImpulse: (i: number[]) => void;
    markActive: () => void;
    get atRestX(): number;
    get atRestY(): number;
    get atRestZ(): number;
}

declare function sweep(getVoxels: (vx: number, vy: number, vz: number) => AABB[], box: AABB, velocity: number[], callback: (dist: number, axis: number, dir: number, leftover: number[], voxel?: number[]) => boolean, translate?: boolean, maxIterations?: number): void;

type BodyOptions = {
    aabb: AABB;
    mass: number;
    friction: number;
    restitution: number;
    gravityMultiplier: number;
    onStep: (newAABB: AABB, resting: number[]) => void;
    onCollide: (impacts?: number[]) => void;
    stepHeight: number;
};
type EngineOptions = {
    gravity: number[];
    minBounceImpulse: number;
    airDrag: number;
    fluidDrag: number;
    fluidDensity: number;
};
declare class Engine {
    private getVoxel;
    private testFluid;
    options: EngineOptions;
    bodies: RigidBody[];
    static EPSILON: number;
    constructor(getVoxel: (vx: number, vy: number, vz: number) => AABB[], testFluid: (vx: number, vy: number, vz: number) => boolean, options: EngineOptions);
    addBody: (options: Partial<BodyOptions>) => RigidBody;
    removeBody: (body: RigidBody) => undefined;
    update: (dt: number) => void;
    iterateBody: (body: RigidBody, dt: number, noGravity: boolean) => void;
    applyFluidForces: (body: RigidBody) => void;
    applyFrictionByAxis: (axis: number, body: RigidBody, dvel: number[]) => void;
    processCollisions: (box: AABB, velocity: number[], resting: number[]) => void;
    tryAutoStepping: (body: RigidBody, oldBox: AABB, dx: number[]) => void;
    isBodyAsleep: (body: RigidBody, dt: number, noGravity: boolean) => boolean;
    teleport: (body: RigidBody, position: number[], duration: number) => void;
}

export { BodyOptions, Engine, EngineOptions, RigidBody, sweep };
