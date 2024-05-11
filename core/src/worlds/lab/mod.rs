mod components;
mod stage;
mod systems;

use nanoid::nanoid;
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use specs::{Builder, DispatcherBuilder, Join, WorldExt};
use voxelize::{
    BroadcastSystem, ChunkGeneratingSystem, ChunkRequestsSystem, ChunkSavingSystem,
    ChunkSendingSystem, ChunkUpdatingSystem, CleanupSystem, CurrentChunkSystem, DataSavingSystem,
    EntitiesMetaSystem, EntitiesSendingSystem, EntityFlag, EventsSystem, InteractorComp,
    PeersMetaSystem, PeersSendingSystem, PhysicsSystem, PositionComp, Registry, RigidBody,
    RigidBodyComp, UpdateStatsSystem, Vec3, World, WorldConfig, AABB,
};

use self::{
    components::{
        BoidAlignment, BoidBounding, BoidCohesion, BoidFlag, BoidMaxForce, BoidMaxSpeed,
        BoidPerceptionRadius, BoidSeparation, BoidVelocity,
    },
    stage::GridLandStage,
    systems::{BoidsMetadataSystem, BoidsSystem},
};
use crate::constants::get_preload_radius;

use super::shared::{
    client::setup_client,
    components::{setup_components, RotationComp},
    entities::setup_entities,
    methods::setup_methods,
    EntityObserveSystem, EntityTreeSystem, ExtraPeerMetaSystem, PathFindingSystem,
    PathMetadataSystem, RotationMetadataSystem, TargetMetadataSystem, TextMetadataSystem,
    VoidKillSystem, WalkTowardsSystem,
};

#[derive(Serialize, Deserialize, Debug)]
struct SpawnMethodPayload {
    position: Vec3<f32>,
}

pub fn setup_lab_world(registry: &Registry) -> World {
    let config = WorldConfig::new()
        .preload(true)
        .preload_radius(get_preload_radius())
        .min_chunk([-12, -12])
        .max_chunk([11, 11])
        .time_per_day(2400)
        .default_time(1200.0)
        .max_updates_per_tick(100)
        .saving(true)
        .save_dir("data/worlds/lab")
        .build();

    let mut world = World::new("lab", &config);

    world.ecs_mut().register::<BoidFlag>();
    world.ecs_mut().register::<BoidSeparation>();
    world.ecs_mut().register::<BoidAlignment>();
    world.ecs_mut().register::<BoidCohesion>();
    world.ecs_mut().register::<BoidBounding>();
    world.ecs_mut().register::<BoidMaxSpeed>();
    world.ecs_mut().register::<BoidMaxForce>();
    world.ecs_mut().register::<BoidPerceptionRadius>();
    world.ecs_mut().register::<BoidVelocity>();

    world.set_entity_loader("boid", |world, metadata| {
        let mut body = RigidBody::new(&AABB::new().scale_x(0.5).scale_y(0.5).scale_z(0.5).build())
            .gravity_multiplier(0.0)
            .build();

        body.air_drag = 0.5;

        let mut rng = thread_rng();
        let scale = 5.0;
        body.velocity = Vec3(
            rng.gen_range(-scale..scale),
            rng.gen_range(-scale..scale),
            rng.gen_range(-scale..scale),
        );

        let interactor = world.physics_mut().register(&body);

        world
            .create_entity(&nanoid!(), "boid")
            .with(BoidFlag)
            .with(metadata.get::<PositionComp>("position").unwrap_or_default())
            .with(metadata.get::<RotationComp>("rotation").unwrap_or_default())
            .with(RigidBodyComp::new(&body))
            .with(BoidSeparation(0.28, 2.0))
            .with(BoidAlignment(0.28))
            .with(BoidCohesion(0.28))
            .with(BoidMaxSpeed(28.0))
            .with(BoidMaxForce(80.0))
            .with(BoidBounding(Vec3(-64, 50, -64), Vec3(-32, 60, -32), 25.6))
            .with(BoidPerceptionRadius(30.0))
            .with(BoidVelocity(Vec3(0.0, 0.0, 0.0)))
            .with(InteractorComp::new(&interactor))
    });

    world.set_method_handle("spawn-boid", |world, _, payload| {
        let data: SpawnMethodPayload = serde_json::from_str(&payload).unwrap();
        world.spawn_entity_at("boid", &data.position);
    });

    world.set_method_handle("kill-all-boids", |world, _, _| {
        let boid_entities = world
            .ecs()
            .entities()
            .join()
            .filter(|entity| {
                world
                    .ecs()
                    .read_storage::<EntityFlag>()
                    .get(*entity)
                    .is_some()
                    && world
                        .ecs()
                        .read_storage::<BoidFlag>()
                        .get(*entity)
                        .is_some()
            })
            .collect::<Vec<_>>();

        for entity in boid_entities {
            world
                .ecs_mut()
                .delete_entity(entity)
                .expect("Failed to delete entity");
        }
    });

    world.set_dispatcher(|| {
        DispatcherBuilder::new()
            .with(VoidKillSystem, "void-kill", &[])
            .with(UpdateStatsSystem, "update-stats", &[])
            .with(EntityObserveSystem, "entity-observe", &[])
            .with(PathFindingSystem, "path-finding", &["entity-observe"])
            .with(TextMetadataSystem, "text-meta", &[])
            .with(TargetMetadataSystem, "target-meta", &[])
            .with(RotationMetadataSystem, "rotation-meta", &[])
            .with(PathMetadataSystem, "path-meta", &[])
            .with(BoidsMetadataSystem, "boids-metadata", &[])
            .with(EntityTreeSystem, "entity-tree", &[])
            .with(WalkTowardsSystem, "walk-towards", &["path-finding"])
            .with(
                EntitiesMetaSystem,
                "entities-meta",
                &[
                    "text-meta",
                    "target-meta",
                    "rotation-meta",
                    "path-meta",
                    "boids-metadata",
                    "entity-observe",
                    "entity-tree",
                    "walk-towards",
                ],
            )
            .with(PeersMetaSystem, "peers-meta", &[])
            .with(ExtraPeerMetaSystem, "peers-extra-meta", &[])
            .with(CurrentChunkSystem, "current-chunk", &[])
            .with(ChunkUpdatingSystem, "chunk-updating", &["current-chunk"])
            .with(ChunkRequestsSystem, "chunk-requests", &["current-chunk"])
            .with(
                ChunkGeneratingSystem,
                "chunk-generation",
                &["chunk-requests"],
            )
            .with(ChunkSendingSystem, "chunk-sending", &["chunk-generation"])
            .with(ChunkSavingSystem, "chunk-saving", &["chunk-generation"])
            .with(PhysicsSystem, "physics", &["current-chunk", "update-stats"])
            .with(DataSavingSystem, "entities-saving", &["entities-meta"])
            .with(
                EntitiesSendingSystem,
                "entities-sending",
                &["entities-meta"],
            )
            .with(
                PeersSendingSystem,
                "peers-sending",
                &["peers-meta", "peers-extra-meta"],
            )
            .with(
                BroadcastSystem,
                "broadcast",
                &["chunk-sending", "entities-sending", "peers-sending"],
            )
            .with(
                CleanupSystem,
                "cleanup",
                &["entities-sending", "peers-sending"],
            )
            .with(EventsSystem, "events", &["broadcast"])
            .with(BoidsSystem, "boids", &[])
    });

    setup_components(&mut world);
    setup_entities(&mut world);
    setup_methods(&mut world);
    setup_client(&mut world);

    {
        let mut pipeline = world.pipeline_mut();
        pipeline.add_stage(GridLandStage::new().add_soiling(51, 50).set_grid(32, 56))
    }

    world
}
