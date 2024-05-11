use std::sync::Arc;

use kdtree::{distance::squared_euclidean, KdTree};
use rayon::prelude::*;
use specs::{Join, ParJoin, ReadStorage, System, WriteStorage};
use voxelize::{IDComp, PositionComp, RigidBodyComp, Vec3};

use crate::worlds::lab::components::{
    BoidAlignment, BoidBounding, BoidCohesion, BoidFlag, BoidMaxForce, BoidMaxSpeed,
    BoidPerceptionRadius, BoidSeparation, BoidVelocity,
};

pub struct BoidsSystem;

impl<'a> System<'a> for BoidsSystem {
    type SystemData = (
        ReadStorage<'a, IDComp>,
        ReadStorage<'a, BoidFlag>,
        ReadStorage<'a, BoidSeparation>,
        ReadStorage<'a, BoidAlignment>,
        ReadStorage<'a, BoidCohesion>,
        ReadStorage<'a, BoidBounding>,
        ReadStorage<'a, BoidMaxSpeed>,
        ReadStorage<'a, BoidMaxForce>,
        ReadStorage<'a, BoidPerceptionRadius>,
        WriteStorage<'a, BoidVelocity>,
        WriteStorage<'a, RigidBodyComp>,
    );

    fn run(&mut self, data: Self::SystemData) {
        let (
            ids,
            boid_flags,
            boid_separations,
            boid_alignments,
            boid_cohesions,
            boid_boundings,
            boid_max_speeds,
            boid_max_forces,
            boid_perception_radii,
            mut boid_velocities,
            mut rigid_bodies,
        ) = data;

        let mut boids_tree = KdTree::new(3);
        for (id, rb, _) in (&ids, &rigid_bodies, &boid_flags).join() {
            let pos = rb.0.get_position();
            let success = boids_tree.add(
                [pos.0 as f64, pos.1 as f64, pos.2 as f64],
                (id.0.clone(), pos.clone(), rb.0.velocity.clone()),
            );
            if success.is_err() {
                // DO NOTHING LOL
            }
        }

        (&mut rigid_bodies, &boid_boundings, &boid_flags)
            .par_join()
            .for_each(|(rb, bounding, _)| {
                let mut pos = rb.0.get_position();

                if pos.0 < bounding.0 .0 as f32 {
                    pos.0 = bounding.0 .0 as f32;
                }
                if pos.0 > bounding.1 .0 as f32 {
                    pos.0 = bounding.1 .0 as f32;
                }
                if pos.1 < bounding.0 .1 as f32 {
                    pos.1 = bounding.0 .1 as f32;
                }
                if pos.1 > bounding.1 .1 as f32 {
                    pos.1 = bounding.1 .1 as f32;
                }
                if pos.2 < bounding.0 .2 as f32 {
                    pos.2 = bounding.0 .2 as f32;
                }
                if pos.2 > bounding.1 .2 as f32 {
                    pos.2 = bounding.1 .2 as f32;
                }

                rb.0.set_position(pos.0, pos.1, pos.2);
            });

        for (id, sep, align, coh, bound, max_speed, max_force, percept, rb, _) in (
            &ids,
            &boid_separations,
            &boid_alignments,
            &boid_cohesions,
            &boid_boundings,
            &boid_max_speeds,
            &boid_max_forces,
            &boid_perception_radii,
            &mut rigid_bodies,
            &boid_flags,
        )
            .join()
        {
            let pos = rb.0.get_position();

            let mut alignment: Vec3<f32> = Vec3(0.0, 0.0, 0.0);
            let mut separation = Vec3(0.0, 0.0, 0.0);
            let mut cohesion = Vec3(0.0, 0.0, 0.0);
            let mut bounding = Vec3(0.0, 0.0, 0.0);
            let mut total: i32 = 0;

            let results = boids_tree.within(
                &[pos.0 as f64, pos.1 as f64, pos.2 as f64],
                percept.0 as f64,
                &squared_euclidean,
            );

            if results.is_err() {
                continue;
            }

            let results = results.unwrap();

            for (_, (other_id, other_pos, other_vel)) in results {
                if other_id == &id.0 {
                    continue;
                }

                let vec = pos.clone() - other_pos.clone();

                let dist_to_other_boid = vec.len();
                if dist_to_other_boid >= percept.0 || dist_to_other_boid <= 0.0 {
                    continue;
                }

                alignment += other_vel.clone();
                cohesion += other_pos.clone();

                let dist = vec.len();
                let diff = vec.normalize();
                separation += Vec3(
                    diff.0 / dist / dist,
                    diff.1 / dist / dist,
                    diff.2 / dist / dist,
                );

                total += 1;
            }

            if total > 0 {
                alignment = Vec3(
                    alignment.0 / total as f32,
                    alignment.1 / total as f32,
                    alignment.2 / total as f32,
                );
                alignment = alignment.normalize();
                alignment *= max_speed.0;
                alignment -= rb.0.velocity.clone();
                alignment.limit(max_force.0);
                alignment *= align.0;

                cohesion /= total as f32;
                let desired = cohesion - pos.clone();
                let mut desired = desired.normalize();
                desired *= max_speed.0;
                cohesion = desired - rb.0.velocity.clone();
                cohesion.limit(max_force.0);
                cohesion *= coh.0;

                separation = Vec3(
                    separation.0 / total as f32,
                    separation.1 / total as f32,
                    separation.2 / total as f32,
                );
                separation = separation.normalize();
                separation *= max_speed.0;
                separation -= rb.0.velocity.clone();
                separation.limit(max_force.0);
                separation *= sep.0;
            }

            // calculate bounding force only when outside the bounds
            if pos.0 < bound.0 .0 as f32 + 1.0 {
                bounding.0 = bound.0 .0 as f32 + 1.0 - pos.0;
            } else if pos.0 > bound.1 .0 as f32 - 1.0 {
                bounding.0 = bound.1 .0 as f32 - 1.0 - pos.0;
            }
            if pos.1 < bound.0 .1 as f32 + 1.0 {
                bounding.1 = bound.0 .1 as f32 + 1.0 - pos.1;
            } else if pos.1 > bound.1 .1 as f32 - 1.0 {
                bounding.1 = bound.1 .1 as f32 - 1.0 - pos.1;
            }
            if pos.2 < bound.0 .2 as f32 + 1.0 {
                bounding.2 = bound.0 .2 as f32 + 1.0 - pos.2;
            } else if pos.2 > bound.1 .2 as f32 - 1.0 {
                bounding.2 = bound.1 .2 as f32 - 1.0 - pos.2;
            }
            bounding.limit(bound.2);
            bounding *= bound.2;

            // Apply forces
            let mass = rb.0.mass;
            let inv_mass = 1.0 / mass;
            let acceleration = alignment + cohesion + separation + bounding;
            let force = Vec3(
                acceleration.0 * inv_mass,
                acceleration.1 * inv_mass,
                acceleration.2 * inv_mass,
            );
            rb.0.apply_force(force.0, force.1, force.2);
        }

        (&boid_flags, &mut boid_velocities, &rigid_bodies)
            .par_join()
            .for_each(|(_, velocity, rb)| {
                velocity.0 = rb.0.velocity.clone();
            });
    }
}
