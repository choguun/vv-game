use specs::{ReadStorage, System, WriteStorage};
use voxelize::MetadataComp;

use crate::worlds::shared::components::ModelComp;

pub struct ExtraPeerMetaSystem2;

impl<'a> System<'a> for ExtraPeerMetaSystem2 {
    type SystemData = (ReadStorage<'a, ModelComp>, WriteStorage<'a, MetadataComp>);

    fn run(&mut self, data: Self::SystemData) {
        use rayon::prelude::*;
        use specs::ParJoin;

        let (models, mut metadatas) = data;

        (&models, &mut metadatas)
            .par_join()
            .for_each(|(model, metadata)| {
                metadata.set("model", model);
            });
    }
}
