use specs::{ReadStorage, System, WriteStorage};
use voxelize::{MetadataComp, RigidBodyComp};

use crate::worlds::lab::components::BoidVelocity;

pub struct BoidsMetadataSystem;

impl<'a> System<'a> for BoidsMetadataSystem {
    type SystemData = (
        ReadStorage<'a, BoidVelocity>,
        WriteStorage<'a, MetadataComp>,
    );

    fn run(&mut self, data: Self::SystemData) {
        use rayon::prelude::*;
        use specs::ParJoin;

        let (velocities, mut metadatas) = data;

        (&velocities, &mut metadatas)
            .par_join()
            .for_each(|(velocity, metadata)| {
                metadata.set("velocity", velocity);
            });
    }
}
