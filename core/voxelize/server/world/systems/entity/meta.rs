use specs::{ReadStorage, System, WriteStorage};

use crate::world::components::{
    DirectionComp, EntityFlag, JsonComp, MetadataComp, PositionComp, VoxelComp,
};

pub struct EntitiesMetaSystem;

impl<'a> System<'a> for EntitiesMetaSystem {
    type SystemData = (
        ReadStorage<'a, EntityFlag>,
        ReadStorage<'a, PositionComp>,
        ReadStorage<'a, DirectionComp>,
        ReadStorage<'a, VoxelComp>,
        ReadStorage<'a, JsonComp>,
        WriteStorage<'a, MetadataComp>,
    );

    fn run(&mut self, data: Self::SystemData) {
        use rayon::prelude::*;
        use specs::ParJoin;

        let (flag, positions, directions, voxels, jsons, mut metadatas) = data;

        (&positions, &mut metadatas, &flag)
            .par_join()
            .for_each(|(position, metadata, _)| {
                metadata.set("position", position);
            });

        (&directions, &mut metadatas, &flag)
            .par_join()
            .for_each(|(direction, metadata, _)| {
                metadata.set("direction", direction);
            });

        (&voxels, &jsons, &mut metadatas, &flag)
            .par_join()
            .for_each(|(voxel, json, metadata, _)| {
                metadata.set("voxel", voxel);
                metadata.set("json", json);
            });
    }
}
