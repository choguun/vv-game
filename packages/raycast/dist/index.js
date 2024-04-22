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
  default: () => src_default,
  raycast: () => raycast,
  raycastAABB: () => raycastAABB
});
module.exports = __toCommonJS(src_exports);
function raycastAABB(origin, normal, aabb, maxDistance = Infinity) {
  const [nx, ny, nz] = normal;
  const t1 = (aabb.minX - origin[0]) / nx;
  const t2 = (aabb.maxX - origin[0]) / nx;
  const t3 = (aabb.minY - origin[1]) / ny;
  const t4 = (aabb.maxY - origin[1]) / ny;
  const t5 = (aabb.minZ - origin[2]) / nz;
  const t6 = (aabb.maxZ - origin[2]) / nz;
  const tMin = Math.max(
    Math.max(Math.min(t1, t2), Math.min(t3, t4)),
    Math.min(t5, t6)
  );
  const tMinAxis = tMin === t1 || tMin === t2 ? 0 : tMin === t3 || tMin === t4 ? 1 : 2;
  const tMax = Math.min(
    Math.min(Math.max(t1, t2), Math.max(t3, t4)),
    Math.max(t5, t6)
  );
  const tMaxAxis = tMin === t1 || tMin === t2 ? 0 : tMin === t3 || tMin === t4 ? 1 : 2;
  if (tMax < 0) {
    return null;
  }
  if (tMin > tMax) {
    return null;
  }
  if (tMin < 0) {
    if (tMax > maxDistance) {
      return null;
    }
    return {
      axis: tMaxAxis,
      distance: tMax
    };
  }
  if (tMin > maxDistance) {
    return null;
  }
  return {
    axis: tMinAxis,
    distance: tMin
  };
}
function raycast(getVoxel, origin, direction, maxDistance) {
  let dx = +direction[0];
  let dy = +direction[1];
  let dz = +direction[2];
  const ds = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (ds === 0) {
    throw new Error("Can't raycast along a zero vector");
  }
  dx /= ds;
  dy /= ds;
  dz /= ds;
  const [ox, oy, oz] = origin;
  let t = 0;
  let ix = Math.floor(ox) | 0;
  let iy = Math.floor(oy) | 0;
  let iz = Math.floor(oz) | 0;
  const stepX = dx > 0 ? 1 : -1;
  const stepY = dy > 0 ? 1 : -1;
  const stepZ = dz > 0 ? 1 : -1;
  const txDelta = Math.abs(1 / dx);
  const tyDelta = Math.abs(1 / dy);
  const tzDelta = Math.abs(1 / dz);
  const xDist = stepX > 0 ? ix + 1 - ox : ox - ix;
  const yDist = stepY > 0 ? iy + 1 - oy : oy - iy;
  const zDist = stepZ > 0 ? iz + 1 - oz : oz - iz;
  let txMax = txDelta < Infinity ? txDelta * xDist : Infinity;
  let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity;
  let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity;
  while (t <= maxDistance) {
    const aabbs = getVoxel(ix, iy, iz) || [];
    let hit;
    aabbs.forEach((aabb) => {
      const result = raycastAABB(
        origin,
        [dx, dy, dz],
        aabb.clone().translate([ix, iy, iz]),
        maxDistance
      );
      if (result) {
        hit = result;
      }
    });
    if (hit) {
      return {
        point: [
          ox + hit.distance * dx,
          oy + hit.distance * dy,
          oz + hit.distance * dz
        ],
        normal: [
          hit.axis === 0 ? -stepX : 0,
          hit.axis === 1 ? -stepY : 0,
          hit.axis === 2 ? -stepZ : 0
        ],
        voxel: [ix, iy, iz]
      };
    }
    if (txMax < tyMax) {
      if (txMax < tzMax) {
        ix += stepX;
        t = txMax;
        txMax += txDelta;
      } else {
        iz += stepZ;
        t = tzMax;
        tzMax += tzDelta;
      }
    } else {
      if (tyMax < tzMax) {
        iy += stepY;
        t = tyMax;
        tyMax += tyDelta;
      } else {
        iz += stepZ;
        t = tzMax;
        tzMax += tzDelta;
      }
    }
  }
  return null;
}
var src_default = raycast;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  raycast,
  raycastAABB
});
