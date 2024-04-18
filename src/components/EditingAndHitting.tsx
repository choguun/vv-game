import { useEffect } from 'react';

import { type BlockUpdate, type Coords3 } from '@voxelize/core';
import { Raycaster, Vector2, Vector3 } from 'three';

import BlockSound from '../assets/sounds/game/block.ogg';
import { useAudio } from '../hooks/useAudio';
import { useVoxelize } from '../hooks/useVoxelize';
import { isAdmin } from '../utils/isAdmin';

const maxRadius = 5;
const minRadius = 1;
const worldsToPlace = ['flat', 'flat2', 'terrain'];

export function EditingAndHitting() {
  const {
    worldName,
    voxelInteract,
    debug,
    inputs,
    world,
    itemSlots,
    rigidControls,
    updateHooks,
    setChatItems,
    blockEntities,
    peers,
    camera,
    method,
  } = useVoxelize();

  const { playAudio } = useAudio();

  useEffect(() => {
    if (!world || !updateHooks) {
      return;
    }

    const updatePositions: Coords3[] = [];

    world.addBlockUpdateListener(({ voxel }) => {
      updatePositions.push(voxel);
    });

    updateHooks.push(() => {
      const limit = updatePositions.length > 3 ? 1 : updatePositions.length;
      for (let i = 0; i < limit; i++) {
        const [vx, vy, vz] = updatePositions[i];
        playAudio(BlockSound, 1, new Vector3(vx, vy, vz));
      }
      updatePositions.length = 0;
    });

    // eslint-disable-next-line
  }, [world]);

  useEffect(() => {
    if (
      !voxelInteract ||
      !inputs ||
      !world ||
      !debug ||
      !itemSlots ||
      !rigidControls ||
      !blockEntities ||
      !peers ||
      !camera ||
      !method
    ) {
      return;
    }

    const isUserAdmin = isAdmin();

    const radius = 1;
    const circular = true;
    const ADMINIUM_ID = 10000;

    const canRegularUserPlaceBreak = worldsToPlace.includes(worldName);

    const sendNoBreakMessage = () => {
      setChatItems((prev) => [
        ...prev,
        {
          type: 'chat',
          sender: '[SYSTEM]',
          body: `$gray$Spawn protection!`,
        },
      ]);
    };

    const getAdminCheck = (target: Coords3) => {
      const [vx, vy, vz] = target;

      const id = world.getVoxelAt(vx, vy, vz);
      if (!isUserAdmin && id === ADMINIUM_ID) {
        sendNoBreakMessage();
        return false;
      }

      if ((worldName === 'flat' || worldName === 'flat2' || worldName === 'terrain') && !isUserAdmin) {
        const distFromOrigin = Math.sqrt(vx ** 2 + vz ** 2);
        if (distFromOrigin <= 5) {
          sendNoBreakMessage();
          return false;
        }
      }

      return true;
    };

    const bulkDestroy = () => {
      if (!voxelInteract.target) return;
      if (!isUserAdmin && !canRegularUserPlaceBreak) return;

      const [vx, vy, vz] = voxelInteract.target;

      if (!getAdminCheck([vx, vy, vz])) {
        return;
      }

      const updates: BlockUpdate[] = [];

      for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
          for (let z = -radius; z <= radius; z++) {
            if (circular && x ** 2 + y ** 2 + z ** 2 > radius ** 2 - 1)
              continue;

            const currentId = world.getVoxelAt(vx + x, vy + y, vz + z);

            if (currentId !== 0) {
              updates.push({
                vx: vx + x,
                vy: vy + y,
                vz: vz + z,
                type: 0,
              });
            }
          }
        }
      }

      if (updates.length) world.updateVoxels(updates);
    };

    const bulkPlace = () => {
      if (!voxelInteract.potential) return;
      if (!isUserAdmin && !canRegularUserPlaceBreak) return;

      const {
        voxel: [vx, vy, vz],
        rotation,
        yRotation,
      } = voxelInteract.potential;

      if (!getAdminCheck([vx, vy, vz])) {
        return;
      }

      const updates: BlockUpdate[] = [];
      const block = world.getBlockById(itemSlots.getFocused().content);

      // ban water
      if (block.id === 30000 && !isUserAdmin) {
        return;
      }

      for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
          for (let z = -radius; z <= radius; z++) {
            if (circular && x ** 2 + y ** 2 + z ** 2 > radius ** 2 - 1)
              continue;

            updates.push({
              vx: vx + x,
              vy: vy + y,
              vz: vz + z,
              type: block.id,
              rotation,
              yRotation,
            });
          }
        }
      }

      if (updates.length) world.updateVoxels(updates);
    };

    const maxCols = itemSlots.options.horizontalCount;

    inputs.scroll(
      () => {
        itemSlots.setFocused(0, (itemSlots.focusedCol + 1) % maxCols);
      },
      () => {
        itemSlots.setFocused(0, (itemSlots.focusedCol - 1 + maxCols) % maxCols);
      },
      'in-game',
    );

    if (isUserAdmin) {
      // inputs.scroll(
      //   () => (radius = Math.min(maxRadius, radius + 1)),
      //   () => (radius = Math.max(minRadius, radius - 1)),
      //   'menu',
      // );
    }

    const blocksToSkip = [
      'Youtube',
      'Github',
      'LinkedIn',
      'Twitter',
      'Mail',
      'BuyMeACoffee',
      'Trophy (mc.js)',
      'Trophy (voxelize)',
      'Trophy (modern-graphql-tutorial)',
      'Trophy (mine.js)',
      'Trophy (rust-typescript-template)',
      'Trophy (mc.js-legacy)',
    ];

    inputs.click('right', () => {
      if (!voxelInteract.potential) return;

      const {
        voxel: [vx, vy, vz],
      } = voxelInteract.potential;

      // Check if target block has an action
      if (voxelInteract.target) {
        const [tvx, tvy, tvz] = voxelInteract.target || [0, 0, 0];
        const block = world.getBlockAt(tvx, tvy, tvz);
        if (blocksToSkip.includes(block?.name || '')) return;

        // handle entity right click
        if (block.isEntity) {
          blockEntities.handleRightClickAt(tvx, tvy, tvz);
          return;
        }
      }

      const slot = itemSlots.getFocused();
      const id = slot.content;
      if (!id) return;

      const { aabbs } = world.getBlockById(id);
      if (
        aabbs.find((aabb) =>
          aabb
            .clone()
            .translate([vx, vy, vz])
            .intersects(rigidControls.body.aabb),
        )
      )
        return;

      bulkPlace();
    });

    const raycaster = new Raycaster();

    inputs.click(
      'left',
      () => {
        const allPeerMeshes = peers.children;

        // raycast from camera to mouse position
        raycaster.setFromCamera(new Vector2(), camera);

        // TODO: right now set makes the order ambiguous

        const intersects = raycaster.intersectObjects(allPeerMeshes);
        // for each intersect, go up parent chain until we hit the but not the world / peers
        const intersected = Array.from(
          new Set(
            intersects.map((intersect) => {
              let obj = intersect.object;
              while (
                obj.parent &&
                obj.parent !== world &&
                obj.parent !== peers
              ) {
                obj = obj.parent;
              }
              return {
                object: obj,
                position: intersect.point,
              };
            }),
          ),
        );
        const [targetPeer] = intersected;

        if (targetPeer && targetPeer.object.userData.id) {
          const hitDirection = new Vector3()
            .subVectors(
              targetPeer.position,
              camera.getWorldPosition(new Vector3()),
            )
            .normalize();
          const hitImpulseMagnitude = 15.2; // Use a clear variable for the impulse magnitude
          const hitImpulse = hitDirection.multiplyScalar(hitImpulseMagnitude);
          hitImpulse.y *= 0.6;
          hitImpulse.y = Math.abs(hitImpulse.y);

          method.call('hit-player', {
            id: targetPeer.object.userData.id,
            impulse: hitImpulse.toArray(),
          });
          return;
        }

        const { target } = voxelInteract;
        if (!target) return;
        bulkDestroy();
      },
      'in-game',
    );

    debug.registerDisplay('Edit radius', () => radius);

    // eslint-disable-next-line
  }, [
    debug,
    inputs,
    itemSlots,
    rigidControls,
    voxelInteract,
    world,
    worldName,
  ]);

  return null;
}
