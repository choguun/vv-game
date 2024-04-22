import { useEffect } from 'react';

import WallJumpSFX from '../assets/sounds/game/walljump.ogg';
import { useAudio } from '../hooks/useAudio';
import { useVoxelize } from '../hooks/useVoxelverses';

const WALL_JUMP_IMPULSE = 16;
const WALL_JUMP_UP_IMPULSE = 20;

export const Agility = () => {
  const { rigidControls, inputs, config } = useVoxelize();
  const { playAudio } = useAudio();

  useEffect(() => {
    if (!inputs || !rigidControls || !config) return;

    const unbind = inputs.bind(
      ' ',
      () => {
        if (!config.canWallJump) return;

        const [rx, ry, rz] = rigidControls.body.resting;

        if (ry === -1) return;

        if (rx !== 0 || rz !== 0) {
          rigidControls.body.applyImpulse([
            -rx * WALL_JUMP_IMPULSE,
            WALL_JUMP_UP_IMPULSE,
            -rz * WALL_JUMP_IMPULSE,
          ]);
          playAudio(WallJumpSFX, 0.2);
        }
      },
      'in-game',
      { identifier: 'WALL_JUMP' },
    );

    return () => {
      unbind();
    };
  }, [inputs, rigidControls, playAudio, config]);

  return <></>;
};
