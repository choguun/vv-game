use specs::{ReadExpect, System, WriteExpect};

use crate::{Chunks, WorldConfig};

pub struct ChunkSavingSystem;

impl<'a> System<'a> for ChunkSavingSystem {
    type SystemData = (ReadExpect<'a, WorldConfig>, WriteExpect<'a, Chunks>);

    fn run(&mut self, data: Self::SystemData) {
        let (config, mut chunks) = data;

        if !config.saving {
            return;
        }

        let mut count = 0;

        while !chunks.to_save.is_empty() && count < config.max_saves_per_tick {
            count += 1;

            if let Some(coords) = chunks.to_save.pop_front() {
                if !chunks.save(&coords) {
                    chunks.add_chunk_to_save(&coords, false);
                }
            }
        }
    }
}
