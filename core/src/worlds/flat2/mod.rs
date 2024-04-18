mod stage;

use voxelize::{FlatlandStage, Registry, World, WorldConfig};

use crate::constants::get_preload_radius;

use self::stage::GridLandStage;

use super::shared::{
    client::setup_client, components::setup_components, entities::setup_entities,
    methods::setup_methods, systems::setup_dispatcher,
};

pub fn setup_flat2_world(registry: &Registry) -> World {
    let config = WorldConfig::new()
        .preload(true)
        .preload_radius(get_preload_radius())
        .min_chunk([-16, -16])
        .max_chunk([15, 15])
        .time_per_day(2400)
        .max_updates_per_tick(100)
        .saving(true)
        .save_dir("data/worlds/flat2")
        .build();

    let mut world = World::new("flat2", &config);

    setup_components(&mut world);
    setup_entities(&mut world);
    setup_dispatcher(&mut world);
    setup_methods(&mut world);
    setup_client(&mut world);

    {
        let mut pipeline = world.pipeline_mut();
        pipeline.add_stage(
            GridLandStage::new()
                .add_soiling(5002, 10)
                .set_grid(10, 5003),
        )
    }

    world
}
