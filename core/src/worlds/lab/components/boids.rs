use serde::Serialize;
use specs::{Component, VecStorage};
use voxelize::Vec3;

// factor, desired distance
#[derive(Default, Component)]
#[storage(VecStorage)]
pub struct BoidSeparation(pub f32, pub f32);

#[derive(Default, Component)]
#[storage(VecStorage)]
pub struct BoidAlignment(pub f32);

#[derive(Default, Component)]
#[storage(VecStorage)]
pub struct BoidCohesion(pub f32);

// min/max bounding box for this boid
#[derive(Default, Component)]
#[storage(VecStorage)]
pub struct BoidBounding(pub Vec3<i32>, pub Vec3<i32>, pub f32);

#[derive(Default, Component)]
#[storage(VecStorage)]
pub struct BoidMaxSpeed(pub f32);

#[derive(Default, Component)]
#[storage(VecStorage)]
pub struct BoidMaxForce(pub f32);

#[derive(Default, Component)]
#[storage(VecStorage)]
pub struct BoidPerceptionRadius(pub f32);

#[derive(Default, Component, Serialize)]
#[storage(VecStorage)]
pub struct BoidVelocity(pub Vec3<f32>);
