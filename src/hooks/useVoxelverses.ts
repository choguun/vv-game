import { useContext } from 'react';

import { VoxelizeContext } from '../contexts/voxelverses';

export function useVoxelize() {
  return useContext(VoxelizeContext);
}
