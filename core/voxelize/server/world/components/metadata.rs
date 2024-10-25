use hashbrown::HashMap;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use serde_json::{json, Value};
use specs::{Component, VecStorage};

/// A list of chunks that the entity is requesting to generate.
#[derive(Debug, Default, Component, Serialize, Deserialize, Clone)]
#[storage(VecStorage)]
pub struct MetadataComp {
    pub map: HashMap<String, Value>,

    #[serde(skip_serializing)]
    #[serde(skip_deserializing)]
    cache: String,
}

impl MetadataComp {
    /// Create a component of a new list of chunk requests.
    pub fn new() -> Self {
        Self::default()
    }

    pub fn from_map(map: HashMap<String, Value>) -> Self {
        Self {
            map,
            cache: String::new(),
        }
    }

    /// Set a key-value pair in metadata with serde_json::Value
    pub fn set_value(&mut self, component: &str, value: Value) {
        self.map.insert(component.to_owned(), value);
    }

    /// Set a component's metadata using a type that implements Serialize
    pub fn set<T: Serialize>(&mut self, component: &str, data: &T) {
        let value = json!(data);
        self.set_value(component, value);
    }

    /// Retrieve a component's metadata and deserialize it into the desired type
    pub fn get<T: DeserializeOwned>(&self, component: &str) -> Option<T> {
        self.map
            .get(component)
            .and_then(|value| serde_json::from_value(value.clone()).ok())
    }

    /// Convert metadata to JSON string, also caches is current state.
    pub fn to_cached_str(&mut self) -> (String, bool) {
        let mut updated = false;
        let j = self.to_string();

        if self.cache != j {
            updated = true;
        }

        self.cache = j.clone();

        (j, updated)
    }

    /// Get a clean JSON string with no side-effects.
    pub fn to_string(&self) -> String {
        serde_json::to_string(&self.map).unwrap()
    }

    /// Is the metadata empty?
    pub fn is_empty(&self) -> bool {
        self.map.is_empty()
    }

    /// Reset this metadata
    pub fn reset(&mut self) {
        self.map.clear();
    }
}
