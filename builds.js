// ================================================================
// Meet-UP — Enhanced Builds Mode Engine (builds.js)
// High-Quality Procedural 3D Models & Polished Builder UI
// ================================================================

(function(window) {
    'use strict';

    const BuildSystem = {
        active: false,
        testMode: false,
        currentTool: 'add', // 'add', 'sculpt', 'remove', 'rot', 'scale', 'color'
        selectedPartType: 'cube',
        selectedColor: '#3d8bff',
        selectedObject: null,
        placedObjects: [],
        history: [],
        gridSnap: 1.0,
        ghostMesh: null,
        selectionBox: null,
        planeGround: null,
        flySpeed: 0.6,
        flyVelocity: 0,
        raycaster: new THREE.Raycaster(),
        mouse: new THREE.Vector2(),
        isMouseDown: false,
        buildGroup: null,

        // Available Part Definitions with Categories
        partCategories: [
            { id: 'struct', name: 'Struktur' },
            { id: 'arch', name: 'Arsitektur' },
            { id: 'nature', name: 'Alam' },
            { id: 'city', name: 'Kota & Hiasan' },
            { id: 'action', name: 'Aksi & Balap' }
        ],

        parts: {
            // === STRUKTUR ===
            cube: {
                id: 'cube',
                name: 'Kubus Halus',
                cat: 'struct',
                desc: 'Blok bangunan dasar dengan bevel elegan',
                defaultColor: '#3d8bff',
                create: function(color) {
                    const group = new THREE.Group();
                    const geo = new THREE.BoxGeometry(2, 2, 2);
                    const mat = new THREE.MeshLambertMaterial({ color: color || 0x3d8bff });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    group.add(mesh);

                    // Border bevel outline accent
                    const edgeGeo = new THREE.EdgesGeometry(geo);
                    const edgeMat = new THREE.LineBasicMaterial({ color: 0x17306b, linewidth: 2 });
                    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
                    group.add(edges);
                    return group;
                }
            },
            ramp: {
                id: 'ramp',
                name: 'Tanjakan / Wedge',
                cat: 'struct',
                desc: 'Tanjakan landai untuk kendaraan & lompatan',
                defaultColor: '#ffd23f',
                create: function(color) {
                    const group = new THREE.Group();
                    const shape = new THREE.Shape();
                    shape.moveTo(-1, -1);
                    shape.lineTo(1, -1);
                    shape.lineTo(1, 1);
                    shape.closePath();

                    const extrudeSettings = { depth: 2, bevelEnabled: false };
                    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    geo.center();
                    const mat = new THREE.MeshLambertMaterial({ color: color || 0xffd23f });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    group.add(mesh);

                    // Grip treads on slope
                    for (let i = -0.6; i <= 0.6; i += 0.4) {
                        const treadGeo = new THREE.BoxGeometry(0.15, 0.05, 1.8);
                        const treadMat = new THREE.MeshLambertMaterial({ color: 0x17306b });
                        const tread = new THREE.Mesh(treadGeo, treadMat);
                        tread.position.set(i, i + 0.05, 0);
                        tread.rotation.z = Math.PI / 4;
                        group.add(tread);
                    }
                    return group;
                }
            },
            cylinder: {
                id: 'cylinder',
                name: 'Pilar Bulat',
                cat: 'struct',
                desc: 'Silinder tegak halus serbaguna',
                defaultColor: '#e8f2ff',
                create: function(color) {
                    const group = new THREE.Group();
                    const geo = new THREE.CylinderGeometry(0.9, 0.9, 2, 16);
                    const mat = new THREE.MeshLambertMaterial({ color: color || 0xe8f2ff });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    group.add(mesh);

                    // Ring capital & base
                    const ringGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.2, 16);
                    const ringMat = new THREE.MeshLambertMaterial({ color: 0x17306b });
                    const topRing = new THREE.Mesh(ringGeo, ringMat);
                    topRing.position.y = 0.9;
                    const botRing = new THREE.Mesh(ringGeo, ringMat);
                    botRing.position.y = -0.9;
                    group.add(topRing, botRing);
                    return group;
                }
            },
            arch: {
                id: 'arch',
                name: 'Gerbang Lengkung',
                cat: 'struct',
                desc: 'Portal lengkung batu megah',
                defaultColor: '#cfe0f7',
                create: function(color) {
                    const group = new THREE.Group();
                    const mat = new THREE.MeshLambertMaterial({ color: color || 0xcfe0f7 });
                    const trimMat = new THREE.MeshLambertMaterial({ color: 0x17306b });

                    // Left post
                    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.5, 0.8), mat);
                    p1.position.set(-1, 0, 0);
                    // Right post
                    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.5, 0.8), mat);
                    p2.position.set(1, 0, 0);
                    // Arch lintel
                    const top = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.9), mat);
                    top.position.set(0, 1.4, 0);
                    // Keystone
                    const key = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 1.0), trimMat);
                    key.position.set(0, 1.4, 0);

                    group.add(p1, p2, top, key);
                    return group;
                }
            },
            glass_block: {
                id: 'glass_block',
                name: 'Blok Kaca Kristal',
                cat: 'struct',
                desc: 'Kaca semi-transparan dengan pantulan indah',
                defaultColor: '#7fd0ff',
                create: function(color) {
                    const group = new THREE.Group();
                    const geo = new THREE.BoxGeometry(2, 2, 2);
                    const mat = new THREE.MeshPhongMaterial({
                        color: color || 0x7fd0ff,
                        transparent: true,
                        opacity: 0.55,
                        shininess: 90
                    });
                    const mesh = new THREE.Mesh(geo, mat);
                    group.add(mesh);

                    // Inner glowing frame
                    const edgeGeo = new THREE.EdgesGeometry(geo);
                    const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
                    group.add(new THREE.LineSegments(edgeGeo, edgeMat));
                    return group;
                }
            },

            // === ARSITEKTUR ===
            castle_tower: {
                id: 'castle_tower',
                name: 'Menara Benteng',
                cat: 'arch',
                desc: 'Menara kastil batu dengan mahkota gerigi',
                defaultColor: '#9aaec4',
                create: function(color) {
                    const group = new THREE.Group();
                    const stoneMat = new THREE.MeshLambertMaterial({ color: color || 0x9aaec4 });
                    const darkMat = new THREE.MeshLambertMaterial({ color: 0x5a6a80 });

                    // Base body
                    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 2.6, 12), stoneMat);
                    group.add(body);

                    // Upper overhang
                    const trim = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.15, 0.4, 12), darkMat);
                    trim.position.y = 1.35;
                    group.add(trim);

                    // Battlements (crenels)
                    for (let i = 0; i < 6; i++) {
                        const ang = (i / 6) * Math.PI * 2;
                        const b = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.25), stoneMat);
                        b.position.set(Math.cos(ang) * 1.25, 1.7, Math.sin(ang) * 1.25);
                        b.rotation.y = -ang;
                        group.add(b);
                    }
                    return group;
                }
            },
            pagoda_roof: {
                id: 'pagoda_roof',
                name: 'Atap Pagoda Emas',
                cat: 'arch',
                desc: 'Atap melengkung gaya oriental tradisional',
                defaultColor: '#d8342a',
                create: function(color) {
                    const group = new THREE.Group();
                    const tileMat = new THREE.MeshLambertMaterial({ color: color || 0xd8342a });
                    const goldMat = new THREE.MeshLambertMaterial({ color: 0xffd23f });

                    // Tier 1 broad roof
                    const r1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.8, 4), tileMat);
                    r1.rotation.y = Math.PI / 4;
                    r1.position.y = 0.2;
                    group.add(r1);

                    // Gold eaves ridge
                    const ridge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 0.15), goldMat);
                    ridge.position.y = -0.2;
                    group.add(ridge);

                    // Spire finial
                    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 1.0, 8), goldMat);
                    finial.position.y = 1.1;
                    group.add(finial);
                    return group;
                }
            },
            pillar_roman: {
                id: 'pillar_roman',
                name: 'Pilar Corinthian',
                cat: 'arch',
                desc: 'Pilar marmer klasik megah',
                defaultColor: '#f4f9ff',
                create: function(color) {
                    const group = new THREE.Group();
                    const marble = new THREE.MeshLambertMaterial({ color: color || 0xf4f9ff });
                    const gold = new THREE.MeshLambertMaterial({ color: 0xffd23f });

                    // Base plinth
                    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), marble);
                    plinth.position.y = -1.2;
                    // Shaft
                    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 2.2, 16), marble);
                    // Capital
                    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 1.1), gold);
                    cap.position.y = 1.2;

                    group.add(plinth, shaft, cap);
                    return group;
                }
            },
            wall_window: {
                id: 'wall_window',
                name: 'Dinding Berjendela',
                cat: 'arch',
                desc: 'Dinding berpahat jendela kaca kotak',
                defaultColor: '#ffffff',
                create: function(color) {
                    const group = new THREE.Group();
                    const wallMat = new THREE.MeshLambertMaterial({ color: color || 0xffffff });
                    const glassMat = new THREE.MeshPhongMaterial({ color: 0x7fd0ff, transparent: true, opacity: 0.65 });
                    const frameMat = new THREE.MeshLambertMaterial({ color: 0x17306b });

                    const left = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.4, 0.4), wallMat);
                    left.position.set(-0.85, 0, 0);
                    const right = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.4, 0.4), wallMat);
                    right.position.set(0.85, 0, 0);
                    const bottom = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.4), wallMat);
                    bottom.position.set(0, -0.9, 0);
                    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.4), wallMat);
                    top.position.set(0, 0.9, 0);

                    // Glass
                    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.1), glassMat);
                    // Cross frame
                    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.15), frameMat);
                    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.15), frameMat);

                    group.add(left, right, bottom, top, glass, crossV, crossH);
                    return group;
                }
            },

            // === ALAM ===
            tree_oak: {
                id: 'tree_oak',
                name: 'Pohon Voxel Rindang',
                cat: 'nature',
                desc: 'Pohon hijau bertingkat dengan batang kayu kokoh',
                defaultColor: '#3fdc6a',
                create: function(color) {
                    const group = new THREE.Group();
                    const woodMat = new THREE.MeshLambertMaterial({ color: 0x7c4f24 });
                    const leafMat = new THREE.MeshLambertMaterial({ color: color || 0x3fdc6a });

                    // Trunk
                    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 1.8, 8), woodMat);
                    trunk.position.y = -0.5;
                    group.add(trunk);

                    // Leaves layers
                    const l1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.2), leafMat);
                    l1.position.y = 0.5;
                    const l2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), leafMat);
                    l2.position.y = 1.1;
                    const l3 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 1.0), leafMat);
                    l3.position.y = 1.6;

                    group.add(l1, l2, l3);
                    return group;
                }
            },
            tree_sakura: {
                id: 'tree_sakura',
                name: 'Pohon Sakura Jepang',
                cat: 'nature',
                desc: 'Bunga sakura merah muda merekah indah',
                defaultColor: '#ff9ecb',
                create: function(color) {
                    const group = new THREE.Group();
                    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a3224 });
                    const blossomMat = new THREE.MeshLambertMaterial({ color: color || 0xff9ecb });
                    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffe6f2 });

                    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 2.0, 8), woodMat);
                    trunk.position.y = -0.4;
                    trunk.rotation.z = 0.1;
                    group.add(trunk);

                    // Blossom clusters
                    const b1 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), blossomMat);
                    b1.position.set(0.1, 0.8, 0);
                    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 7, 7), whiteMat);
                    b2.position.set(-0.6, 0.9, 0.4);
                    const b3 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 7, 7), blossomMat);
                    b3.position.set(0.6, 1.0, -0.3);

                    group.add(b1, b2, b3);
                    return group;
                }
            },
            tree_palm: {
                id: 'tree_palm',
                name: 'Pohon Kelapa Tropis',
                cat: 'nature',
                desc: 'Batang melengkung khas pantai tropis',
                defaultColor: '#2eb85c',
                create: function(color) {
                    const group = new THREE.Group();
                    const woodMat = new THREE.MeshLambertMaterial({ color: 0x9b7653 });
                    const leafMat = new THREE.MeshLambertMaterial({ color: color || 0x2eb85c });

                    // Curved segmented trunk
                    for (let i = 0; i < 5; i++) {
                        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.28 - i * 0.02, 0.32 - i * 0.02, 0.6, 6), woodMat);
                        seg.position.set(Math.sin(i * 0.3) * 0.4, -0.8 + i * 0.55, 0);
                        seg.rotation.z = -i * 0.12;
                        group.add(seg);
                    }

                    // Fronds radiating out
                    for (let a = 0; a < 6; a++) {
                        const ang = (a / 6) * Math.PI * 2;
                        const frond = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.35), leafMat);
                        frond.position.set(0.4 + Math.cos(ang) * 0.8, 1.8, Math.sin(ang) * 0.8);
                        frond.rotation.y = -ang;
                        frond.rotation.z = -0.35;
                        group.add(frond);
                    }
                    return group;
                }
            },
            crystal_spire: {
                id: 'crystal_spire',
                name: 'Kristal Ajaib Bersinar',
                cat: 'nature',
                desc: 'Bongkahan kristal fantasi berpendar terang',
                defaultColor: '#8f5cff',
                create: function(color) {
                    const group = new THREE.Group();
                    const baseMat = new THREE.MeshLambertMaterial({ color: 0x2a2c3a });
                    const cryMat = new THREE.MeshPhongMaterial({
                        color: color || 0x8f5cff,
                        emissive: 0x3d2070,
                        shininess: 100,
                        transparent: true,
                        opacity: 0.85
                    });

                    // Rocky pedestal
                    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.4, 7), baseMat);
                    base.position.y = -1.0;
                    group.add(base);

                    // Central large crystal
                    const main = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.2, 5), cryMat);
                    main.position.set(0, 0.2, 0);
                    group.add(main);

                    // Sub crystals
                    const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 5), cryMat);
                    c1.position.set(0.5, -0.2, 0.3);
                    c1.rotation.z = -0.3;
                    const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 5), cryMat);
                    c2.position.set(-0.45, -0.3, -0.3);
                    c2.rotation.z = 0.35;

                    group.add(c1, c2);
                    return group;
                }
            },
            flower_pot: {
                id: 'flower_pot',
                name: 'Pot Bunga Mekar',
                cat: 'nature',
                desc: 'Pot terakota berisi tanaman berbunga ceria',
                defaultColor: '#e05a30',
                create: function(color) {
                    const group = new THREE.Group();
                    const potMat = new THREE.MeshLambertMaterial({ color: color || 0xe05a30 });
                    const dirtMat = new THREE.MeshLambertMaterial({ color: 0x3a2010 });
                    const stemMat = new THREE.MeshLambertMaterial({ color: 0x3fdc6a });
                    const petalMat = new THREE.MeshLambertMaterial({ color: 0xffd23f });

                    // Pot
                    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 0.8, 12), potMat);
                    pot.position.y = -0.4;
                    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 12), dirtMat);
                    soil.position.y = -0.02;

                    // Stem & Flower
                    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), stemMat);
                    stem.position.y = 0.4;
                    const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), petalMat);
                    blossom.position.y = 0.8;

                    group.add(pot, soil, stem, blossom);
                    return group;
                }
            },

            // === KOTA & HIASAN ===
            street_lamp: {
                id: 'street_lamp',
                name: 'Lampu Jalan Vintage',
                cat: 'city',
                desc: 'Tiang besi hitam dengan lentera hangat',
                defaultColor: '#17306b',
                create: function(color) {
                    const group = new THREE.Group();
                    const ironMat = new THREE.MeshLambertMaterial({ color: color || 0x17306b });
                    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffe27a });

                    // Pole
                    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.6, 8), ironMat);
                    pole.position.y = 0;
                    // Lantern frame
                    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), ironMat);
                    lantern.position.y = 1.4;
                    // Glowing bulb
                    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lightMat);
                    bulb.position.y = 1.4;

                    group.add(pole, lantern, bulb);
                    return group;
                }
            },
            bench: {
                id: 'bench',
                name: 'Bangku Taman Kayu',
                cat: 'city',
                desc: 'Bangku santai berbahan kayu dan rangka besi',
                defaultColor: '#b87333',
                create: function(color) {
                    const group = new THREE.Group();
                    const woodMat = new THREE.MeshLambertMaterial({ color: color || 0xb87333 });
                    const legMat = new THREE.MeshLambertMaterial({ color: 0x17306b });

                    // Seat planks
                    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.7), woodMat);
                    seat.position.set(0, -0.2, 0);
                    // Backrest
                    const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.1), woodMat);
                    back.position.set(0, 0.3, -0.3);
                    back.rotation.x = -0.15;

                    // Metal legs
                    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.7), legMat);
                    l1.position.set(-0.85, -0.5, 0);
                    const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.7), legMat);
                    l2.position.set(0.85, -0.5, 0);

                    group.add(seat, back, l1, l2);
                    return group;
                }
            },
            fountain: {
                id: 'fountain',
                name: 'Air Mancur Taman',
                cat: 'city',
                desc: 'Air mancur batu bertingkat dengan riak air biru',
                defaultColor: '#f4f9ff',
                create: function(color) {
                    const group = new THREE.Group();
                    const stoneMat = new THREE.MeshLambertMaterial({ color: color || 0xf4f9ff });
                    const waterMat = new THREE.MeshPhongMaterial({ color: 0x3d8bff, transparent: true, opacity: 0.8, shininess: 90 });

                    // Lower basin
                    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.4, 0.5, 16), stoneMat);
                    basin.position.y = -0.8;
                    const water1 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16), waterMat);
                    water1.position.y = -0.55;

                    // Central stem
                    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.4, 12), stoneMat);
                    stem.position.y = 0.1;

                    // Upper small basin
                    const basin2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 0.3, 12), stoneMat);
                    basin2.position.y = 0.7;
                    const water2 = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 12), waterMat);
                    water2.position.y = 0.85;

                    group.add(basin, water1, stem, basin2, water2);
                    return group;
                }
            },
            arcade_cabinet: {
                id: 'arcade_cabinet',
                name: 'Mesin Dingdong Retro',
                cat: 'city',
                desc: 'Arcade cabinet klasik dengan layar piksel menyala',
                defaultColor: '#ff3a5a',
                create: function(color) {
                    const group = new THREE.Group();
                    const cabMat = new THREE.MeshLambertMaterial({ color: color || 0xff3a5a });
                    const blackMat = new THREE.MeshLambertMaterial({ color: 0x111625 });
                    const screenMat = new THREE.MeshBasicMaterial({ color: 0x7fd0ff });
                    const joyMat = new THREE.MeshLambertMaterial({ color: 0xffd23f });

                    // Body
                    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 0.9), cabMat);
                    group.add(body);

                    // Screen cutout
                    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.6), screenMat);
                    screen.position.set(0, 0.4, 0.46);
                    screen.rotation.x = -0.2;
                    group.add(screen);

                    // Control panel
                    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.4), blackMat);
                    deck.position.set(0, -0.1, 0.55);
                    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2), joyMat);
                    stick.position.set(-0.2, 0.05, 0.55);
                    group.add(deck, stick);
                    return group;
                }
            },

            // === AKSI & BALAPAN ===
            boost_pad: {
                id: 'boost_pad',
                name: 'Pad Akselerasi Super',
                cat: 'action',
                desc: 'Lantai pemicu kecepatan tinggi dengan panah neon',
                defaultColor: '#ffd23f',
                create: function(color) {
                    const group = new THREE.Group();
                    const baseMat = new THREE.MeshLambertMaterial({ color: 0x17306b });
                    const arrowMat = new THREE.MeshBasicMaterial({ color: color || 0xffd23f });

                    const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 2.2), baseMat);
                    group.add(base);

                    // Neon chevrons
                    for (let z = -0.5; z <= 0.5; z += 0.5) {
                        const left = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.2), arrowMat);
                        left.position.set(-0.28, 0.12, z);
                        left.rotation.y = -Math.PI / 4;
                        const right = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.2), arrowMat);
                        right.position.set(0.28, 0.12, z);
                        right.rotation.y = Math.PI / 4;
                        group.add(left, right);
                    }
                    group.userData.isBoost = true;
                    return group;
                }
            },
            jump_pad: {
                id: 'jump_pad',
                name: 'Trampolin Pelontar',
                cat: 'action',
                desc: 'Pad lompatan pegas melontarkan karakter ke udara',
                defaultColor: '#ff5db1',
                create: function(color) {
                    const group = new THREE.Group();
                    const frameMat = new THREE.MeshLambertMaterial({ color: 0x17306b });
                    const springMat = new THREE.MeshLambertMaterial({ color: color || 0xff5db1 });

                    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16), frameMat);
                    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.15, 16), springMat);
                    pad.position.y = 0.12;

                    group.add(rim, pad);
                    group.userData.isJump = true;
                    return group;
                }
            },
            checkpoint_gate: {
                id: 'checkpoint_gate',
                name: 'Gerbang Checkpoint Balap',
                cat: 'action',
                desc: 'Gerbang neon pendeteksi waktu putaran balap',
                defaultColor: '#3fdc6a',
                create: function(color) {
                    const group = new THREE.Group();
                    const frameMat = new THREE.MeshLambertMaterial({ color: 0x17306b });
                    const neonMat = new THREE.MeshBasicMaterial({ color: color || 0x3fdc6a });

                    // Left & right towers
                    const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.5, 0.6), frameMat);
                    t1.position.set(-2.2, 0.5, 0);
                    const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.5, 0.6), frameMat);
                    t2.position.set(2.2, 0.5, 0);

                    // Cross arch
                    const cross = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.6, 0.6), frameMat);
                    cross.position.set(0, 2.2, 0);

                    // Laser beam
                    const beam = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.15, 0.15), neonMat);
                    beam.position.set(0, 2.1, 0);

                    group.add(t1, t2, cross, beam);
                    group.userData.isCheckpoint = true;
                    return group;
                }
            },
            start_banner: {
                id: 'start_banner',
                name: 'Arch Start / Finish',
                cat: 'action',
                desc: 'Gerbang garis finish dengan bendera papan catur',
                defaultColor: '#ffffff',
                create: function(color) {
                    const group = new THREE.Group();
                    const trussMat = new THREE.MeshLambertMaterial({ color: 0xdcebff });
                    const darkMat = new THREE.MeshLambertMaterial({ color: 0x17306b });

                    // Pillars
                    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.0, 0.8), trussMat);
                    p1.position.set(-3.0, 0.8, 0);
                    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.0, 0.8), trussMat);
                    p2.position.set(3.0, 0.8, 0);

                    // Checker banner
                    const banner = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.2, 0.3), darkMat);
                    banner.position.set(0, 2.8, 0);

                    // Checkered pattern blocks
                    for (let x = -2.8; x <= 2.8; x += 0.8) {
                        const sq = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.35), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                        sq.position.set(x, 2.8, 0);
                        group.add(sq);
                    }

                    group.add(p1, p2, banner);
                    return group;
                }
            },
            trophy_cup: {
                id: 'trophy_cup',
                name: 'Piala Emas Juara',
                cat: 'action',
                desc: 'Trofi piala raksasa berkilau untuk pemenang',
                defaultColor: '#ffd23f',
                create: function(color) {
                    const group = new THREE.Group();
                    const goldMat = new THREE.MeshStandardMaterial({ color: color || 0xffd23f, metalness: 0.85, roughness: 0.2 });
                    const woodMat = new THREE.MeshLambertMaterial({ color: 0x221307 });

                    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), woodMat);
                    base.position.y = -0.8;
                    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 0.6, 12), goldMat);
                    stem.position.y = -0.25;
                    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.3, 1.0, 16), goldMat);
                    cup.position.y = 0.5;

                    group.add(base, stem, cup);
                    return group;
                }
            }
        },

        init: function() {
            console.log('[BuildSystem] Initializing enhanced builds mode...');
            this.buildGroup = new THREE.Group();
            this.buildGroup.name = 'BuildSystem_World';
            if (window.World && window.World.scene) {
                window.World.scene.add(this.buildGroup);
            }

            // Create invisible raycasting plane at ground level
            const planeGeo = new THREE.PlaneGeometry(1000, 1000);
            planeGeo.rotateX(-Math.PI / 2);
            this.planeGround = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ visible: false }));
            if (window.World && window.World.scene) {
                window.World.scene.add(this.planeGround);
            }

            // Selection indicator box
            const boxGeo = new THREE.BoxGeometry(1, 1, 1);
            const boxEdge = new THREE.EdgesGeometry(boxGeo);
            this.selectionBox = new THREE.LineSegments(boxEdge, new THREE.LineBasicMaterial({ color: 0xffd23f, linewidth: 3 }));
            this.selectionBox.visible = false;
            if (window.World && window.World.scene) {
                window.World.scene.add(this.selectionBox);
            }

            this.setupUI();
            this.setupEvents();
            this.updateGhostMesh();
        },

        setupUI: function() {
            const tabsContainer = document.getElementById('part-tabs');
            const gridContainer = document.getElementById('part-grid');

            if (!tabsContainer || !gridContainer) return;

            // Render Category Tabs
            tabsContainer.innerHTML = '';
            this.partCategories.forEach((cat, idx) => {
                const btn = document.createElement('button');
                btn.className = idx === 0 ? 'on' : '';
                btn.textContent = cat.name;
                btn.onclick = () => {
                    tabsContainer.querySelectorAll('button').forEach(b => b.classList.remove('on'));
                    btn.classList.add('on');
                    this.renderPartGrid(cat.id);
                };
                tabsContainer.appendChild(btn);
            });

            // Render first category parts
            this.renderPartGrid(this.partCategories[0].id);

            // Populate inspector events
            const inPx = document.getElementById('in-px');
            const inPy = document.getElementById('in-py');
            const inPz = document.getElementById('in-pz');
            const inRy = document.getElementById('in-ry');
            const inSu = document.getElementById('in-su');
            const inCol = document.getElementById('in-col');

            if (inPx) inPx.oninput = () => { if (this.selectedObject) { this.selectedObject.position.x = parseFloat(inPx.value); this.updateSelectionBox(); } };
            if (inPy) inPy.oninput = () => { if (this.selectedObject) { this.selectedObject.position.y = parseFloat(inPy.value); this.updateSelectionBox(); } };
            if (inPz) inPz.oninput = () => { if (this.selectedObject) { this.selectedObject.position.z = parseFloat(inPz.value); this.updateSelectionBox(); } };
            if (inRy) inRy.oninput = () => { if (this.selectedObject) { this.selectedObject.rotation.y = parseFloat(inRy.value); this.updateSelectionBox(); } };
            if (inSu) inSu.oninput = () => {
                if (this.selectedObject) {
                    const s = parseFloat(inSu.value);
                    this.selectedObject.scale.set(s, s, s);
                    this.updateSelectionBox();
                }
            };
            if (inCol) inCol.oninput = () => {
                if (this.selectedObject) {
                    this.applyColorToObject(this.selectedObject, inCol.value);
                }
            };

            const inDel = document.getElementById('in-del');
            if (inDel) inDel.onclick = () => this.removeSelected();

            const inDup = document.getElementById('in-dup');
            if (inDup) inDup.onclick = () => this.duplicateSelected();

            const inClose = document.getElementById('in-close');
            if (inClose) inClose.onclick = () => this.deselect();
        },

        renderPartGrid: function(categoryId) {
            const grid = document.getElementById('part-grid');
            if (!grid) return;
            grid.innerHTML = '';

            Object.keys(this.parts).forEach(key => {
                const part = this.parts[key];
                if (part.cat !== categoryId) return;

                const btn = document.createElement('button');
                btn.className = 'pp' + (this.selectedPartType === key ? ' on' : '');
                btn.innerHTML = `
                    <div class="part-preview-icon" data-part="${key}"></div>
                    <span>${part.name}</span>
                `;
                btn.title = part.desc;
                btn.onclick = () => {
                    grid.querySelectorAll('button.pp').forEach(b => b.classList.remove('on'));
                    btn.classList.add('on');
                    this.selectPartType(key);
                };
                grid.appendChild(btn);
            });
        },

        selectPartType: function(type) {
            this.selectedPartType = type;
            this.updateGhostMesh();
            if (window.UI && window.UI.toast) {
                window.UI.toast('Part dipilih: ' + this.parts[type].name);
            }
        },

        updateGhostMesh: function() {
            if (this.ghostMesh && this.ghostMesh.parent) {
                this.ghostMesh.parent.remove(this.ghostMesh);
            }
            if (!this.parts[this.selectedPartType]) return;

            const partDef = this.parts[this.selectedPartType];
            this.ghostMesh = partDef.create(this.selectedColor);

            // Make semi-transparent ghost material
            this.ghostMesh.traverse(child => {
                if (child.isMesh) {
                    child.material = child.material.clone();
                    child.material.transparent = true;
                    child.material.opacity = 0.55;
                    child.material.depthWrite = false;
                }
            });

            this.ghostMesh.visible = (this.currentTool === 'add' && this.active && !this.testMode);
            if (window.World && window.World.scene) {
                window.World.scene.add(this.ghostMesh);
            }
        },

        setupEvents: function() {
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
            window.addEventListener('click', (e) => this.onMouseClick(e));

            // Hotkeys
            window.addEventListener('keydown', (e) => {
                if (!this.active || this.testMode) return;
                const key = e.key.toLowerCase();
                if (key === 'q') this.rotateSelected(-Math.PI / 4);
                if (key === 'e') this.rotateSelected(Math.PI / 4);
                if (key === 'delete' || key === 'backspace') this.removeSelected();
                if (key === 'escape') this.deselect();
                if (key === 'z' && (e.ctrlKey || e.metaKey)) this.undo();
            });
        },

        onMouseMove: function(e) {
            if (!this.active || this.testMode) return;
            const canvas = document.getElementById('c');
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            if (this.currentTool === 'add' && this.ghostMesh && window.World && window.World.camera) {
                this.raycaster.setFromCamera(this.mouse, window.World.camera);
                const intersects = this.raycaster.intersectObjects([this.planeGround, ...this.placedObjects], true);

                if (intersects.length > 0) {
                    const hit = intersects[0];
                    const snap = this.gridSnap;
                    const snappedX = Math.round(hit.point.x / snap) * snap;
                    const snappedZ = Math.round(hit.point.z / snap) * snap;
                    const snappedY = Math.max(1, Math.round(hit.point.y / snap) * snap);

                    this.ghostMesh.position.set(snappedX, snappedY, snappedZ);
                    this.ghostMesh.visible = true;
                }
            }
        },

        onMouseClick: function(e) {
            if (!this.active || this.testMode) return;
            if (e.target.closest('#build-ui') || e.target.closest('.popup') || e.target.closest('button')) return;

            if (this.currentTool === 'add') {
                this.placePartAtGhost();
            } else if (this.currentTool === 'sculpt' || this.currentTool === 'rot' || this.currentTool === 'remove') {
                this.pickObjectFromScreen();
            }
        },

        placePartAtGhost: function() {
            if (!this.ghostMesh || !this.ghostMesh.visible) return;
            const partDef = this.parts[this.selectedPartType];
            if (!partDef) return;

            const newObj = partDef.create(this.selectedColor);
            newObj.position.copy(this.ghostMesh.position);
            newObj.rotation.copy(this.ghostMesh.rotation);
            newObj.scale.copy(this.ghostMesh.scale);
            newObj.userData.partId = this.selectedPartType;
            newObj.userData.color = this.selectedColor;

            this.buildGroup.add(newObj);
            this.placedObjects.push(newObj);
            this.history.push({ action: 'add', object: newObj });

            // Sound and feedback
            if (window.World && window.World.playRetroSound) {
                window.World.playRetroSound('place');
            }
            if (window.UI && window.UI.toast) {
                window.UI.toast('Objek ditempatkan!');
            }
        },

        pickObjectFromScreen: function() {
            if (!window.World || !window.World.camera) return;
            this.raycaster.setFromCamera(this.mouse, window.World.camera);
            const intersects = this.raycaster.intersectObjects(this.placedObjects, true);

            if (intersects.length > 0) {
                let rootObj = intersects[0].object;
                while (rootObj.parent && rootObj.parent !== this.buildGroup) {
                    rootObj = rootObj.parent;
                }

                if (this.currentTool === 'remove') {
                    this.removeObject(rootObj);
                } else if (this.currentTool === 'rot') {
                    rootObj.rotation.y += Math.PI / 4;
                    this.updateSelectionBox();
                } else {
                    this.selectObject(rootObj);
                }
            } else {
                this.deselect();
            }
        },

        selectObject: function(obj) {
            this.selectedObject = obj;
            this.updateSelectionBox();

            // Populate inspector
            const inspector = document.getElementById('inspector');
            if (inspector) inspector.classList.remove('hide');

            const inName = document.getElementById('in-name');
            const inPx = document.getElementById('in-px');
            const inPy = document.getElementById('in-py');
            const inPz = document.getElementById('in-pz');
            const inRy = document.getElementById('in-ry');
            const inSu = document.getElementById('in-su');

            const part = this.parts[obj.userData.partId];
            if (inName) inName.textContent = part ? part.name : 'Objek';
            if (inPx) inPx.value = obj.position.x;
            if (inPy) inPy.value = obj.position.y;
            if (inPz) inPz.value = obj.position.z;
            if (inRy) inRy.value = obj.rotation.y;
            if (inSu) inSu.value = obj.scale.x;
        },

        deselect: function() {
            this.selectedObject = null;
            if (this.selectionBox) this.selectionBox.visible = false;
            const inspector = document.getElementById('inspector');
            if (inspector) inspector.classList.add('hide');
        },

        updateSelectionBox: function() {
            if (!this.selectedObject || !this.selectionBox) {
                if (this.selectionBox) this.selectionBox.visible = false;
                return;
            }
            const box = new THREE.Box3().setFromObject(this.selectedObject);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);

            this.selectionBox.scale.copy(size.addScalar(0.1));
            this.selectionBox.position.copy(center);
            this.selectionBox.visible = true;
        },

        rotateSelected: function(angle) {
            if (this.selectedObject) {
                this.selectedObject.rotation.y += angle;
                this.updateSelectionBox();
            } else if (this.ghostMesh) {
                this.ghostMesh.rotation.y += angle;
            }
        },

        removeSelected: function() {
            if (!this.selectedObject) return;
            this.removeObject(this.selectedObject);
            this.deselect();
        },

        removeObject: function(obj) {
            const idx = this.placedObjects.indexOf(obj);
            if (idx > -1) {
                this.placedObjects.splice(idx, 1);
                this.buildGroup.remove(obj);
                this.history.push({ action: 'remove', object: obj });
                if (window.World && window.World.playRetroSound) {
                    window.World.playRetroSound('delete');
                }
            }
        },

        duplicateSelected: function() {
            if (!this.selectedObject) return;
            const partId = this.selectedObject.userData.partId;
            const partDef = this.parts[partId];
            if (!partDef) return;

            const clone = partDef.create(this.selectedObject.userData.color || this.selectedColor);
            clone.position.copy(this.selectedObject.position).add(new THREE.Vector3(2, 0, 0));
            clone.rotation.copy(this.selectedObject.rotation);
            clone.scale.copy(this.selectedObject.scale);
            clone.userData.partId = partId;
            clone.userData.color = this.selectedObject.userData.color;

            this.buildGroup.add(clone);
            this.placedObjects.push(clone);
            this.selectObject(clone);
        },

        applyColorToObject: function(obj, hex) {
            obj.userData.color = hex;
            obj.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.color.set(hex);
                }
            });
        },

        undo: function() {
            if (this.history.length === 0) return;
            const last = this.history.pop();
            if (last.action === 'add') {
                this.buildGroup.remove(last.object);
                const idx = this.placedObjects.indexOf(last.object);
                if (idx > -1) this.placedObjects.splice(idx, 1);
            } else if (last.action === 'remove') {
                this.buildGroup.add(last.object);
                this.placedObjects.push(last.object);
            }
            this.deselect();
        },

        setTool: function(toolId) {
            this.currentTool = toolId;
            document.querySelectorAll('.build-tool').forEach(b => {
                b.classList.toggle('on', b.getAttribute('data-bi') === toolId);
            });

            const picker = document.getElementById('part-picker');
            if (toolId === 'add') {
                if (picker) picker.classList.remove('hide');
                if (this.ghostMesh) this.ghostMesh.visible = true;
            } else {
                if (picker) picker.classList.add('hide');
                if (this.ghostMesh) this.ghostMesh.visible = false;
            }

            if (toolId !== 'sculpt') {
                this.deselect();
            }
        },

        togglePlayMode: function() {
            this.testMode = !this.testMode;
            document.body.classList.toggle('bplay', this.testMode);

            const bstop = document.getElementById('bstop');
            const bbar = document.getElementById('build-bar');
            const picker = document.getElementById('part-picker');
            const inspector = document.getElementById('inspector');

            if (this.testMode) {
                if (bstop) bstop.classList.remove('hide');
                if (bbar) bbar.classList.add('hide');
                if (picker) picker.classList.add('hide');
                if (inspector) inspector.classList.add('hide');
                if (this.ghostMesh) this.ghostMesh.visible = false;
                if (this.selectionBox) this.selectionBox.visible = false;

                if (window.World) {
                    window.World.setBuildTestMode(true);
                }
                if (window.UI && window.UI.toast) {
                    window.UI.toast('Mode Uji Main Aktif! Tekan Berhenti untuk lanjut edit.');
                }
            } else {
                if (bstop) bstop.classList.add('hide');
                if (bbar) bbar.classList.remove('hide');
                this.setTool(this.currentTool);

                if (window.World) {
                    window.World.setBuildTestMode(false);
                }
            }
        },

        saveToLocalStorage: function(name) {
            const data = this.placedObjects.map(obj => ({
                partId: obj.userData.partId,
                color: obj.userData.color,
                px: obj.position.x,
                py: obj.position.y,
                pz: obj.position.z,
                ry: obj.rotation.y,
                sx: obj.scale.x,
                sy: obj.scale.y,
                sz: obj.scale.z
            }));

            const key = 'meetup_build_' + (name || 'autosave');
            localStorage.setItem(key, JSON.stringify(data));
            if (window.UI && window.UI.toast) {
                window.UI.toast('Bangunan berhasil disimpan: ' + (name || 'autosave'));
            }
        },

        loadFromLocalStorage: function(name) {
            const key = 'meetup_build_' + (name || 'autosave');
            const raw = localStorage.getItem(key);
            if (!raw) {
                if (window.UI && window.UI.toast) window.UI.toast('Data bangunan tidak ditemukan!');
                return;
            }

            try {
                const data = JSON.parse(raw);
                this.clearAll();
                data.forEach(item => {
                    const partDef = this.parts[item.partId];
                    if (!partDef) return;
                    const obj = partDef.create(item.color);
                    obj.position.set(item.px, item.py, item.pz);
                    obj.rotation.y = item.ry || 0;
                    obj.scale.set(item.sx || 1, item.sy || 1, item.sz || 1);
                    obj.userData.partId = item.partId;
                    obj.userData.color = item.color;
                    this.buildGroup.add(obj);
                    this.placedObjects.push(obj);
                });
                if (window.UI && window.UI.toast) window.UI.toast('Bangunan dimuat!');
            } catch (err) {
                console.error('Error loading build:', err);
            }
        },

        clearAll: function() {
            while (this.placedObjects.length > 0) {
                const obj = this.placedObjects.pop();
                this.buildGroup.remove(obj);
            }
            this.history = [];
            this.deselect();
        },

        start: function() {
            this.active = true;
            document.body.classList.add('bld');
            const buildUI = document.getElementById('build-ui');
            if (buildUI) buildUI.classList.remove('hide');
            this.setTool('add');
            if (window.World) window.World.enterBuildMode();
        },

        exit: function() {
            this.active = false;
            if (this.testMode) this.togglePlayMode();
            document.body.classList.remove('bld');
            const buildUI = document.getElementById('build-ui');
            if (buildUI) buildUI.classList.add('hide');
            if (window.World) window.World.exitBuildMode();
        }
    };

    window.BuildSystem = BuildSystem;
})(window);
