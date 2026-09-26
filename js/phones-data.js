const PHONES = [
  {
    id: "iphone-14-pro-max", brand: "Apple", name: "iPhone 14 Pro Max", type: "iphone",
    year: 2022, released: "2022-09-16", price: 1099, category: "flagship",
    chip: "A16 Bionic", process: "4nm",
    display: { size: 6.7, refresh: 120, tech: "OLED", notes: "Dynamic Island debuts" },
    battery_mah: 4323,
    camera: { main: 48, ultrawide: 12, tele: 12, tele_zoom: "3x", front: 12 },
    dims_mm: [160.7, 77.6, 7.85], weight_g: 240, water: "IP68",
    _verified: {}
  },
  {
    id: "iphone-15-pro-max", brand: "Apple", name: "iPhone 15 Pro Max", type: "iphone",
    year: 2023, released: "2023-09-22", price: 1199, category: "flagship",
    chip: "A17 Pro", process: "3nm",
    display: { size: 6.7, refresh: 120, tech: "OLED", notes: "titanium frame; USB-C" },
    battery_mah: 4441,
    camera: { main: 48, ultrawide: 12, tele: 12, tele_zoom: "5x tetraprism", front: 12 },
    dims_mm: [159.9, 76.7, 8.25], weight_g: 221, water: "IP68",
    _verified: {}
  },
  {
    id: "iphone-16-pro-max", brand: "Apple", name: "iPhone 16 Pro Max", type: "iphone",
    year: 2024, released: "2024-09-20", price: 1199, category: "flagship",
    chip: "A18 Pro", process: "3nm",
    display: { size: 6.9, refresh: 120, tech: "OLED", notes: "Camera Control button debuts" },
    battery_mah: 4685,
    camera: { main: 48, ultrawide: 48, tele: 12, tele_zoom: "5x", front: 12 },
    dims_mm: [163.0, 77.6, 8.25], weight_g: 227, water: "IP68",
    _verified: { dims_mm: true, weight_g: true }
  },
  {
    id: "iphone-17-pro-max", brand: "Apple", name: "iPhone 17 Pro Max", type: "iphone",
    year: 2025, released: "2025-09-19", price: 1199, category: "flagship",
    chip: "A19 Pro", process: "3nm",
    display: { size: 6.9, refresh: 120, tech: "OLED", notes: "vapor chamber, up to 3000 nits" },
    battery_mah: 4823,
    camera: { main: 48, ultrawide: 48, tele: 48, front: 18 },
    dims_mm: [162.6, 76.2, 8.64], weight_g: 233, water: "IP68",
    _verified: { battery_mah: true }
  },
  {
    id: "iphone-18-pro-max", brand: "Apple", name: "iPhone 18 Pro Max", type: "iphone",
    year: 2026, released: "2026-09-18", price: 1299, category: "flagship",
    chip: "A20 Pro", process: "2nm",
    display: { size: 6.9, res: "2868x1320", refresh: 120, tech: "OLED", notes: "smaller Dynamic Island" },
    battery_mah: 5391,
    camera: { main: 48, notes: "variable aperture - first on iPhone" },
    storage_max_tb: 2,
    dims_mm: [163.4, 78.0, 8.75], weight_g: 249, water: "IP68",
    colors: ["Burgundy", "Silver", "Cosmic Orange", "Deep Blue"],
    _verified: { dims_mm: true, weight_g: true }
  },
  {
    id: "iphone-duo", brand: "Apple", name: "iPhone Duo", type: "iphone",
    year: 2026, released: "2026-10-23", price: [1999, 3199], category: "foldable",
    chip: "A20 Pro",
    display: { outer: 5.4, inner: 7.6, tech: "OLED" },
    biometrics: "Touch ID (no Face ID - TrueDepth doesn't fit hinge bezels)",
    dims_closed_mm: [84.1, 117.8, 11.3], dims_open_mm: [164.6, 117.8, 5.2],
    weight_g: 254, water: "IP68",
    note: "Still unannounced by Apple as of this date. Widely reported in press as \"iPhone Fold,\" not \"iPhone Duo.\" Keep id/name as-is for now but treat every field on this entry as speculative/unconfirmed.",
    _verified: {}
  }
];