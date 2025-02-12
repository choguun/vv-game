use voxelize::{
    Block, BlockConditionalPart, BlockDynamicPattern, BlockFace, BlockFaces, BlockRotation,
    BlockRule, BlockRuleLogic, BlockSimpleRule, Registry, Vec3, VoxelPacker, YRotatableSegments,
    AABB, SIX_FACES_NX, SIX_FACES_NZ, SIX_FACES_PX, SIX_FACES_PY, SIX_FACES_PZ,
};

const PLANT_SCALE: f32 = 0.6;

pub fn get_registry() -> Registry {
    let mut registry = Registry::new();

    let slab_top_faces = BlockFaces::six_faces()
        .scale_y(0.5)
        .offset_y(0.5)
        .uv_offset_y(0.5)
        .uv_scale_y(0.5)
        .build();
    let slab_top_aabb = [AABB::new().scale_y(0.5).offset_y(0.5).build()];

    let slab_bottom_faces = BlockFaces::six_faces().scale_y(0.5).uv_scale_y(0.5).build();
    let slab_bottom_aabb = [AABB::new().scale_y(0.5).build()];

    let torch_body_faces = BlockFaces::six_faces()
        .scale_y(0.5)
        .scale_x(0.1)
        .scale_z(0.1)
        .offset_x(0.45)
        .offset_z(0.45)
        .auto_uv_offset(true)
        .suffix("body")
        .build();
    let torch_head_faces = BlockFaces::six_faces()
        .scale_x(0.1)
        .scale_y(0.1)
        .scale_z(0.1)
        .offset_y(0.51)
        .offset_x(0.45)
        .offset_z(0.45)
        .auto_uv_offset(true)
        .suffix("head")
        .build();
    let torch_aabbs = AABB::from_faces(&torch_body_faces);
    let torch_body_faces = torch_body_faces.to_vec();
    let torch_head_faces = torch_head_faces.to_vec();
    let torch_faces = [torch_body_faces, torch_head_faces].concat();

    registry.register_block(
        &Block::new("Torch")
            .id(40000)
            .faces(&torch_faces)
            .aabbs(&[torch_aabbs])
            .is_transparent(true)
            .is_passable(true)
            .torch_light_level(10)
            .build(),
    );

    let grass_faces = BlockFaces::diagonal_faces()
        .scale_horizontal(PLANT_SCALE)
        .scale_vertical(PLANT_SCALE)
        // .to_four()
        .build();

    let fence_id = 50000;
    let fence_base_xz_dimension = 0.2;
    let fence_gate_dimension = 0.15;
    let fence_base_height = 0.6;
    let fence_gate_gap = 0.3;
    let fence_base_faces = BlockFaces::six_faces()
        .scale_y(fence_base_height)
        .scale_x(fence_base_xz_dimension)
        .scale_z(fence_base_xz_dimension)
        .offset_x((1.0 - fence_base_xz_dimension) / 2.0)
        .offset_z((1.0 - fence_base_xz_dimension) / 2.0)
        .auto_uv_offset(true)
        .build();
    let fence_pos_100_faces_bottom = BlockFaces::six_faces()
        .scale_y(fence_gate_dimension)
        .offset_y(fence_base_height / 2.0 - fence_gate_dimension / 2.0 - fence_gate_gap / 2.0)
        .scale_x((1.0 - fence_base_xz_dimension) / 2.0)
        .scale_z(fence_base_xz_dimension / 2.0)
        .offset_x((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension)
        .offset_z((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension / 4.0)
        .auto_uv_offset(true)
        .build();
    let fence_pos_100_faces_top = BlockFaces::six_faces()
        .scale_y(fence_gate_dimension)
        .offset_y(fence_base_height / 2.0 - fence_gate_dimension / 2.0 + fence_gate_gap / 2.0)
        .scale_x((1.0 - fence_base_xz_dimension) / 2.0)
        .scale_z(fence_base_xz_dimension / 2.0)
        .offset_x((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension)
        .offset_z((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension / 4.0)
        .auto_uv_offset(true)
        .build();
    let fence_pos_001_faces_bottom = BlockFaces::six_faces()
        .scale_y(fence_gate_dimension)
        .offset_y(fence_base_height / 2.0 - fence_gate_dimension / 2.0 - fence_gate_gap / 2.0)
        .scale_z((1.0 - fence_base_xz_dimension) / 2.0)
        .scale_x(fence_base_xz_dimension / 2.0)
        .offset_z((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension)
        .offset_x((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension / 4.0)
        .auto_uv_offset(true)
        .build();
    let fence_pos_001_faces_top = BlockFaces::six_faces()
        .scale_y(fence_gate_dimension)
        .offset_y(fence_base_height / 2.0 - fence_gate_dimension / 2.0 + fence_gate_gap / 2.0)
        .scale_z((1.0 - fence_base_xz_dimension) / 2.0)
        .scale_x(fence_base_xz_dimension / 2.0)
        .offset_z((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension)
        .offset_x((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension / 4.0)
        .auto_uv_offset(true)
        .build();
    let fence_neg_100_faces_bottom = BlockFaces::six_faces()
        .scale_y(fence_gate_dimension)
        .offset_y(fence_base_height / 2.0 - fence_gate_dimension / 2.0 - fence_gate_gap / 2.0)
        .scale_x((1.0 - fence_base_xz_dimension) / 2.0)
        .scale_z(fence_base_xz_dimension / 2.0)
        .offset_z((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension / 4.0)
        .auto_uv_offset(true)
        .build();
    let fence_neg_100_faces_top = BlockFaces::six_faces()
        .scale_y(fence_gate_dimension)
        .offset_y(fence_base_height / 2.0 - fence_gate_dimension / 2.0 + fence_gate_gap / 2.0)
        .scale_x((1.0 - fence_base_xz_dimension) / 2.0)
        .scale_z(fence_base_xz_dimension / 2.0)
        .offset_z((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension / 4.0)
        .auto_uv_offset(true)
        .build();
    let fence_neg_001_faces_bottom = BlockFaces::six_faces()
        .scale_y(fence_gate_dimension)
        .offset_y(fence_base_height / 2.0 - fence_gate_dimension / 2.0 - fence_gate_gap / 2.0)
        .scale_z((1.0 - fence_base_xz_dimension) / 2.0)
        .scale_x(fence_base_xz_dimension / 2.0)
        .offset_x((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension / 4.0)
        .auto_uv_offset(true)
        .build();
    let fence_neg_001_faces_top = BlockFaces::six_faces()
        .scale_y(fence_gate_dimension)
        .offset_y(fence_base_height / 2.0 - fence_gate_dimension / 2.0 + fence_gate_gap / 2.0)
        .scale_z((1.0 - fence_base_xz_dimension) / 2.0)
        .scale_x(fence_base_xz_dimension / 2.0)
        .offset_x((1.0 - fence_base_xz_dimension) / 2.0 + fence_base_xz_dimension / 4.0)
        .auto_uv_offset(true)
        .build();
    let fence_pos_100_faces = [
        fence_pos_100_faces_bottom.to_vec(),
        fence_pos_100_faces_top.to_vec(),
    ]
    .concat();
    let fence_pos_001_faces = [
        fence_pos_001_faces_bottom.to_vec(),
        fence_pos_001_faces_top.to_vec(),
    ]
    .concat();
    let fence_neg_100_faces = [
        fence_neg_100_faces_bottom.to_vec(),
        fence_neg_100_faces_top.to_vec(),
    ]
    .concat();
    let fence_neg_001_faces = [
        fence_neg_001_faces_bottom.to_vec(),
        fence_neg_001_faces_top.to_vec(),
    ]
    .concat();
    let fence_base_aabb = AABB::from_faces(&fence_base_faces);
    let fence_pos_100_aabb = AABB::from_faces(&fence_pos_100_faces);
    let fence_neg_100_aabb = AABB::from_faces(&fence_neg_100_faces);
    let fence_pos_001_aabb = AABB::from_faces(&fence_pos_001_faces);
    let fence_neg_001_aabb = AABB::from_faces(&fence_neg_001_faces);
    let fence_dynamic_pattern = BlockDynamicPattern {
        parts: vec![
            BlockConditionalPart {
                rule: BlockRule::None,
                aabbs: vec![fence_base_aabb],
                faces: fence_base_faces.to_vec(),
                is_transparent: [true, true, true, true, true, true],
            },
            BlockConditionalPart {
                rule: BlockRule::Combination {
                    logic: BlockRuleLogic::And,
                    rules: vec![
                        BlockRule::Combination {
                            logic: BlockRuleLogic::Not,
                            rules: vec![BlockRule::Simple(BlockSimpleRule {
                                offset: Vec3(1, 0, 0),
                                id: Some(0),
                                rotation: None,
                                stage: None,
                            })],
                        },
                        BlockRule::Combination {
                            logic: BlockRuleLogic::Not,
                            rules: vec![BlockRule::Simple(BlockSimpleRule {
                                offset: Vec3(1, 0, 0),
                                id: Some(30000),
                                rotation: None,
                                stage: None,
                            })],
                        },
                    ],
                },
                aabbs: vec![fence_pos_100_aabb],
                faces: fence_pos_100_faces.to_vec(),
                is_transparent: [true, true, true, true, true, true],
            },
            BlockConditionalPart {
                rule: BlockRule::Combination {
                    logic: BlockRuleLogic::And,
                    rules: vec![
                        BlockRule::Combination {
                            logic: BlockRuleLogic::Not,
                            rules: vec![BlockRule::Simple(BlockSimpleRule {
                                offset: Vec3(-1, 0, 0),
                                id: Some(0),
                                rotation: None,
                                stage: None,
                            })],
                        },
                        BlockRule::Combination {
                            logic: BlockRuleLogic::Not,
                            rules: vec![BlockRule::Simple(BlockSimpleRule {
                                offset: Vec3(-1, 0, 0),
                                id: Some(30000),
                                rotation: None,
                                stage: None,
                            })],
                        },
                    ],
                },
                aabbs: vec![fence_neg_100_aabb],
                faces: fence_neg_100_faces.to_vec(),
                is_transparent: [true, true, true, true, true, true],
            },
            BlockConditionalPart {
                rule: BlockRule::Combination {
                    logic: BlockRuleLogic::And,
                    rules: vec![
                        BlockRule::Combination {
                            logic: BlockRuleLogic::Not,
                            rules: vec![BlockRule::Simple(BlockSimpleRule {
                                offset: Vec3(0, 0, 1),
                                id: Some(0),
                                rotation: None,
                                stage: None,
                            })],
                        },
                        BlockRule::Combination {
                            logic: BlockRuleLogic::Not,
                            rules: vec![BlockRule::Simple(BlockSimpleRule {
                                offset: Vec3(0, 0, 1),
                                id: Some(30000),
                                rotation: None,
                                stage: None,
                            })],
                        },
                    ],
                },
                aabbs: vec![fence_pos_001_aabb],
                faces: fence_pos_001_faces.to_vec(),
                is_transparent: [true, true, true, true, true, true],
            },
            BlockConditionalPart {
                rule: BlockRule::Combination {
                    logic: BlockRuleLogic::And,
                    rules: vec![
                        BlockRule::Combination {
                            logic: BlockRuleLogic::Not,
                            rules: vec![BlockRule::Simple(BlockSimpleRule {
                                offset: Vec3(0, 0, -1),
                                id: Some(0),
                                rotation: None,
                                stage: None,
                            })],
                        },
                        BlockRule::Combination {
                            logic: BlockRuleLogic::Not,
                            rules: vec![BlockRule::Simple(BlockSimpleRule {
                                offset: Vec3(0, 0, -1),
                                id: Some(30000),
                                rotation: None,
                                stage: None,
                            })],
                        },
                    ],
                },
                aabbs: vec![fence_neg_001_aabb],
                faces: fence_neg_001_faces.to_vec(),
                is_transparent: [true, true, true, true, true, true],
            },
        ],
    };
    let fence_block = Block::new("Fence")
        .id(fence_id)
        .dynamic_patterns(&[fence_dynamic_pattern])
        .is_transparent(true)
        .transparent_standalone(true)
        .build();
    registry.register_block(&fence_block);

    let painting_block_size = 0.3;
    let painting_block_faces = BlockFaces::six_faces()
        .scale_x(painting_block_size)
        .scale_y(painting_block_size)
        .scale_z(painting_block_size)
        .offset_x((1.0 - painting_block_size) / 2.0)
        .offset_z((1.0 - painting_block_size) / 2.0)
        .auto_uv_offset(true)
        .build();
    let painting_block_aabb = AABB::from_faces(&painting_block_faces);
    let painting_block = Block::new("Painting")
        .id(50001)
        .is_transparent(true)
        .faces(&[])
        .aabbs(&[painting_block_aabb])
        .is_entity(true)
        .build();
    registry.register_block(&painting_block);

    let small_display_block_dimensions = (0.8, 0.3, 0.3);
    let small_display_block_faces = BlockFaces::six_faces()
        .scale_x(small_display_block_dimensions.0)
        .scale_y(small_display_block_dimensions.1)
        .scale_z(small_display_block_dimensions.2)
        .offset_x((1.0 - small_display_block_dimensions.0) / 2.0)
        .offset_z((1.0 - small_display_block_dimensions.2) / 2.0)
        .auto_uv_offset(true)
        .independent_at(SIX_FACES_PZ)
        .build();

    let year_percentage_block = Block::new("Year Percentage")
        .id(50002)
        .is_transparent(true)
        .faces(&small_display_block_faces)
        .aabbs(&[AABB::from_faces(&small_display_block_faces)])
        .rotatable(true)
        .y_rotatable(true)
        .build();
    let current_time_block = Block::new("Current Time")
        .id(50003)
        .is_transparent(true)
        .faces(&small_display_block_faces)
        .aabbs(&[AABB::from_faces(&small_display_block_faces)])
        .rotatable(true)
        .y_rotatable(true)
        .build();
    registry.register_blocks(&[year_percentage_block, current_time_block]);

    let portal_faces = BlockFaces::six_faces()
        .scale_x(0.5)
        .offset_x(0.25)
        .independent_at(SIX_FACES_PX)
        .independent_at(SIX_FACES_NX)
        .build();
    let portal_aabb = AABB::from_faces(&portal_faces);

    let portal_block = Block::new("Portal")
        .id(15123)
        .faces(&portal_faces)
        .aabbs(&[portal_aabb.clone()])
        .is_transparent(true)
        .is_see_through(true)
        .is_passable(true)
        .torch_light_level(15)
        .build();
    let portal2_block = Block::new("Portal2")
        .id(15124)
        .faces(&portal_faces)
        .aabbs(&[portal_aabb.clone()])
        .is_transparent(true)
        .is_see_through(true)
        .is_passable(true)
        .torch_light_level(15)
        .build();
    let portal3_block = Block::new("Portal3")
        .id(15125)
        .faces(&portal_faces)
        .aabbs(&[portal_aabb.clone()])
        .is_transparent(true)
        .is_see_through(true)
        .is_passable(true)
        .torch_light_level(15)
        .build();

    registry.register_block(&portal_block);
    registry.register_block(&portal2_block);
    registry.register_block(&portal3_block);

    let make_top_slab = |name: &str, id: u32| {
        Block::new(name)
            .id(id)
            .faces(&slab_top_faces)
            .aabbs(&slab_top_aabb)
            .rotatable(true)
            .is_transparent(true)
            .is_py_transparent(false)
            .build()
    };

    let make_bottom_slab = |name: &str, id: u32| {
        Block::new(name)
            .id(id)
            .faces(&slab_bottom_faces)
            .aabbs(&slab_bottom_aabb)
            .rotatable(true)
            .is_transparent(true)
            .is_ny_transparent(false)
            .build()
    };

    let stairs_base_faces = BlockFaces::six_faces()
        .scale_y(0.5)
        .auto_uv_offset(true)
        .build();
    let stairs_base_aabb = AABB::from_faces(&stairs_base_faces);
    let stairs_top_faces = BlockFaces::six_faces()
        .scale_y(0.5)
        .offset_y(0.5)
        .scale_z(0.5)
        .auto_uv_offset(true)
        .build();
    let stairs_top_aabb = AABB::from_faces(&stairs_top_faces);
    let stairs_aabbs = vec![stairs_base_aabb, stairs_top_aabb];
    let stairs_faces = stairs_base_faces + stairs_top_faces;

    let make_stairs = |name: &str, id: u32| {
        Block::new(name)
            .id(id)
            .faces(&stairs_faces)
            .aabbs(&stairs_aabbs)
            .y_rotatable(true)
            .y_rotatable_segments(&YRotatableSegments::Four)
            .is_transparent(true)
            .build()
    };

    let make_rod = |name: &str, id: u32, width: f32| {
        Block::new(name)
            .id(id)
            .faces(
                &BlockFaces::six_faces()
                    .scale_x(width)
                    .scale_z(width)
                    .uv_scale_x(width)
                    .uv_scale_z(width)
                    .offset_x(0.5 - width / 2.0)
                    .offset_z(0.5 - width / 2.0)
                    .uv_offset_x(0.5 - width / 2.0)
                    .uv_offset_z(0.5 - width / 2.0)
                    .build(),
            )
            .aabbs(&[AABB::new()
                .scale_x(width)
                .scale_z(width)
                .offset_x(0.5 - width / 2.0)
                .offset_z(0.5 - width / 2.0)
                .build()])
            .is_transparent(true)
            .rotatable(true)
            .build()
    };

    registry.register_air_active_fn(
        |_, _, _| 0,
        |voxel, space, registry| {
            let Vec3(vx, vy, vz) = voxel;
            let mut updates = vec![];

            [
                [1, 0, 0],
                [-1, 0, 0],
                [0, 1, 0],
                [0, -1, 0],
                [0, 0, 1],
                [0, 0, -1],
            ]
            .into_iter()
            .for_each(|[dx, dy, dz]| {
                let id = space.get_voxel(vx + dx, vy + dy, vz + dz);

                if id == 0 {
                    return;
                }

                let block = registry.get_block_by_id(id);

                if block.is_active {
                    updates.push((
                        Vec3(vx + dx, vy + dy, vz + dz),
                        space.get_raw_voxel(vx + dx, vy + dy, vz + dz),
                    ));
                }
            });

            let voxel_above = space.get_voxel(vx, vy + 1, vz);

            if voxel_above == 1000 || voxel_above == 400 {
                updates.push((Vec3(vx, vy + 1, vz), 0));
            }

            updates
        },
    );

    registry.register_blocks(&[
        Block::new("Dirt").id(1).build(),
        Block::new("Stone").id(2).build(),
        // Stones
        Block::new("Sand").id(50).build(),
        Block::new("Chalk").id(51).build(),
        Block::new("Quartzite").id(52).build(),
        Block::new("Limestone").id(53).build(),
        Block::new("Andersite").id(54).build(),
        Block::new("Basalt").id(55).build(),
        Block::new("Diorite").id(56).build(),
        Block::new("Gabbro").id(57).build(),
        Block::new("Tuff").id(58).build(),
        Block::new("Pumice").id(59).build(),
        Block::new("Scoria").id(60).build(),
        Block::new("Obsidian").id(61).build(),
        Block::new("Granite").id(62).build(),
        Block::new("Graphite").id(63).build(),
        Block::new("Marble").id(64).build(),
        // Rare Rocks
        Block::new("Blue Lace Agate").id(200).build(),
        Block::new("Onyx Agate").id(201).build(),
        Block::new("Moss Agate").id(202).build(),
        Block::new("Condor Agate").id(203).build(),
        Block::new("Enhydro Agate").id(204).build(),
        Block::new("Sagenite Agate").id(205).build(),
        Block::new("Crazy Lace Agate").id(206).build(),
        Block::new("Adminium")
            .id(10000)
            .torch_light_level(5)
            .faces(&BlockFaces::six_faces().build())
            .build(),
        // Basic
        Block::new("Water")
            .id(30000)
            .is_transparent(true)
            .is_see_through(true)
            .light_reduce(true)
            .is_fluid(true)
            .is_passable(true)
            .faces(&BlockFaces::six_faces().build())
            .dynamic_patterns(&[BlockDynamicPattern {
                parts: vec![
                    BlockConditionalPart {
                        rule: BlockRule::Combination {
                            logic: BlockRuleLogic::And, // Assuming you want an AND logic for demonstration
                            rules: vec![
                                BlockRule::Simple(BlockSimpleRule {
                                    offset: Vec3(0, 1, 0),
                                    id: Some(0),
                                    rotation: None,
                                    stage: None,
                                }),
                                // Add more BlockRule::Simple or BlockRule::Combination here as needed
                            ],
                        },
                        aabbs: vec![AABB::new().scale_y(0.8).build()],
                        faces: BlockFaces::six_faces().scale_y(0.8).build().to_vec(),
                        is_transparent: [true, true, true, true, true, true],
                    },
                    // You can add more BlockConditionalPart here as needed
                ],
            }])
            .aabbs(&[AABB::new().build()])
            .active_fn(
                |_, _, _| 100,
                |voxel, space, _| {
                    let Vec3(vx, vy, vz) = voxel;

                    let curr_stage = space.get_voxel_stage(vx, vy, vz);

                    let mut updates = vec![];

                    if space.get_voxel(vx, vy - 1, vz) == 0 {
                        updates.push((
                            Vec3(vx, vy - 1, vz),
                            VoxelPacker::new().with_id(30000).with_stage(0).pack(),
                        ));
                    } else {
                        [[-1, 0], [1, 0], [0, -1], [0, 1]]
                            .into_iter()
                            .for_each(|[dx, dz]| {
                                if space.get_voxel(vx + dx, vy, vz + dz) == 0 && curr_stage < 2 {
                                    updates.push((
                                        Vec3(vx + dx, vy, vz + dz),
                                        VoxelPacker::new()
                                            .with_id(30000)
                                            .with_stage(curr_stage + 1)
                                            .pack(),
                                    ));
                                }
                            });
                    }

                    updates
                },
            )
            .build(),
        Block::new("Grass Block").id(30001).build(),
        Block::new("Snow").id(30002).build(),
        // plants
        Block::new("Grass")
            .id(30300)
            .aabbs(&[AABB::from_faces(&grass_faces)])
            .is_passable(true)
            .faces(&grass_faces)
            .is_transparent(true)
            .is_see_through(true)
            .transparent_standalone(true)
            .build(),
    ]);

    registry.register_blocks(&[
        make_top_slab("Oak Planks Slab Top", 33000),
        make_bottom_slab("Oak Planks Slab Bottom", 33001),
        make_top_slab("Dirt Slab Top", 100),
        make_bottom_slab("Dirt Slab Bottom", 101),
        make_top_slab("Stone Slab Top", 102),
        make_bottom_slab("Stone Slab Bottom", 103),
        make_top_slab("Sand Slab Top", 104),
        make_bottom_slab("Sand Slab Bottom", 105),
        make_top_slab("Chalk Slab Top", 106),
        make_bottom_slab("Chalk Slab Bottom", 107),
        make_top_slab("Quartzite Slab Top", 108),
        make_bottom_slab("Quartzite Slab Bottom", 109),
        make_top_slab("Limestone Slab Top", 110),
        make_bottom_slab("Limestone Slab Bottom", 111),
        make_top_slab("Andersite Slab Top", 112),
        make_bottom_slab("Andersite Slab Bottom", 113),
        make_top_slab("Basalt Slab Top", 114),
        make_bottom_slab("Basalt Slab Bottom", 115),
        make_top_slab("Diorite Slab Top", 116),
        make_bottom_slab("Diorite Slab Bottom", 117),
        make_top_slab("Gabbro Slab Top", 118),
        make_bottom_slab("Gabbro Slab Bottom", 119),
        make_top_slab("Tuff Slab Top", 120),
        make_bottom_slab("Tuff Slab Bottom", 121),
        make_top_slab("Pumice Slab Top", 122),
        make_bottom_slab("Pumice Slab Bottom", 123),
        make_top_slab("Scoria Slab Top", 124),
        make_bottom_slab("Scoria Slab Bottom", 125),
        make_top_slab("Obsidian Slab Top", 126),
        make_bottom_slab("Obsidian Slab Bottom", 127),
        make_top_slab("Granite Slab Top", 128),
        make_bottom_slab("Granite Slab Bottom", 129),
        make_top_slab("Graphite Slab Top", 130),
        make_bottom_slab("Graphite Slab Bottom", 131),
        make_top_slab("Marble Slab Top", 132),
        make_bottom_slab("Marble Slab Bottom", 133),
        make_top_slab("Blue Lace Agate Slab Top", 134),
        make_bottom_slab("Blue Lace Agate Slab Bottom", 135),
        make_top_slab("Onyx Agate Slab Top", 136),
        make_bottom_slab("Onyx Agate Slab Bottom", 137),
        make_top_slab("Moss Agate Slab Top", 138),
        make_bottom_slab("Moss Agate Slab Bottom", 139),
        make_top_slab("Condor Agate Slab Top", 140),
        make_bottom_slab("Condor Agate Slab Bottom", 141),
        make_top_slab("Enhydro Agate Slab Top", 142),
        make_bottom_slab("Enhydro Agate Slab Bottom", 143),
        make_top_slab("Sagenite Agate Slab Top", 144),
        make_bottom_slab("Sagenite Agate Slab Bottom", 145),
        make_top_slab("Crazy Lace Agate Slab Top", 146),
        make_bottom_slab("Crazy Lace Agate Slab Bottom", 147),
    ]);

    registry.register_blocks(&[
        make_rod("Dirt Rod", 1200, 0.5),
        make_rod("Stone Rod", 1201, 0.5),
        make_rod("Sand Rod", 1202, 0.5),
        make_rod("Chalk Rod", 1203, 0.5),
        make_rod("Quartzite Rod", 1204, 0.5),
        make_rod("Limestone Rod", 1205, 0.5),
        make_rod("Andersite Rod", 1206, 0.5),
        make_rod("Basalt Rod", 1207, 0.5),
        make_rod("Diorite Rod", 1208, 0.5),
        make_rod("Gabbro Rod", 1209, 0.5),
        make_rod("Tuff Rod", 1210, 0.5),
        make_rod("Pumice Rod", 1211, 0.5),
        make_rod("Scoria Rod", 1212, 0.5),
        make_rod("Obsidian Rod", 1213, 0.5),
        make_rod("Granite Rod", 1214, 0.5),
        make_rod("Graphite Rod", 1215, 0.5),
        make_rod("Marble Rod", 1216, 0.5),
        make_rod("Blue Lace Agate Rod", 1217, 0.5),
        make_rod("Onyx Agate Rod", 1218, 0.5),
        make_rod("Moss Agate Rod", 1219, 0.5),
        make_rod("Condor Agate Rod", 1220, 0.5),
        make_rod("Enhydro Agate Rod", 1221, 0.5),
        make_rod("Sagenite Agate Rod", 1222, 0.5),
        make_rod("Crazy Lace Agate Rod", 1223, 0.5),
        make_rod("Dirt Thin Rod", 1224, 0.2),
        make_rod("Stone Thin Rod", 1225, 0.2),
        make_rod("Sand Thin Rod", 1226, 0.2),
        make_rod("Chalk Thin Rod", 1227, 0.2),
        make_rod("Quartzite Thin Rod", 1228, 0.2),
        make_rod("Limestone Thin Rod", 1229, 0.2),
        make_rod("Andersite Thin Rod", 1230, 0.2),
        make_rod("Basalt Thin Rod", 1231, 0.2),
        make_rod("Diorite Thin Rod", 1232, 0.2),
        make_rod("Gabbro Thin Rod", 1233, 0.2),
        make_rod("Tuff Thin Rod", 1234, 0.2),
        make_rod("Pumice Thin Rod", 1235, 0.2),
        make_rod("Scoria Thin Rod", 1236, 0.2),
        make_rod("Obsidian Thin Rod", 1237, 0.2),
        make_rod("Granite Thin Rod", 1238, 0.2),
        make_rod("Graphite Thin Rod", 1239, 0.2),
        make_rod("Marble Thin Rod", 1240, 0.2),
        make_rod("Blue Lace Agate Thin Rod", 1241, 0.2),
        make_rod("Onyx Agate Thin Rod", 1242, 0.2),
        make_rod("Moss Agate Thin Rod", 1243, 0.2),
        make_rod("Condor Agate Thin Rod", 1244, 0.2),
        make_rod("Enhydro Agate Thin Rod", 1245, 0.2),
        make_rod("Sagenite Agate Thin Rod", 1246, 0.2),
        make_rod("Crazy Lace Agate Thin Rod", 1247, 0.2),
    ]);

    registry.register_blocks(&[
        Block::new("Sapphire").id(300).build(),
        Block::new("Emerald").id(301).build(),
        Block::new("Ruby").id(302).build(),
        Block::new("Turquoise").id(303).build(),
        Block::new("Amethyst").id(304).build(),
        Block::new("Jade").id(305).build(),
        Block::new("Coral").id(306).build(),
        Block::new("Lapis Lazuli").id(307).build(),
        Block::new("Malachite").id(308).build(),
        Block::new("Pyrite").id(309).build(),
        Block::new("Flint").id(310).build(),
        Block::new("Moonstone").id(311).torch_light_level(8).build(),
        Block::new("Aquamarine").id(312).build(),
        Block::new("Sunstone")
            .id(313)
            .red_light_level(15)
            .green_light_level(14)
            .blue_light_level(12)
            .build(),
        Block::new("Opal").id(314).build(),
        Block::new("Bloodstone").id(315).build(),
        Block::new("Rose Quartz").id(316).build(),
        Block::new("Iolite").id(317).build(),
        Block::new("Hematite").id(318).build(),
        Block::new("Azurite").id(319).build(),
    ]);

    registry.register_blocks(&[
        make_top_slab("Sapphire Slab Top", 400),
        make_bottom_slab("Sapphire Slab Bottom", 401),
        make_top_slab("Emerald Slab Top", 402),
        make_bottom_slab("Emerald Slab Bottom", 403),
        make_top_slab("Ruby Slab Top", 404),
        make_bottom_slab("Ruby Slab Bottom", 405),
        make_top_slab("Turquoise Slab Top", 406),
        make_bottom_slab("Turquoise Slab Bottom", 407),
        make_top_slab("Amethyst Slab Top", 408),
        make_bottom_slab("Amethyst Slab Bottom", 409),
        make_top_slab("Jade Slab Top", 410),
        make_bottom_slab("Jade Slab Bottom", 411),
        make_top_slab("Coral Slab Top", 412),
        make_bottom_slab("Coral Slab Bottom", 413),
        make_top_slab("Lapis Lazuli Slab Top", 414),
        make_bottom_slab("Lapis Lazuli Slab Bottom", 415),
        make_top_slab("Malachite Slab Top", 416),
        make_bottom_slab("Malachite Slab Bottom", 417),
        make_top_slab("Pyrite Slab Top", 418),
        make_bottom_slab("Pyrite Slab Bottom", 419),
        make_top_slab("Flint Slab Top", 420),
        make_bottom_slab("Flint Slab Bottom", 421),
        make_top_slab("Moonstone Slab Top", 422),
        make_bottom_slab("Moonstone Slab Bottom", 423),
        make_top_slab("Aquamarine Slab Top", 424),
        make_bottom_slab("Aquamarine Slab Bottom", 425),
        make_top_slab("Sunstone Slab Top", 426),
        make_bottom_slab("Sunstone Slab Bottom", 427),
        make_top_slab("Opal Slab Top", 428),
        make_bottom_slab("Opal Slab Bottom", 429),
        make_top_slab("Bloodstone Slab Top", 430),
        make_bottom_slab("Bloodstone Slab Bottom", 431),
        make_top_slab("Rose Quartz Slab Top", 432),
        make_bottom_slab("Rose Quartz Slab Bottom", 433),
        make_top_slab("Iolite Slab Top", 434),
        make_bottom_slab("Iolite Slab Bottom", 435),
        make_top_slab("Hematite Slab Top", 436),
        make_bottom_slab("Hematite Slab Bottom", 437),
        make_top_slab("Azurite Slab Top", 438),
        make_bottom_slab("Azurite Slab Bottom", 439),
    ]);

    registry.register_blocks(&[
        make_rod("Sapphire Rod", 500, 0.5),
        make_rod("Emerald Rod", 501, 0.5),
        make_rod("Ruby Rod", 502, 0.5),
        make_rod("Turquoise Rod", 503, 0.5),
        make_rod("Amethyst Rod", 504, 0.5),
        make_rod("Jade Rod", 505, 0.5),
        make_rod("Coral Rod", 506, 0.5),
        make_rod("Lapis Lazuli Rod", 507, 0.5),
        make_rod("Malachite Rod", 508, 0.5),
        make_rod("Pyrite Rod", 509, 0.5),
        make_rod("Flint Rod", 510, 0.5),
        make_rod("Moonstone Rod", 511, 0.5),
        make_rod("Aquamarine Rod", 512, 0.5),
        make_rod("Sunstone Rod", 513, 0.5),
        make_rod("Opal Rod", 514, 0.5),
        make_rod("Bloodstone Rod", 515, 0.5),
        make_rod("Rose Quartz Rod", 516, 0.5),
        make_rod("Iolite Rod", 517, 0.5),
        make_rod("Hematite Rod", 518, 0.5),
        make_rod("Azurite Rod", 519, 0.5),
        make_rod("Sapphire Thin Rod", 520, 0.2),
        make_rod("Emerald Thin Rod", 521, 0.2),
        make_rod("Ruby Thin Rod", 522, 0.2),
        make_rod("Turquoise Thin Rod", 523, 0.2),
        make_rod("Amethyst Thin Rod", 524, 0.2),
        make_rod("Jade Thin Rod", 525, 0.2),
        make_rod("Coral Thin Rod", 526, 0.2),
        make_rod("Lapis Lazuli Thin Rod", 527, 0.2),
        make_rod("Malachite Thin Rod", 528, 0.2),
        make_rod("Pyrite Thin Rod", 529, 0.2),
        make_rod("Flint Thin Rod", 530, 0.2),
        make_rod("Moonstone Thin Rod", 531, 0.2),
        make_rod("Aquamarine Thin Rod", 532, 0.2),
        make_rod("Sunstone Thin Rod", 533, 0.2),
        make_rod("Opal Thin Rod", 534, 0.2),
        make_rod("Bloodstone Thin Rod", 535, 0.2),
        make_rod("Rose Quartz Thin Rod", 536, 0.2),
        make_rod("Iolite Thin Rod", 537, 0.2),
        make_rod("Hematite Thin Rod", 538, 0.2),
        make_rod("Azurite Thin Rod", 539, 0.2),
    ]);

    // Special Blocks

    let mut link_block = BlockFaces::six_faces().scale_z(0.7).prefix("stand").build();

    let mut display = BlockFaces::six_faces()
        .scale_z(0.2)
        .scale_x(0.8)
        .scale_y(0.8)
        .offset_x(0.1)
        .offset_y(0.1)
        .offset_z(0.7)
        .prefix("display")
        .build();
    // .independent_at(2);

    link_block.append(&mut display);

    let link_block_aabbs = [AABB::from_faces(&link_block)];

    let make_link_block = |name: &str, id: u32| {
        Block::new(name)
            .id(id)
            .rotatable(true)
            .y_rotatable(true)
            .is_transparent(true)
            .is_x_transparent(false)
            .faces(&link_block)
            .aabbs(&link_block_aabbs)
            .torch_light_level(15)
            .build()
    };

    registry.register_blocks(&[
        make_link_block("Youtube", 1500),
        make_link_block("Twitter", 1501),
        make_link_block("LinkedIn", 1502),
        make_link_block("Github", 1503),
        make_link_block("Mail", 1504),
        Block::new("BuyMeACoffee")
            .id(1505)
            .rotatable(true)
            .y_rotatable(true)
            .is_transparent(true)
            .is_x_transparent(false)
            .faces(&link_block)
            .aabbs(&link_block_aabbs)
            .torch_light_level(15)
            .build(),
    ]);

    registry.register_block(
        &Block::new("Mushroom")
            .id(2000)
            .faces(
                &BlockFaces::six_faces()
                    .scale_x(0.3)
                    .offset_x(0.35)
                    .scale_z(0.3)
                    .offset_z(0.35)
                    .scale_y(0.2)
                    .prefix("bottom")
                    .concat("-")
                    .build()
                    .join(
                        BlockFaces::six_faces()
                            .scale_x(0.4)
                            .offset_x(0.3)
                            .scale_z(0.4)
                            .offset_z(0.3)
                            .scale_y(0.3)
                            .offset_y(0.2)
                            .prefix("top")
                            .concat("-")
                            .build(),
                    ),
            )
            .aabbs(&[
                AABB::new()
                    .scale_x(0.3)
                    .offset_x(0.35)
                    .scale_z(0.3)
                    .offset_z(0.35)
                    .scale_y(0.2)
                    .build(),
                AABB::new()
                    .scale_x(0.4)
                    .offset_x(0.3)
                    .scale_z(0.4)
                    .offset_z(0.3)
                    .scale_y(0.3)
                    .offset_y(0.2)
                    .build(),
            ])
            .is_transparent(true)
            .rotatable(true)
            .torch_light_level(10)
            .build(),
    );

    let trophy_plate_width = 0.3;
    let trophy_place_height = 0.1;
    let mut trophy_plate = BlockFaces::six_faces()
        .scale_x(trophy_plate_width)
        .scale_z(trophy_plate_width)
        .scale_y(trophy_place_height)
        .offset_x(0.5 - trophy_plate_width / 2.0)
        .offset_z(0.5 - trophy_plate_width / 2.0)
        .prefix("stand")
        .build();

    let trophy_column_width = 0.2;
    let trophy_column_height = 0.1;
    let mut trophy_column = BlockFaces::six_faces()
        .scale_x(trophy_column_width)
        .scale_z(trophy_column_width)
        .scale_y(trophy_column_height)
        .offset_x(0.5 - trophy_column_width / 2.0)
        .offset_z(0.5 - trophy_column_width / 2.0)
        .offset_y(trophy_place_height)
        .prefix("column")
        .build();

    let trophy_cup_width = 0.5;
    let trophy_cup_height = 0.6;
    let mut trophy_cup = BlockFaces::six_faces()
        .scale_x(trophy_cup_width)
        .scale_z(trophy_cup_width)
        .scale_y(trophy_cup_height)
        .offset_x(0.5 - trophy_cup_width / 2.0)
        .offset_z(0.5 - trophy_cup_width / 2.0)
        .offset_y(trophy_place_height + trophy_column_height)
        .prefix("cup")
        .build();

    let trophy_handle_width = 0.3;
    let trophy_handle_depth = 0.1;
    let trophy_handle_height = 0.2;
    let mut trophy_handle_left = BlockFaces::six_faces()
        .scale_x(trophy_handle_width)
        .scale_z(trophy_handle_depth)
        .scale_y(trophy_handle_height)
        .offset_z(0.5 - trophy_handle_depth / 2.0)
        .offset_x(0.5 - trophy_handle_width / 2.0 - trophy_cup_width / 2.0)
        .offset_y(
            trophy_place_height + trophy_column_height + trophy_cup_height / 2.0
                - trophy_handle_height / 2.0,
        )
        .prefix("handleright")
        .build();
    let mut trophy_handle_right = BlockFaces::six_faces()
        .scale_x(trophy_handle_width)
        .scale_z(trophy_handle_depth)
        .scale_y(0.2)
        .offset_z(0.5 - trophy_handle_depth / 2.0)
        .offset_x(0.5 - trophy_handle_width / 2.0 + trophy_cup_width / 2.0)
        .offset_y(
            trophy_place_height + trophy_column_height + trophy_cup_height / 2.0
                - trophy_handle_height / 2.0,
        )
        .prefix("handleleft")
        .build();

    let mut trophy: BlockFaces = BlockFaces { faces: vec![] };

    trophy.append(&mut trophy_plate);
    trophy.append(&mut trophy_column);
    trophy.append(&mut trophy_cup);
    trophy.append(&mut trophy_handle_left);
    trophy.append(&mut trophy_handle_right);

    let trophy_aabbs = [AABB::from_faces(&trophy)];

    registry.register_blocks(&[
        Block::new("Trophy (mc.js)")
            .id(2500)
            .faces(&trophy)
            .aabbs(&trophy_aabbs)
            .rotatable(true)
            .y_rotatable(true)
            .torch_light_level(15)
            .build(),
        Block::new("Trophy (modern-graphql-tutorial)")
            .id(2501)
            .faces(&trophy)
            .aabbs(&trophy_aabbs)
            .rotatable(true)
            .y_rotatable(true)
            .torch_light_level(15)
            .build(),
        Block::new("Trophy (mine.js)")
            .id(2502)
            .faces(&trophy)
            .aabbs(&trophy_aabbs)
            .rotatable(true)
            .y_rotatable(true)
            .torch_light_level(15)
            .build(),
        Block::new("Trophy (voxelize)")
            .id(2503)
            .faces(&trophy)
            .aabbs(&trophy_aabbs)
            .rotatable(true)
            .y_rotatable(true)
            .torch_light_level(15)
            .build(),
        Block::new("Trophy (mc.js-legacy)")
            .id(2504)
            .faces(&trophy)
            .aabbs(&trophy_aabbs)
            .rotatable(true)
            .y_rotatable(true)
            .torch_light_level(15)
            .build(),
        Block::new("Trophy (rust-typescript-template)")
            .id(2505)
            .faces(&trophy)
            .aabbs(&trophy_aabbs)
            .rotatable(true)
            .y_rotatable(true)
            .torch_light_level(15)
            .build(),
        Block::new("Trophy (lunar-lander-ai)")
            .id(2506)
            .faces(&trophy)
            .aabbs(&trophy_aabbs)
            .rotatable(true)
            .y_rotatable(true)
            .torch_light_level(15)
            .build(),
    ]);

    registry.register_block(
        &Block::new("Trophy")
            .id(2001)
            .faces(&trophy)
            .aabbs(&[AABB::from_faces(&trophy)])
            .rotatable(true)
            .y_rotatable(true)
            .is_transparent(true)
            .torch_light_level(15)
            .build(),
    );

    registry.register_blocks(&[
        Block::new("Github Contribution L0")
            .id(3000)
            .torch_light_level(15)
            .build(),
        Block::new("Github Contribution L1")
            .id(3001)
            .torch_light_level(15)
            .build(),
        Block::new("Github Contribution L2")
            .id(3002)
            .torch_light_level(15)
            .build(),
        Block::new("Github Contribution L3")
            .id(3003)
            .torch_light_level(15)
            .build(),
        Block::new("Github Contribution L4")
            .id(3004)
            .torch_light_level(15)
            .build(),
    ]);

    // Voxelize blocks
    registry.register_blocks(&[
        Block::new("Glass")
            .id(5000)
            .is_transparent(true)
            .is_see_through(true)
            .build(),
        Block::new("Birch Log").id(5001).rotatable(true).build(),
        Block::new("Oak Planks").id(5002).build(),
        Block::new("Oak Log").id(5003).rotatable(true).build(),
        Block::new("Oak Leaves")
            .id(5004)
            .faces(
                &BlockFaces::six_faces().build().join(
                    BlockFaces::diagonal_faces()
                        .offset_x(0.1)
                        .offset_z(0.1)
                        .scale_horizontal(1.2)
                        .build(),
                ),
            )
            .is_transparent(true)
            .is_see_through(true)
            .light_reduce(true)
            .transparent_standalone(true)
            .build(),
        Block::new("Orange Concrete").id(5006).build(),
        Block::new("Blue Concrete").id(5007).build(),
        Block::new("Red Concrete").id(5008).build(),
        Block::new("White Concrete").id(5009).build(),
        Block::new("Yellow Concrete").id(5010).build(),
        Block::new("Black Concrete").id(5011).build(),
        Block::new("Ivory").id(5012).build(),
        make_stairs("Oak Stairs", 5013),
        make_stairs("Ivory Stairs", 5014),
        make_stairs("Stone Stairs", 5015),
    ]);

    let two_by_three_painting_faces = BlockFaces::six_faces()
        .scale_z(0.1)
        .offset_z(0.9)
        .scale_x(3.0)
        .offset_x(-1.0)
        .scale_y(2.0)
        .build()
        .isolated_at(SIX_FACES_NZ);
    let two_by_three_painting = Block::new("2x3 Painting")
        .id(23050)
        .faces(&two_by_three_painting_faces)
        .aabbs(&[AABB::new().scale_z(0.1).offset_z(0.9).build()])
        .rotatable(true)
        .y_rotatable(true)
        .is_passable(true)
        .is_transparent(true)
        .is_entity(true)
        .build();
    registry.register_block(&two_by_three_painting);

    let carpet_faces = BlockFaces::six_faces().scale_y(0.05).build();
    let carpet_aabbs = [AABB::from_faces(&carpet_faces)];

    let yellow_carpet = Block::new("Yellow Carpet")
        .id(23000)
        .faces(&carpet_faces)
        .aabbs(&carpet_aabbs)
        .is_passable(true)
        .is_transparent(true)
        .build();

    registry.register_blocks(&[yellow_carpet]);

    registry
}
