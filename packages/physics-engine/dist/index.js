"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Engine: () => Engine,
  RigidBody: () => RigidBody,
  sweep: () => sweep
});
module.exports = __toCommonJS(src_exports);
var import_aabb = require("@voxelize/aabb");

// src/rigid-body.ts
var RigidBody = class {
  constructor(aabb, mass, friction, restitution, gravityMultiplier, stepHeight, onStep, onCollide) {
    this.aabb = aabb;
    this.mass = mass;
    this.friction = friction;
    this.restitution = restitution;
    this.gravityMultiplier = gravityMultiplier;
    this.stepHeight = stepHeight;
    this.onStep = onStep;
    this.onCollide = onCollide;
    this.resting = [0, 0, 0];
    this.velocity = [0, 0, 0];
    this.inFluid = false;
    this.ratioInFluid = 0;
    this.forces = [0, 0, 0];
    this.impulses = [0, 0, 0];
    this.sleepFrameCount = 10 | 0;
    this.setPosition = (p) => {
      this.aabb.setPosition([
        p[0] - this.aabb.width / 2,
        p[1] - this.aabb.height / 2,
        p[2] - this.aabb.depth / 2
      ]);
      this.markActive();
    };
    this.getPosition = () => {
      return [
        this.aabb.minX + this.aabb.width / 2,
        this.aabb.minY + this.aabb.height / 2,
        this.aabb.minZ + this.aabb.depth / 2
      ];
    };
    this.applyForce = (f) => {
      this.forces[0] += f[0];
      this.forces[1] += f[1];
      this.forces[2] += f[2];
      this.markActive();
    };
    this.applyImpulse = (i) => {
      this.impulses[0] += i[0];
      this.impulses[1] += i[1];
      this.impulses[2] += i[2];
      this.markActive();
    };
    this.markActive = () => {
      this.sleepFrameCount = 10 | 0;
    };
    this.airDrag = -1;
    this.fluidDrag = -1;
  }
  get atRestX() {
    return this.resting[0];
  }
  get atRestY() {
    return this.resting[1];
  }
  get atRestZ() {
    return this.resting[2];
  }
};

// src/sweep.ts
function lineToPlane(unit, vector, normal) {
  const [ux, uy, uz] = unit;
  const [vx, vy, vz] = vector;
  const [nx, ny, nz] = normal;
  const NdotU = nx * ux + ny * uy + nz * uz;
  if (NdotU === 0)
    return Infinity;
  return (nx * vx + ny * vy + nz * vz) / NdotU;
}
function between(x, a, b) {
  return x >= a && x <= b;
}
function sweepAABB(self, other, vector) {
  const mx = other.minX - self.maxX;
  const my = other.minY - self.maxY;
  const mz = other.minZ - self.maxZ;
  const mhx = self.width + other.width;
  const mhy = self.height + other.height;
  const mhz = self.depth + other.depth;
  const [dx, dy, dz] = vector;
  let h = 1, s = 0, nx = 0, ny = 0, nz = 0;
  s = lineToPlane(vector, [mx, my, mz], [-1, 0, 0]);
  if (s >= 0 && dx > 0 && s < h && between(s * dy, my, my + mhy) && between(s * dz, mz, mz + mhz)) {
    h = s;
    nx = -1;
    ny = 0;
    nz = 0;
  }
  s = lineToPlane(vector, [mx + mhx, my, mz], [1, 0, 0]);
  if (s >= 0 && dx < 0 && s < h && between(s * dy, my, my + mhy) && between(s * dz, mz, mz + mhz)) {
    h = s;
    nx = 1;
    ny = 0;
    nz = 0;
  }
  s = lineToPlane(vector, [mx, my, mz], [0, -1, 0]);
  if (s >= 0 && dy > 0 && s < h && between(s * dx, mx, mx + mhx) && between(s * dz, mz, mz + mhz)) {
    h = s;
    nx = 0;
    ny = -1;
    nz = 0;
  }
  s = lineToPlane(vector, [mx, my + mhy, mz], [0, 1, 0]);
  if (s >= 0 && dy < 0 && s < h && between(s * dx, mx, mx + mhx) && between(s * dz, mz, mz + mhz)) {
    h = s;
    nx = 0;
    ny = 1;
    nz = 0;
  }
  s = lineToPlane(vector, [mx, my, mz], [0, 0, -1]);
  if (s >= 0 && dz > 0 && s < h && between(s * dx, mx, mx + mhx) && between(s * dy, my, my + mhy)) {
    h = s;
    nx = 0;
    ny = 0;
    nz = -1;
  }
  s = lineToPlane(vector, [mx, my, mz + mhz], [0, 0, 1]);
  if (s >= 0 && dz < 0 && s < h && between(s * dx, mx, mx + mhx) && between(s * dy, my, my + mhy)) {
    h = s;
    nx = 0;
    ny = 0;
    nz = 1;
  }
  return {
    h,
    nx,
    ny,
    nz
  };
}
function sweep(getVoxels, box, velocity, callback, translate = true, maxIterations = 100) {
  if (maxIterations <= 0)
    return;
  const [vx, vy, vz] = velocity;
  const mag = Math.sqrt(vx * vx + vy * vy + vz * vz);
  const minX = Math.floor(vx > 0 ? box.minX : box.minX + vx) - 1;
  const minY = Math.floor(vy > 0 ? box.minY : box.minY + vy) - 1;
  const minZ = Math.floor(vz > 0 ? box.minZ : box.minZ + vz) - 1;
  const maxX = Math.floor(vx > 0 ? box.maxX + vx : box.maxX) + 1;
  const maxY = Math.floor(vy > 0 ? box.maxY + vy : box.maxY) + 1;
  const maxZ = Math.floor(vz > 0 ? box.maxZ + vz : box.maxZ) + 1;
  let voxel = [];
  let closest = { h: 1, nx: 0, ny: 0, nz: 0 };
  for (let vx2 = minX; vx2 <= maxX; vx2++) {
    for (let vz2 = minZ; vz2 <= maxZ; vz2++) {
      for (let vy2 = minY; vy2 <= maxY; vy2++) {
        const AABBs = getVoxels(vx2, vy2, vz2);
        for (const aabb of AABBs) {
          const collision = sweepAABB(box, aabb, velocity);
          if (collision.h < closest.h) {
            closest = collision;
            voxel = [vx2, vy2, vz2];
          }
        }
      }
    }
  }
  const dx = closest.h * vx + Engine.EPSILON * closest.nx;
  const dy = closest.h * vy + Engine.EPSILON * closest.ny;
  const dz = closest.h * vz + Engine.EPSILON * closest.nz;
  if (translate) {
    box.translate([dx, dy, dz]);
  }
  if (closest.h === 1)
    return;
  const axis = closest.nx !== 0 ? 0 : closest.ny !== 0 ? 1 : 2;
  const dir = -(closest.nx + closest.ny + closest.nz);
  const leftover = [
    (1 - closest.h) * vx,
    (1 - closest.h) * vy,
    (1 - closest.h) * vz
  ];
  if (dir !== 0 && callback(mag * closest.h, axis, dir, leftover, voxel)) {
    return;
  }
  if (leftover[0] ** 2 + leftover[1] ** 2 + leftover[2] ** 2 != 0) {
    sweep(getVoxels, box, leftover, callback, translate, maxIterations - 1);
  }
}

// src/index.ts
function approxEquals(a, b) {
  return Math.abs(a - b) < 1e-5;
}
var _Engine = class {
  constructor(getVoxel, testFluid, options) {
    this.getVoxel = getVoxel;
    this.testFluid = testFluid;
    this.options = options;
    this.bodies = [];
    this.addBody = (options) => {
      const defaultOptions = {
        aabb: new import_aabb.AABB(0, 0, 0, 1, 1, 1),
        mass: 1,
        friction: 1,
        restitution: 0,
        gravityMultiplier: 1,
        stepHeight: 0
      };
      const {
        aabb,
        mass,
        friction,
        restitution,
        gravityMultiplier,
        stepHeight,
        onStep,
        onCollide
      } = {
        ...defaultOptions,
        ...options
      };
      const b = new RigidBody(
        aabb,
        mass,
        friction,
        restitution,
        gravityMultiplier,
        stepHeight,
        onStep,
        onCollide
      );
      this.bodies.push(b);
      return b;
    };
    this.removeBody = (body) => {
      const i = this.bodies.indexOf(body);
      if (i < 0)
        return void 0;
      this.bodies.splice(i, 1);
    };
    this.update = (dt) => {
      const noGravity = approxEquals(
        0,
        this.options.gravity[0] ** 2 + this.options.gravity[1] ** 2 + this.options.gravity[2] ** 2
      );
      this.bodies.forEach((b) => this.iterateBody(b, dt, noGravity));
    };
    this.iterateBody = (body, dt, noGravity) => {
      const oldResting = [...body.resting];
      if (body.mass <= 0) {
        body.velocity = [0, 0, 0];
        body.forces = [0, 0, 0];
        body.impulses = [0, 0, 0];
        return;
      }
      const localNoGrav = noGravity || body.gravityMultiplier === 0;
      if (this.isBodyAsleep(body, dt, localNoGrav))
        return;
      body.sleepFrameCount--;
      this.applyFluidForces(body);
      const a = [
        body.forces[0] / body.mass + this.options.gravity[0] * body.gravityMultiplier,
        body.forces[1] / body.mass + this.options.gravity[1] * body.gravityMultiplier,
        body.forces[2] / body.mass + this.options.gravity[2] * body.gravityMultiplier
      ];
      const dv = [
        body.impulses[0] / body.mass + a[0] * dt,
        body.impulses[1] / body.mass + a[1] * dt,
        body.impulses[2] / body.mass + a[2] * dt
      ];
      body.velocity = [
        body.velocity[0] + dv[0],
        body.velocity[1] + dv[1],
        body.velocity[2] + dv[2]
      ];
      if (body.friction) {
        this.applyFrictionByAxis(0, body, dv);
        this.applyFrictionByAxis(1, body, dv);
        this.applyFrictionByAxis(2, body, dv);
      }
      let drag = body.airDrag >= 0 ? body.airDrag : this.options.airDrag;
      if (body.inFluid) {
        drag = body.fluidDrag >= 0 ? body.fluidDrag : this.options.fluidDrag;
        drag *= 1 - (1 - body.ratioInFluid) ** 2;
      }
      const mult = Math.max(1 - drag * dt / body.mass, 0);
      body.velocity = [
        body.velocity[0] * mult,
        body.velocity[1] * mult,
        body.velocity[2] * mult
      ];
      const dx = [
        body.velocity[0] * dt,
        body.velocity[1] * dt,
        body.velocity[2] * dt
      ];
      body.forces = [0, 0, 0];
      body.impulses = [0, 0, 0];
      const tmpBox = body.aabb.clone();
      this.processCollisions(body.aabb, dx, body.resting);
      if (body.stepHeight > 0) {
        this.tryAutoStepping(body, tmpBox, dx);
      }
      const impacts = [0, 0, 0];
      for (let i = 0; i < 3; ++i) {
        if (body.resting[i]) {
          if (!oldResting[i])
            impacts[i] = -body.velocity[i];
          body.velocity[i] = 0;
        }
      }
      const mag = Math.sqrt(impacts[0] ** 2 + impacts[1] ** 2 + impacts[2] ** 2);
      if (mag > 1e-3) {
        impacts[0] = impacts[0] * body.mass;
        impacts[1] = impacts[1] * body.mass;
        impacts[2] = impacts[2] * body.mass;
        if (body.onCollide)
          body.onCollide(impacts);
        if (body.restitution > 0 && mag > this.options.minBounceImpulse) {
          impacts[0] = impacts[0] * body.restitution;
          impacts[1] = impacts[1] * body.restitution;
          impacts[2] = impacts[2] * body.restitution;
          body.applyImpulse(impacts);
        }
      }
      const vsq = body.velocity[0] ** 2 + body.velocity[1] ** 2 + body.velocity[2] ** 2;
      if (vsq > 1e-5)
        body.markActive();
    };
    this.applyFluidForces = (body) => {
      const box = body.aabb;
      const cx = Math.floor(box.minX);
      const cz = Math.floor(box.minZ);
      const y0 = Math.floor(box.minY);
      const y1 = Math.floor(box.maxY);
      if (!this.testFluid(cx, y0, cz)) {
        body.inFluid = false;
        body.ratioInFluid = 0;
        return;
      }
      let submerged = 1;
      let cy = y0 + 1;
      while (cy <= y1 && this.testFluid(cx, cy, cz)) {
        submerged++;
        cy++;
      }
      const fluidLevel = y0 + submerged;
      const heightInFluid = fluidLevel - box.minY;
      let ratioInFluid = heightInFluid / (box.maxY - box.minY);
      if (ratioInFluid > 1)
        ratioInFluid = 1;
      const vol = (box.maxX - box.minX) * (box.maxY - box.minY) * (box.maxZ - box.minZ);
      const displaced = vol * ratioInFluid;
      const scale = -this.options.fluidDensity * displaced;
      const f = [
        this.options.gravity[0] * scale,
        this.options.gravity[1] * scale,
        this.options.gravity[2] * scale
      ];
      body.applyForce(f);
      body.inFluid = true;
      body.ratioInFluid = ratioInFluid;
    };
    this.applyFrictionByAxis = (axis, body, dvel) => {
      const restDir = body.resting[axis];
      const vNormal = dvel[axis];
      if (restDir === 0)
        return;
      if (restDir * vNormal <= 0)
        return;
      const lateralVel = [...body.velocity];
      lateralVel[axis] = 0;
      const vCurr = Math.sqrt(
        lateralVel[0] ** 2 + lateralVel[1] ** 2 + lateralVel[2] ** 2
      );
      if (approxEquals(vCurr, 0))
        return;
      const dvMax = Math.abs(body.friction * vNormal);
      const scalar = vCurr > dvMax ? (vCurr - dvMax) / vCurr : 0;
      body.velocity[(axis + 1) % 3] *= scalar;
      body.velocity[(axis + 2) % 3] *= scalar;
    };
    this.processCollisions = (box, velocity, resting) => {
      resting[0] = 0;
      resting[1] = 0;
      resting[2] = 0;
      sweep(
        this.getVoxel,
        box,
        velocity,
        function(_, axis, dir, vec) {
          resting[axis] = dir;
          vec[axis] = 0;
          return false;
        }
      );
    };
    this.tryAutoStepping = (body, oldBox, dx) => {
      if (body.resting[1] >= 0 && !body.inFluid)
        return;
      const xBlocked = body.resting[0] !== 0;
      const zBlocked = body.resting[2] !== 0;
      if (!(xBlocked || zBlocked))
        return;
      const targetPos = [
        oldBox.minX + dx[0],
        oldBox.minY + dx[1],
        oldBox.minZ + dx[2]
      ];
      let voxel = [];
      sweep(
        this.getVoxel,
        oldBox,
        dx,
        function(_, axis, dir, vec, vox) {
          if (axis === 1) {
            vec[axis] = 0;
            return false;
          } else {
            voxel = vox || [];
            return true;
          }
        }
      );
      const y = body.aabb.minY;
      let maxStep = 0;
      if (voxel) {
        const aabbs = this.getVoxel(voxel[0], voxel[1], voxel[2]);
        aabbs.forEach((a) => {
          if (a.maxY > maxStep)
            maxStep = a.maxY;
        });
      }
      const yDist = Math.floor(y) + maxStep - y + _Engine.EPSILON;
      const upVec = [0, Math.min(yDist, body.stepHeight + 1e-3), 0];
      let collided = false;
      sweep(this.getVoxel, oldBox, upVec, function() {
        collided = true;
        return true;
      });
      if (collided) {
        return;
      }
      const leftover = [
        targetPos[0] - oldBox.minX,
        targetPos[1] - oldBox.minY,
        targetPos[2] - oldBox.minZ
      ];
      leftover[1] = 0;
      const tmpResting = [0, 0, 0];
      this.processCollisions(oldBox, leftover, tmpResting);
      if (xBlocked && !approxEquals(oldBox.minX, targetPos[0]))
        return;
      if (zBlocked && !approxEquals(oldBox.minZ, targetPos[2]))
        return;
      const temp = oldBox.clone();
      sweep(this.getVoxel, temp, [0, -yDist, 0], (dist) => {
        if (dist > _Engine.EPSILON)
          oldBox.translate([0, -dist + _Engine.EPSILON, 0]);
        return true;
      });
      body.resting[0] = tmpResting[0];
      body.resting[2] = tmpResting[2];
      if (body.onStep)
        body.onStep(oldBox, tmpResting);
      else
        body.aabb = oldBox.clone();
    };
    this.isBodyAsleep = (body, dt, noGravity) => {
      if (body.sleepFrameCount > 0)
        return false;
      if (noGravity)
        return true;
      let isResting = false;
      const gMult = 0.5 * dt * dt * body.gravityMultiplier;
      const sleepVec = [
        this.options.gravity[0] * gMult,
        this.options.gravity[1] * gMult,
        this.options.gravity[2] * gMult
      ];
      sweep(
        this.getVoxel,
        body.aabb,
        sleepVec,
        function() {
          isResting = true;
          return true;
        },
        false
      );
      return isResting;
    };
    this.teleport = (body, position, duration) => {
      const frames = 1e3;
      const old = body.getPosition();
      const dx = (position[0] - old[0]) / frames;
      const dy = (position[1] - old[1]) / frames;
      const dz = (position[2] - old[2]) / frames;
      setInterval(() => {
        body.aabb.translate([dx, dy, dz]);
      }, duration / frames);
    };
  }
};
var Engine = _Engine;
Engine.EPSILON = 1e-10;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Engine,
  RigidBody,
  sweep
});
