use voxelize::{Chunk, ChunkStage, NoiseOptions, Resources, SeededNoise, Space, VoxelAccess};

/// Custom stage to flatten the center area of the map.
pub struct FlatCenterStage {
    center: (i32, i32),  // Center position (x, z) of the flat area
    size: (i32, i32),    // Size of the flat area (width, height)
    flat_height: f64,    // Height value for the flatland area
}

impl FlatCenterStage {
    pub fn new(center: (i32, i32), size: (i32, i32), flat_height: f64) -> Self {
        Self {
            center,
            size,
            flat_height,
        }
    }
}

impl ChunkStage for FlatCenterStage {
    fn name(&self) -> String {
        "FlatCenterStage".to_owned()
    }

    fn process(&self, mut chunk: Chunk, resources: Resources, _: Option<Space>) -> Chunk {
        let (center_x, center_z) = self.center;
        let (width, height) = self.size;

        for vx in chunk.min.0..chunk.max.0 {
            for vz in chunk.min.2..chunk.max.2 {
                // Check if the voxel (vx, vz) is within the 10x10 flatland region
                if vx >= center_x - width / 2 && vx <= center_x + width / 2 &&
                   vz >= center_z - height / 2 && vz <= center_z + height / 2 {
                    // Set the voxel height to the flat height
                    let flat_y = (self.flat_height * resources.config.max_height as f64) as i32;

                    // Modify the voxels in the flatland area
                    for vy in chunk.min.1..chunk.max.1 {
                        if vy <= flat_y {
                            chunk.set_voxel(vx, vy, vz, resources.registry.get_block_by_name("Coral").id);
                        } else {
                            chunk.set_voxel(vx, vy, vz, resources.registry.get_block_by_name("Air").id);
                        }
                    }
                }
            }
        }

        chunk
    }
}
