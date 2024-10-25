use serde::Deserialize;
use specs::Entity;
use voxelize::{default_client_parser, World};

use super::components::{RoleComp, ModelComp};

#[derive(Deserialize, Default)]
struct ClientJSON {
    role: String,
    mode: u8,
}

fn client_modifier(world: &mut World, ent: Entity) {
    world.add(ent, RoleComp::default());
    // world.add(ent, ModelComp::default());
}

fn client_parser(world: &mut World, metadata: &str, ent: Entity) {
    // Call the default parser
    default_client_parser(world, metadata, ent.to_owned());

    // Deserialize the metadata into ClientJSON
    let metadata = serde_json::from_str::<ClientJSON>(metadata).unwrap_or_default();

    // Get the components mutably one at a time to avoid borrowing issues
    {
        // Write RoleComp component
        let mut roles = world.write_component::<RoleComp>();
        if let Some(role) = roles.get_mut(ent) {
            role.0 = metadata.role.to_owned();
        }
    }

    // {
    //     // Write ModelComp component
    //     let mut models = world.write_component::<ModelComp>();
    //     if let Some(model) = models.get_mut(ent) {
    //         model.0 = metadata.mode;
    //     }
    // }
}


pub fn setup_client(world: &mut World) {
    world.set_client_parser(client_parser);
    world.set_client_modifier(client_modifier);
}
