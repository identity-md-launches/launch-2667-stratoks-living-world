window.STRATOKS_AGENCY = {
  "schema": "stratoks-supplementary-atlas-v1",
  "version": 1,
  "scope": "Artwork only; no runtime integration or simulation changes.",
  "coordinates": "Top-left pixel origin; zero-based row/column; half-open rectangles.",
  "anchorConvention": "Measured bottom-center of alpha>8 bounds, rounded down. Approximate ground-registration pivot, not a collision point. Composite frames use the shared group midpoint.",
  "lighting": "Warm upper-left key light; softly painted isometric miniature style.",
  "atlases": {
    "terrain": {
      "path": "artifacts/agency/terrain.png",
      "format": "PNG RGBA8",
      "width": 1536,
      "height": 1536,
      "sha256": "5fdf1a718a8fe23bdf0d87bad43f19b619f13558d62b750482dc61f4adbdba51",
      "grid": [
        6,
        6
      ],
      "cellSize": [
        256,
        256
      ],
      "minimumClearGutter": 32,
      "limitations": [
        "Flattened raster; no layered source, depth map or skeletal rig.",
        "Single camera direction; frames are state illustrations, not a verified seamless animation rig.",
        "Anchors are derived from measured visible bounds and require integration review.",
        "Cliff join geometry is illustrated, not a certified pixel-seamless autotile system.",
        "Unmet: stray small fragments remain inside some cell margins.",
        "Painted water and transitions require clipping to authoritative terrain.",
        "No terrain collision, projection or picking implementation is supplied."
      ],
      "frames": [
        {
          "id": "terrain-01-01",
          "name": "grass-slate cliff straight A",
          "row": 0,
          "column": 0,
          "rect": [
            0,
            0,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            52,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-01-02",
          "name": "grass-slate cliff straight B",
          "row": 0,
          "column": 1,
          "rect": [
            256,
            0,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            44,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-01-03",
          "name": "grass-slate cliff convex corner",
          "row": 0,
          "column": 2,
          "rect": [
            512,
            0,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            82,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-01-04",
          "name": "grass-slate cliff concave corner",
          "row": 0,
          "column": 3,
          "rect": [
            768,
            0,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            70,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-01-05",
          "name": "grass-slate cliff end A",
          "row": 0,
          "column": 4,
          "rect": [
            1024,
            0,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            45,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-01-06",
          "name": "grass-slate cliff end B",
          "row": 0,
          "column": 5,
          "rect": [
            1280,
            0,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            54,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-02-01",
          "name": "desert-sandstone cliff straight A",
          "row": 1,
          "column": 0,
          "rect": [
            0,
            256,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            49,
            33,
            207,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-02-02",
          "name": "desert-sandstone cliff straight B",
          "row": 1,
          "column": 1,
          "rect": [
            256,
            256,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            53,
            33,
            203,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-02-03",
          "name": "desert-sandstone cliff convex corner",
          "row": 1,
          "column": 2,
          "rect": [
            512,
            256,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            45,
            33,
            211,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-02-04",
          "name": "desert-sandstone cliff concave corner",
          "row": 1,
          "column": 3,
          "rect": [
            768,
            256,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            70,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-02-05",
          "name": "desert-sandstone cliff end A",
          "row": 1,
          "column": 4,
          "rect": [
            1024,
            256,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            55,
            33,
            202,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-02-06",
          "name": "desert-sandstone cliff end B",
          "row": 1,
          "column": 5,
          "rect": [
            1280,
            256,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            50,
            33,
            207,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-03-01",
          "name": "snow-slate cliff straight A",
          "row": 2,
          "column": 0,
          "rect": [
            0,
            512,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            50,
            33,
            206,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-03-02",
          "name": "snow-slate cliff straight B",
          "row": 2,
          "column": 1,
          "rect": [
            256,
            512,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            53,
            33,
            204,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-03-03",
          "name": "snow-slate cliff convex corner",
          "row": 2,
          "column": 2,
          "rect": [
            512,
            512,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            48,
            33,
            208,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-03-04",
          "name": "snow-slate cliff concave corner",
          "row": 2,
          "column": 3,
          "rect": [
            768,
            512,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            64,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-03-05",
          "name": "snow-slate cliff end A",
          "row": 2,
          "column": 4,
          "rect": [
            1024,
            512,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            54,
            33,
            202,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-03-06",
          "name": "snow-slate cliff end B",
          "row": 2,
          "column": 5,
          "rect": [
            1280,
            512,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            53,
            33,
            204,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-04-01",
          "name": "forest transition edge",
          "row": 3,
          "column": 0,
          "rect": [
            0,
            768,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            40,
            33,
            216,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-04-02",
          "name": "forest transition corner",
          "row": 3,
          "column": 1,
          "rect": [
            256,
            768,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            42,
            33,
            215,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-04-03",
          "name": "rocky bank A",
          "row": 3,
          "column": 2,
          "rect": [
            512,
            768,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            53,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-04-04",
          "name": "rocky bank B",
          "row": 3,
          "column": 3,
          "rect": [
            768,
            768,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            69,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-04-05",
          "name": "rocky bank convex",
          "row": 3,
          "column": 4,
          "rect": [
            1024,
            768,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            49,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-04-06",
          "name": "rocky bank concave",
          "row": 3,
          "column": 5,
          "rect": [
            1280,
            768,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            47,
            33,
            209,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-05-01",
          "name": "sand-grass transition edge",
          "row": 4,
          "column": 0,
          "rect": [
            0,
            1024,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            42,
            33,
            215,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-05-02",
          "name": "sand-grass transition corner",
          "row": 4,
          "column": 1,
          "rect": [
            256,
            1024,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            45,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-05-03",
          "name": "snow-grass transition edge",
          "row": 4,
          "column": 2,
          "rect": [
            512,
            1024,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            50,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-05-04",
          "name": "snow-grass transition corner",
          "row": 4,
          "column": 3,
          "rect": [
            768,
            1024,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            42,
            33,
            214,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-05-05",
          "name": "sand-coast transition edge",
          "row": 4,
          "column": 4,
          "rect": [
            1024,
            1024,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            45,
            33,
            211,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-05-06",
          "name": "sand-coast transition corner",
          "row": 4,
          "column": 5,
          "rect": [
            1280,
            1024,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            50,
            33,
            207,
            217
          ],
          "clearGutter": 33,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-06-01",
          "name": "tilled garden empty",
          "row": 5,
          "column": 0,
          "rect": [
            0,
            1280,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            66,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-06-02",
          "name": "garden seedlings",
          "row": 5,
          "column": 1,
          "rect": [
            256,
            1280,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            69,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-06-03",
          "name": "garden ripe grain",
          "row": 5,
          "column": 2,
          "rect": [
            512,
            1280,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            63,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-06-04",
          "name": "hearth unlit empty pot",
          "row": 5,
          "column": 3,
          "rect": [
            768,
            1280,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            56,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-06-05",
          "name": "hearth lit stew pot",
          "row": 5,
          "column": 4,
          "rect": [
            1024,
            1280,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            41,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        },
        {
          "id": "terrain-06-06",
          "name": "closed storage chest and basket",
          "row": 5,
          "column": 5,
          "rect": [
            1280,
            1280,
            256,
            256
          ],
          "anchor": [
            128,
            216
          ],
          "alphaBounds": [
            32,
            49,
            224,
            217
          ],
          "clearGutter": 32,
          "participants": 0,
          "runtimeGate": "Authoritative biome, elevation, adjacency and actual prop state."
        }
      ]
    },
    "activities": {
      "path": "artifacts/agency/activities.png",
      "format": "PNG RGBA8",
      "width": 1254,
      "height": 1254,
      "sha256": "d61b5eafc0402a39fd7c67e4f2fb83578c272972c9db0614305321cf017a6c24",
      "grid": [
        6,
        6
      ],
      "cellSize": [
        209,
        209
      ],
      "minimumClearGutter": 0,
      "limitations": [
        "Flattened raster; no layered source, depth map or skeletal rig.",
        "Single camera direction; frames are state illustrations, not a verified seamless animation rig.",
        "Anchors are derived from measured visible bounds and require integration review.",
        "Cooperative cells are composite two-resident sprites at fixed relative spacing.",
        "Unmet: visible colored matte fringe remains around some silhouettes.",
        "Body/prop scale may vary between single-resident and cooperative frames.",
        "No engine bindings, timing or action recipes are supplied.",
        "Unmet: at least one cell has fewer than 8 fully transparent gutter pixels."
      ],
      "frames": [
        {
          "id": "activities-01-01",
          "name": "tend reach soil",
          "row": 0,
          "column": 0,
          "rect": [
            0,
            0,
            209,
            209
          ],
          "anchor": [
            107,
            208
          ],
          "alphaBounds": [
            36,
            77,
            179,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual tending target, seeds or water matching the selected pose."
        },
        {
          "id": "activities-01-02",
          "name": "tend place seed",
          "row": 0,
          "column": 1,
          "rect": [
            209,
            0,
            209,
            209
          ],
          "anchor": [
            106,
            208
          ],
          "alphaBounds": [
            37,
            80,
            176,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual tending target, seeds or water matching the selected pose."
        },
        {
          "id": "activities-01-03",
          "name": "tend pat soil",
          "row": 0,
          "column": 2,
          "rect": [
            418,
            0,
            209,
            209
          ],
          "anchor": [
            112,
            208
          ],
          "alphaBounds": [
            41,
            72,
            183,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual tending target, seeds or water matching the selected pose."
        },
        {
          "id": "activities-01-04",
          "name": "tend hold water vessel",
          "row": 0,
          "column": 3,
          "rect": [
            627,
            0,
            209,
            209
          ],
          "anchor": [
            97,
            208
          ],
          "alphaBounds": [
            30,
            61,
            164,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual tending target, seeds or water matching the selected pose."
        },
        {
          "id": "activities-01-05",
          "name": "tend water seedling",
          "row": 0,
          "column": 4,
          "rect": [
            836,
            0,
            209,
            209
          ],
          "anchor": [
            113,
            208
          ],
          "alphaBounds": [
            27,
            72,
            199,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual tending target, seeds or water matching the selected pose."
        },
        {
          "id": "activities-01-06",
          "name": "tend lower vessel",
          "row": 0,
          "column": 5,
          "rect": [
            1045,
            0,
            209,
            209
          ],
          "anchor": [
            95,
            208
          ],
          "alphaBounds": [
            23,
            66,
            168,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual tending target, seeds or water matching the selected pose."
        },
        {
          "id": "activities-02-01",
          "name": "harvest approach grain",
          "row": 1,
          "column": 0,
          "rect": [
            0,
            209,
            209,
            209
          ],
          "anchor": [
            122,
            208
          ],
          "alphaBounds": [
            36,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual harvestable crop and observed transfer; basket state must match inventory."
        },
        {
          "id": "activities-02-02",
          "name": "harvest grasp grain",
          "row": 1,
          "column": 1,
          "rect": [
            209,
            209,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual harvestable crop and observed transfer; basket state must match inventory."
        },
        {
          "id": "activities-02-03",
          "name": "harvest gather grain",
          "row": 1,
          "column": 2,
          "rect": [
            418,
            209,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual harvestable crop and observed transfer; basket state must match inventory."
        },
        {
          "id": "activities-02-04",
          "name": "harvest lift grain",
          "row": 1,
          "column": 3,
          "rect": [
            627,
            209,
            209,
            209
          ],
          "anchor": [
            103,
            208
          ],
          "alphaBounds": [
            0,
            0,
            207,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual harvestable crop and observed transfer; basket state must match inventory."
        },
        {
          "id": "activities-02-05",
          "name": "harvest fill basket",
          "row": 1,
          "column": 4,
          "rect": [
            836,
            209,
            209,
            209
          ],
          "anchor": [
            113,
            208
          ],
          "alphaBounds": [
            21,
            0,
            205,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual harvestable crop and observed transfer; basket state must match inventory."
        },
        {
          "id": "activities-02-06",
          "name": "harvest hold basket",
          "row": 1,
          "column": 5,
          "rect": [
            1045,
            209,
            209,
            209
          ],
          "anchor": [
            102,
            208
          ],
          "alphaBounds": [
            15,
            0,
            190,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual harvestable crop and observed transfer; basket state must match inventory."
        },
        {
          "id": "activities-03-01",
          "name": "cook carry fuel",
          "row": 2,
          "column": 0,
          "rect": [
            0,
            418,
            209,
            209
          ],
          "anchor": [
            115,
            208
          ],
          "alphaBounds": [
            22,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual food, fuel, vessel and heat matching visible props; no painted fire without active fire."
        },
        {
          "id": "activities-03-02",
          "name": "cook place fuel",
          "row": 2,
          "column": 1,
          "rect": [
            209,
            418,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual food, fuel, vessel and heat matching visible props; no painted fire without active fire."
        },
        {
          "id": "activities-03-03",
          "name": "cook add berries",
          "row": 2,
          "column": 2,
          "rect": [
            418,
            418,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual food, fuel, vessel and heat matching visible props; no painted fire without active fire."
        },
        {
          "id": "activities-03-04",
          "name": "cook hold spoon",
          "row": 2,
          "column": 3,
          "rect": [
            627,
            418,
            209,
            209
          ],
          "anchor": [
            96,
            208
          ],
          "alphaBounds": [
            0,
            0,
            193,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual food, fuel, vessel and heat matching visible props; no painted fire without active fire."
        },
        {
          "id": "activities-03-05",
          "name": "cook stir",
          "row": 2,
          "column": 4,
          "rect": [
            836,
            418,
            209,
            209
          ],
          "anchor": [
            112,
            208
          ],
          "alphaBounds": [
            22,
            0,
            203,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual food, fuel, vessel and heat matching visible props; no painted fire without active fire."
        },
        {
          "id": "activities-03-06",
          "name": "cook inspect spoon",
          "row": 2,
          "column": 5,
          "rect": [
            1045,
            418,
            209,
            209
          ],
          "anchor": [
            102,
            208
          ],
          "alphaBounds": [
            14,
            0,
            191,
            209
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual food, fuel, vessel and heat matching visible props; no painted fire without active fire."
        },
        {
          "id": "activities-04-01",
          "name": "cooperative carry grasp",
          "row": 3,
          "column": 0,
          "rect": [
            0,
            627,
            209,
            209
          ],
          "anchor": [
            116,
            208
          ],
          "alphaBounds": [
            23,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents carrying one shared timber at the depicted separation."
        },
        {
          "id": "activities-04-02",
          "name": "cooperative carry lift",
          "row": 3,
          "column": 1,
          "rect": [
            209,
            627,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents carrying one shared timber at the depicted separation."
        },
        {
          "id": "activities-04-03",
          "name": "cooperative carry step A",
          "row": 3,
          "column": 2,
          "rect": [
            418,
            627,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents carrying one shared timber at the depicted separation."
        },
        {
          "id": "activities-04-04",
          "name": "cooperative carry step B",
          "row": 3,
          "column": 3,
          "rect": [
            627,
            627,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents carrying one shared timber at the depicted separation."
        },
        {
          "id": "activities-04-05",
          "name": "cooperative carry lower",
          "row": 3,
          "column": 4,
          "rect": [
            836,
            627,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents carrying one shared timber at the depicted separation."
        },
        {
          "id": "activities-04-06",
          "name": "cooperative carry set down",
          "row": 3,
          "column": 5,
          "rect": [
            1045,
            627,
            209,
            209
          ],
          "anchor": [
            103,
            208
          ],
          "alphaBounds": [
            0,
            0,
            206,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents carrying one shared timber at the depicted separation."
        },
        {
          "id": "activities-05-01",
          "name": "cooperative repair position plank",
          "row": 4,
          "column": 0,
          "rect": [
            0,
            836,
            209,
            209
          ],
          "anchor": [
            111,
            206
          ],
          "alphaBounds": [
            14,
            0,
            209,
            207
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents repairing one target; tools/materials must exist."
        },
        {
          "id": "activities-05-02",
          "name": "cooperative repair raise mallet",
          "row": 4,
          "column": 1,
          "rect": [
            209,
            836,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents repairing one target; tools/materials must exist."
        },
        {
          "id": "activities-05-03",
          "name": "cooperative repair strike",
          "row": 4,
          "column": 2,
          "rect": [
            418,
            836,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents repairing one target; tools/materials must exist."
        },
        {
          "id": "activities-05-04",
          "name": "cooperative repair adjust",
          "row": 4,
          "column": 3,
          "rect": [
            627,
            836,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents repairing one target; tools/materials must exist."
        },
        {
          "id": "activities-05-05",
          "name": "cooperative repair low joint",
          "row": 4,
          "column": 4,
          "rect": [
            836,
            836,
            209,
            209
          ],
          "anchor": [
            104,
            208
          ],
          "alphaBounds": [
            0,
            0,
            209,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents repairing one target; tools/materials must exist."
        },
        {
          "id": "activities-05-06",
          "name": "cooperative repair inspect",
          "row": 4,
          "column": 5,
          "rect": [
            1045,
            836,
            209,
            209
          ],
          "anchor": [
            103,
            208
          ],
          "alphaBounds": [
            0,
            0,
            206,
            209
          ],
          "clearGutter": 0,
          "participants": 2,
          "runtimeGate": "Two actual participating residents repairing one target; tools/materials must exist."
        },
        {
          "id": "activities-06-01",
          "name": "repair hold plank",
          "row": 5,
          "column": 0,
          "rect": [
            0,
            1045,
            209,
            209
          ],
          "anchor": [
            118,
            188
          ],
          "alphaBounds": [
            34,
            33,
            202,
            189
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual repair phase, target, tool and available repair materials."
        },
        {
          "id": "activities-06-02",
          "name": "repair position plank",
          "row": 5,
          "column": 1,
          "rect": [
            209,
            1045,
            209,
            209
          ],
          "anchor": [
            133,
            190
          ],
          "alphaBounds": [
            57,
            34,
            209,
            191
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual repair phase, target, tool and available repair materials."
        },
        {
          "id": "activities-06-03",
          "name": "repair raise mallet",
          "row": 5,
          "column": 2,
          "rect": [
            418,
            1045,
            209,
            209
          ],
          "anchor": [
            96,
            190
          ],
          "alphaBounds": [
            0,
            15,
            193,
            191
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual repair phase, target, tool and available repair materials."
        },
        {
          "id": "activities-06-04",
          "name": "repair strike peg",
          "row": 5,
          "column": 3,
          "rect": [
            627,
            1045,
            209,
            209
          ],
          "anchor": [
            109,
            191
          ],
          "alphaBounds": [
            26,
            0,
            193,
            192
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual repair phase, target, tool and available repair materials."
        },
        {
          "id": "activities-06-05",
          "name": "repair low joint",
          "row": 5,
          "column": 4,
          "rect": [
            836,
            1045,
            209,
            209
          ],
          "anchor": [
            110,
            191
          ],
          "alphaBounds": [
            29,
            0,
            191,
            192
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual repair phase, target, tool and available repair materials."
        },
        {
          "id": "activities-06-06",
          "name": "repair inspect joint",
          "row": 5,
          "column": 5,
          "rect": [
            1045,
            1045,
            209,
            209
          ],
          "anchor": [
            101,
            190
          ],
          "alphaBounds": [
            22,
            0,
            180,
            191
          ],
          "clearGutter": 0,
          "participants": 1,
          "runtimeGate": "Actual repair phase, target, tool and available repair materials."
        }
      ]
    }
  }
};
