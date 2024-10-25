use kdtree::{distance::squared_euclidean, KdTree};
use log::info;
use serde::Serialize;
use splines::interpolate::Interpolator;

use crate::WorldConfig;

use super::{
    noise::{NoiseOptions, SeededNoise},
    spline::SplineMap,
};

#[derive(PartialEq, Clone)]
pub struct Biome {
    pub name: String,
    pub test_block: String,
}

impl Biome {
    pub fn new(name: &str, test_block: &str) -> Self {
        Self {
            name: name.to_owned(),
            test_block: test_block.to_owned(),
        }
    }
}

/// A seeded layered terrain for Voxelize world generation.
#[derive(Clone)]
pub struct Terrain {
    config: WorldConfig,
    noise: SeededNoise,
    biome_tree: KdTree<f64, Biome, Vec<f64>>,
    pub layers: Vec<(TerrainLayer, f64)>,
    pub noise_layers: Vec<(TerrainLayer, f64)>,
}

impl Terrain {
    /// Create a new instance of the seeded terrain.
    pub fn new(config: &WorldConfig) -> Self {
        Self {
            config: config.to_owned(),
            noise: SeededNoise::new(config.seed, &config.terrain),
            biome_tree: KdTree::new(2),
            layers: vec![],
            noise_layers: vec![],
        }
    }

    /// Add a terrain layer to the voxelize terrain.
    pub fn add_layer(&mut self, layer: &TerrainLayer, weight: f64) -> &mut Self {
        // Map the last layer's bias and offset to -1 to 1.
        // if !self.layers.is_empty() {
        //     let (mut last_layer, last_weight) = self.layers.pop().unwrap();
        //     last_layer.normalize();
        //     self.layers.push((last_layer, last_weight));
        // }

        if self.biome_tree.size() > 0 {
            panic!("Terrain layers must be added before biomes.");
        }

        let mut layer = layer.to_owned();
        layer.set_seed(self.config.seed);
        // layer.normalize();
        self.layers.push((layer, weight));

        self.biome_tree = KdTree::new(self.layers.len());

        self
    }

    /// Add a noise layer to the voxelize terrain.
    pub fn add_noise_layer(&mut self, layer: &TerrainLayer, weight: f64) -> &mut Self {
        let mut layer = layer.to_owned();
        layer.set_seed(self.config.seed);
        self.noise_layers.push((layer, weight));

        self
    }

    pub fn add_biome(&mut self, point: &[f64], biome: Biome) -> &mut Self {
        let point_vec = point.to_vec();
        let point_vec = point_vec[..self.layers.len()]
            .into_iter()
            .enumerate()
            .map(|(idx, val)| self.layers[idx].1 * val)
            .collect::<Vec<f64>>()
            .to_owned();

        self.biome_tree.add(point_vec, biome).unwrap();
        self
    }

    /// Get the voxel density at a voxel coordinate, which does the following:
    /// 1. Calculate the height bias and height offset of each terrain layer.
    /// 2. Obtain the average height bias and height offset at this specific voxel column.
    /// 3. Get the noise value at this specific voxel coordinate, and add the average bias and height to it.
    pub fn get_density_from_bias_offset(&self, bias: f64, offset: f64, vy: i32) -> f64 {
        let max_height = self.config.max_height as f64;

        // self.noise.get3d(vx, vy, vz).powi(2)
        -if self.layers.is_empty() {
            0.0
        } else {
            bias * (vy as f64 - offset * max_height) / (offset * max_height)
        }
    }

    /// Get the height bias and height offset values at a voxel column. What it does is that it samples the bias and offset
    /// of all noise layers and take the average of them all.
    pub fn get_bias_offset(&self, vx: i32, vy: i32, vz: i32) -> (f64, f64) {
        let mut bias = 0.0;
        let mut offset = 0.0;
        let mut total_weight = 0.0;

        self.layers.iter().for_each(|(layer, weight)| {
            let value = if layer.options.dimension == 2 {
                layer.noise.get2d(vx, vz)
            } else {
                layer.noise.get3d(vx, vy, vz)
            };
            bias += layer.sample_bias(value) * weight;
            offset += layer.sample_offset(value) * weight;
            total_weight += weight;
        });

        self.noise_layers.iter().for_each(|(layer, weight)| {
            let value = if layer.options.dimension == 2 {
                layer.noise.get2d(vx, vz)
            } else {
                layer.noise.get3d(vx, vy, vz)
            };
            bias += layer.sample_bias(value) * weight;
            offset += layer.sample_offset(value) * weight;
            total_weight += weight;
        });

        (bias / total_weight, offset / total_weight)
    }

    pub fn get_biome_at(&self, vx: i32, vy: i32, vz: i32) -> &Biome {
        let values = self
            .layers
            .iter()
            .map(|(layer, weight)| {
                (if layer.options.dimension == 2 {
                    layer.noise.get2d(vx, vz)
                } else {
                    layer.noise.get3d(vx, vy, vz)
                }) * weight
            })
            .collect::<Vec<f64>>();

        let result = self
            .biome_tree
            .nearest(&values, 1, &squared_euclidean)
            .unwrap()[0];

        result.1
    }
}

/// A layer to the terrain. Consists of two spline graphs: height bias and height offset graphs.
/// Height bias is how much terrain should be compressed as y-coordinate increases, and height offset is
/// by how much should the entire terrain shift up and down.
#[derive(Clone, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TerrainLayer {
    pub name: String,
    #[serde(skip_serializing)]
    pub noise: SeededNoise,
    pub options: NoiseOptions,
    pub height_bias_spline: SplineMap,
    pub height_offset_spline: SplineMap,
}

impl TerrainLayer {
    /// Create a new terrain layer from a specific noise configuration. The noise options are used for this layer
    /// to be mapped to the height bias and height offset spline graphs.
    pub fn new(name: &str, options: &NoiseOptions) -> Self {
        TerrainLayer {
            name: name.to_owned(),
            noise: SeededNoise::new(0, options),
            options: options.to_owned(),
            height_bias_spline: SplineMap::default(),
            height_offset_spline: SplineMap::default(),
        }
    }

    /// Add a point to the bias spline graph.
    pub fn add_bias_point(mut self, point: [f64; 2]) -> Self {
        self.height_bias_spline.add(point[0], point[1]);
        self
    }

    /// Add a set of points to the bias spline graph.
    pub fn add_bias_points(mut self, points: &[[f64; 2]]) -> Self {
        points.into_iter().for_each(|point| {
            self.height_bias_spline.add(point[0], point[1]);
        });
        self
    }

    /// Add a point to the height offset spline graph.
    pub fn add_offset_point(mut self, point: [f64; 2]) -> Self {
        self.height_offset_spline.add(point[0], point[1]);
        self
    }

    /// Add a set of points to the height offset spline graph.
    pub fn add_offset_points(mut self, points: &[[f64; 2]]) -> Self {
        points.into_iter().for_each(|point| {
            self.height_offset_spline.add(point[0], point[1]);
        });
        self
    }

    /// Sample the bias at a certain x-value.
    pub fn sample_bias(&self, x: f64) -> f64 {
        self.height_bias_spline.sample(x)
    }

    /// Sample the offset at a certain x-value.
    pub fn sample_offset(&self, x: f64) -> f64 {
        self.height_offset_spline.sample(x)
    }

    /// Set the seed of the noise generator.
    pub fn set_seed(&mut self, seed: u32) {
        self.noise.set_seed(seed);
    }

    /// Normalize the spline graphs.
    pub fn normalize(&mut self) {
        self.height_bias_spline.rescale_values(-1.0, 1.0);
        self.height_offset_spline.rescale_values(-1.0, 1.0);
    }
}
