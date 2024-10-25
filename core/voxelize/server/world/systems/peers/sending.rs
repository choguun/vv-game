use specs::{ReadExpect, ReadStorage, System, WriteExpect, WriteStorage};

use crate::{
    ClientFilter, ClientFlag, Clients, IDComp, Message, MessageQueue, MessageType, MetadataComp,
    NameComp, PeerProtocol, Stats, ModelComp,
};

pub struct PeersSendingSystem;

impl<'a> System<'a> for PeersSendingSystem {
    type SystemData = (
        ReadExpect<'a, Clients>,
        WriteExpect<'a, MessageQueue>,
        ReadStorage<'a, ClientFlag>,
        ReadStorage<'a, IDComp>,
        ReadStorage<'a, NameComp>,
        WriteStorage<'a, MetadataComp>,
    );

    fn run(&mut self, data: Self::SystemData) {
        use specs::Join;

        let (clients, mut queue, flag, ids, names, mut metadatas) = data;

        // if clients.len() <= 1 {
        //     return;
        // }

        let mut peers = vec![];
        for (id, name, metadata, _) in (&ids, &names, &mut metadatas, &flag).join() {
            let (json_str, updated) = metadata.to_cached_str();

            if !updated {
                continue;
            }

            peers.push(PeerProtocol {
                id: id.0.to_owned(),
                username: name.0.to_owned(),
                metadata: json_str,
            });

            metadata.reset();
        }

        if peers.is_empty() {
            return;
        }

        queue.push((
            Message::new(&MessageType::Peer).peers(&peers).build(),
            ClientFilter::All,
        ));
    }
}
