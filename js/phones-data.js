const PHONES = [
  {
    id: "iphone-14-pro-max", brand: "Apple", name: "iPhone 14 Pro Max",
    year: 2022, released: "2022-09-16", price: 1099, category: "flagship",
    chip: "A16 Bionic", process: "4nm",
    display: { size: 6.7, refresh: 120, tech: "OLED", notes: "Dynamic Island debuts" },
    battery_mah: 4323,
    camera: { main: 48, ultrawide: 12, tele: 12, tele_zoom: "3x", front: 12 },
    dims_mm: [160.7, 77.6, 7.85], weight_g: 240, water: "IP68",
    _verified: {}
  },
  {
    id: "iphone-15-pro-max", brand: "Apple", name: "iPhone 15 Pro Max",
    year: 2023, released: "2023-09-22", price: 1199, category: "flagship",
    chip: "A17 Pro", process: "3nm",
    display: { size: 6.7, refresh: 120, tech: "OLED", notes: "titanium frame; USB-C" },
    battery_mah: 4441,
    camera: { main: 48, ultrawide: 12, tele: 12, tele_zoom: "5x tetraprism", front: 12 },
    dims_mm: [159.9, 76.7, 8.25], weight_g: 221, water: "IP68",
    _verified: {}
  },
  {
    id: "iphone-16-pro-max", brand: "Apple", name: "iPhone 16 Pro Max",
    year: 2024, released: "2024-09-20", price: 1199, category: "flagship",
    chip: "A18 Pro", process: "3nm",
    display: { size: 6.9, refresh: 120, tech: "OLED", notes: "Camera Control button debuts" },
    battery_mah: 4685,
    camera: { main: 48, ultrawide: 48, tele: 12, tele_zoom: "5x", front: 12 },
    dims_mm: [163.0, 77.6, 8.25], weight_g: 227, water: "IP68", // dims/weight TBD, verify
    _verified: { dims_mm: false, weight_g: false }
  },
  {
    id: "iphone-17-pro-max", brand: "Apple", name: "iPhone 17 Pro Max",
    year: 2025, released: "2025-09-19", price: 1199, category: "flagship",
    chip: "A19 Pro", process: "3nm",
    display: { size: 6.9, refresh: 120, tech: "OLED", notes: "vapor chamber, up to 3000 nits" },
    battery_mah: null, // TBD, not confirmed precisely
    camera: { main: 48, ultrawide: 48, tele: 48, front: 18 },
    dims_mm: [162.6, 76.2, 8.64], weight_g: 233, water: "IP68",
    _verified: { battery_mah: false }
  },
  {
    id: "iphone-18-pro-max", brand: "Apple", name: "iPhone 18 Pro Max",
    year: 2026, released: "2026-09-18", price: 1299, category: "flagship",
    chip: "A20 Pro", process: "2nm",
    display: { size: 6.9, res: "2868x1320", refresh: 120, tech: "OLED", notes: "smaller Dynamic Island" },
    battery_mah: 5391,
    camera: { main: 48, notes: "variable aperture - first on iPhone" },
    storage_max_tb: 2,
    dims_mm: [163.0, 78.0, 8.8], weight_g: null, water: "IP68", // dims/weight TBD, verify
    colors: ["Burgundy", "Silver", "Cosmic Orange", "Deep Blue"],
    _verified: { dims_mm: false, weight_g: false }
  },
  {
    id: "iphone-duo", brand: "Apple", name: "iPhone Duo",
    year: 2026, released: "2026-10-23", price: [1999, 3199], category: "foldable",
    chip: "A20 Pro",
    display: { outer: 5.4, inner: 7.6, tech: "OLED" },
    biometrics: "Touch ID (no Face ID - TrueDepth doesn't fit hinge bezels)",
    dims_closed_mm: [84.1, 117.8, 11.3], dims_open_mm: [164.6, 117.8, 5.2],
    weight_g: 254, water: "IP68",
    _verified: {}
  },
  {
    id: "galaxy-s26-ultra", brand: "Samsung", name: "Galaxy S26 Ultra",
    year: 2026, released: "2026-03-11", price: 1320, category: "flagship", // price is a soft estimate, verify
    chip: "Snapdragon 8 Elite Gen 5", process: "3nm",
    display: { size: 6.9, refresh: 120, tech: "LTPO AMOLED", peak_nits: 2600, notes: "Privacy Display" },
    battery_mah: 5000, charging_w: 60,
    camera: { main: 200, main_aperture: "f/1.4", ultrawide: 50, tele: 10, periscope_tele: 50, front: null },
    dims_mm: [163.6, 78.1, 7.9], weight_g: 214, water: "IP68",
    _verified: { price: false }
  },
  {
    id: "galaxy-z-fold8", brand: "Samsung", name: "Galaxy Z Fold 8",
    year: 2026, released: "2026-08-07", category: "foldable",
    notes: "passport-style: shorter, wider than prior Folds; 4:3 inner display",
    dims_closed_mm: [81.9, 123.9, 9.7], weight_g: 201, water: "IP48",
    _verified: {}
  },
  {
    id: "galaxy-z-fold8-ultra", brand: "Samsung", name: "Galaxy Z Fold 8 Ultra",
    year: 2026, category: "foldable",
    notes: "tall/narrow shape - true successor to Fold 7's form factor",
    dims_closed_mm: [158.4, 72.8, 8.9], weight_g: 215,
    _verified: {}
  },
  {
    id: "xiaomi-18-fold", brand: "Xiaomi", name: "Xiaomi 18 Fold",
    year: 2026, released: "2026-09-10", price: 1640, category: "foldable", // CNY converted, verify USD
    chip: "XRING O3",
    display: { inner: 7.58, outer: 5.38, tech: "OLED" },
    camera: { main: 200, notes: "Leica triple camera system" },
    weight_g: 219, notes: "passport-style, first Xiaomi fold to move off tall Mix Fold shape",
    _verified: { price: false }
  },
  {
    id: "pixel-10-pro", brand: "Google", name: "Pixel 10 Pro",
    year: 2026, category: "flagship",
    chip: "Tensor G5",
    notes: "AI-centric positioning: Gemini Nano on-device, Magic Cue, Camera Coach, Pro Res Zoom, bundled year of Google AI Pro. Raw chip performance trails Snapdragon/A-series.",
    price: null, // TBD, verify at time of build
    _verified: { price: false }
  }
];