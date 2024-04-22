// src/index.ts
var _AABB = class {
  constructor(minX, minY, minZ, maxX, maxY, maxZ) {
    this.minX = minX;
    this.minY = minY;
    this.minZ = minZ;
    this.maxX = maxX;
    this.maxY = maxY;
    this.maxZ = maxZ;
    this.getMin = (axis) => {
      if (axis === 0) {
        return this.minX;
      } else if (axis === 1) {
        return this.minY;
      } else if (axis === 2) {
        return this.minZ;
      } else {
        throw new Error("GetMinError: Unknown axis.");
      }
    };
    this.setMin = (axis, value) => {
      if (axis === 0) {
        this.minX = value;
      } else if (axis === 1) {
        this.minY = value;
      } else if (axis === 2) {
        this.minZ = value;
      } else {
        throw new Error("SetMinError: Unknown axis.");
      }
    };
    this.getMax = (axis) => {
      if (axis === 0) {
        return this.maxX;
      } else if (axis === 1) {
        return this.maxY;
      } else if (axis === 2) {
        return this.maxZ;
      } else {
        throw new Error("GetMaxError: Unknown axis.");
      }
    };
    this.setMax = (axis, value) => {
      if (axis === 0) {
        this.maxX = value;
      } else if (axis === 1) {
        this.maxY = value;
      } else if (axis === 2) {
        this.maxZ = value;
      } else {
        throw new Error("SetMaxError: Unknown axis.");
      }
    };
    this.translate = ([dx, dy, dz]) => {
      this.minX += dx;
      this.minY += dy;
      this.minZ += dz;
      this.maxX += dx;
      this.maxY += dy;
      this.maxZ += dz;
      return this;
    };
    this.translateAxis = (axis, delta) => {
      if (axis === 0) {
        this.minX += delta;
        this.maxX += delta;
      } else if (axis === 1) {
        this.minY += delta;
        this.maxY += delta;
      } else if (axis === 2) {
        this.minZ += delta;
        this.maxZ += delta;
      } else {
        throw new Error("TranslateAxisError: Unknown axis.");
      }
      return this;
    };
    this.setPosition = ([px, py, pz]) => {
      this.maxX = px + this.width;
      this.maxY = py + this.height;
      this.maxZ = pz + this.depth;
      this.minX = px;
      this.minY = py;
      this.minZ = pz;
      return this;
    };
    this.intersects = (aabb) => {
      if (aabb.minX >= this.maxX)
        return false;
      if (aabb.minY >= this.maxY)
        return false;
      if (aabb.minZ >= this.maxZ)
        return false;
      if (aabb.maxX <= this.minX)
        return false;
      if (aabb.maxY <= this.minY)
        return false;
      if (aabb.maxZ <= this.minZ)
        return false;
      return true;
    };
    this.touches = (aabb) => {
      const intersection = this.intersection(aabb);
      return intersection !== null && (intersection.width === 0 || intersection.height === 0 || intersection.depth === 0);
    };
    this.union = (aabb) => {
      return new _AABB(
        Math.min(this.minX, aabb.minX),
        Math.min(this.minY, aabb.minY),
        Math.min(this.minZ, aabb.minZ),
        Math.max(this.maxX, aabb.maxX),
        Math.max(this.maxY, aabb.maxY),
        Math.max(this.maxZ, aabb.maxZ)
      );
    };
    this.intersection = (aabb) => {
      return new _AABB(
        Math.max(this.minX, aabb.minX),
        Math.max(this.minY, aabb.minY),
        Math.max(this.minZ, aabb.minZ),
        Math.min(this.maxX, aabb.maxX),
        Math.min(this.maxY, aabb.maxY),
        Math.min(this.maxZ, aabb.maxZ)
      );
    };
    this.clone = () => {
      return new _AABB(
        this.minX,
        this.minY,
        this.minZ,
        this.maxX,
        this.maxY,
        this.maxZ
      );
    };
  }
  get width() {
    return this.maxX - this.minX;
  }
  get height() {
    return this.maxY - this.minY;
  }
  get depth() {
    return this.maxZ - this.minZ;
  }
  get mag() {
    return Math.sqrt(
      (this.maxX - this.minX) ** 2 + (this.maxY - this.minY) ** 2 + (this.maxZ - this.minZ) ** 2
    );
  }
  computeOffsetX(aabb, deltaX) {
    const intersection = this.intersection(aabb);
    if (intersection.height <= 0 || intersection.depth <= 0) {
      return deltaX;
    }
    if (intersection.width >= 0) {
      return 0;
    }
    if (deltaX > 0 && aabb.minX >= this.maxX) {
      return Math.min(aabb.minX - this.maxX, deltaX);
    }
    if (deltaX < 0 && aabb.maxX <= this.minX) {
      return Math.max(aabb.maxX - this.minX, deltaX);
    }
    return deltaX;
  }
  computeOffsetY(aabb, deltaY) {
    const intersection = this.intersection(aabb);
    if (intersection.width <= 0 || intersection.depth <= 0) {
      return deltaY;
    }
    if (intersection.height >= 0) {
      return 0;
    }
    if (deltaY > 0 && aabb.minY >= this.maxY) {
      return Math.min(aabb.minY - this.maxY, deltaY);
    }
    if (deltaY < 0 && aabb.maxY <= this.minY) {
      return Math.max(aabb.maxY - this.minY, deltaY);
    }
    return deltaY;
  }
  computeOffsetZ(aabb, deltaZ) {
    const intersection = this.intersection(aabb);
    if (intersection.width <= 0 || intersection.height <= 0) {
      return deltaZ;
    }
    if (intersection.depth >= 0) {
      return 0;
    }
    if (deltaZ > 0 && aabb.minZ >= this.maxZ) {
      return Math.min(aabb.minZ - this.maxZ, deltaZ);
    }
    if (deltaZ < 0 && aabb.maxZ <= this.minZ) {
      return Math.max(aabb.maxZ - this.minZ, deltaZ);
    }
    return deltaZ;
  }
};
var AABB = _AABB;
AABB.union = (all) => {
  let minX = all[0].minX;
  let minY = all[0].minY;
  let minZ = all[0].minZ;
  let maxX = all[0].maxX;
  let maxY = all[0].maxY;
  let maxZ = all[0].maxZ;
  for (const aabb of all) {
    minX = Math.min(minX, aabb.minX);
    minY = Math.min(minY, aabb.minY);
    minZ = Math.min(minZ, aabb.minZ);
    maxX = Math.max(maxX, aabb.maxX);
    maxY = Math.max(maxY, aabb.maxY);
    maxZ = Math.max(maxZ, aabb.maxZ);
  }
  return new _AABB(minX, minY, minZ, maxX, maxY, maxZ);
};
export {
  AABB
};
