/* ═══ builds.js — Mode Bangun-Bangunan (v2) ═══
   Map, Tools, Parts (49 desain 3D), kamera bebas, mode Play, Save/Load, UI.
   Dimuat setelah world.js. ═══ */

const BUILD_GRID = 2;      // snap grid
const BUILD_LIMIT = 490;   // batas map (±)
let buildGroup, buildGhost, buildRay, buildFloor, selBox;
let placedObjects = [], selectedObject = null, undoStack = [];
let currentTool = 'add', currentPartCat = 'bentuk', currentPartType = 'wall';
let currentColor = null, ghostRot = 0, buildPlay = false;
let buildCamera = { target: new THREE.Vector3(0, 0, 0) };
const buildPtr = { x: 0, y: 0 };
const inBuild = () => playing && curMap === 'builds';

/* ───────────── Perpustakaan Part ───────────── */
const BUILD_PARTS = (() => {
    const Bx = (w, h, d, x, y, z, c, o) => Object.assign({ geo: new THREE.BoxGeometry(w, h, d), x, y, z, color: c }, o);
    const Cy = (rt, rb, h, s, x, y, z, c, o) => Object.assign({ geo: new THREE.CylinderGeometry(rt, rb, h, s), x, y, z, color: c }, o);
    const Ic = (r, x, y, z, c, o) => Object.assign({ geo: new THREE.IcosahedronGeometry(r, 1), x, y, z, color: c }, o);
    const Co = (r, h, s, x, y, z, c, o) => Object.assign({ geo: new THREE.ConeGeometry(r, h, s), x, y, z, color: c }, o);
    // prisma segitiga: profil (z,y) di-extrude sepanjang x
    const prism = (w, pts) => {
        const [a, b, c] = pts, v = [], x0 = -w / 2, x1 = w / 2;
        const tri = (p, q, r) => v.push(...p, ...q, ...r);
        const P = (x, p) => [x, p[1], p[0]];
        tri(P(x0, a), P(x0, b), P(x0, c)); tri(P(x1, a), P(x1, c), P(x1, b));
        [[a, b], [b, c], [c, a]].forEach(([p, q]) => { tri(P(x0, p), P(x1, p), P(x1, q)); tri(P(x0, p), P(x1, q), P(x0, q)); });
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
    };
    const solidGeo = ps => mergeParts(ps.map(p => Object.assign({}, p, { color: 0xffffff })));
    const mesh = ps => {
        const m = new THREE.Mesh(mergeParts(ps), new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true }));
        return m;
    };
    const grp = (ps, extra) => { const g = new THREE.Group(); g.add(mesh(ps)); if (extra) extra(g); return g; };
    const glow = (geo, c, x, y, z) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); return m; };
    const WOOD = 0x8b5a2b, DWOOD = 0x5a3a1a, STONE = 0x8a8a82, LSTONE = 0xb4b4aa;
    const steps = (n, w, h, d) => { const ps = []; for (let i = 0; i < n; i++) { const hh = h * (i + 1) / n; ps.push(Bx(w, hh, d / n, 0, hh / 2, -d / 2 + (i + .5) * d / n, 0xffffff)); } return solidGeo(ps); };

    const S = { // ── BENTUK (bisa diubah ukuran & warna) ──
        wall:   { name: 'Dinding', col: 0xd9d4c7, geo: () => solidGeo([Bx(4, 4, .5, 0, 2, 0)]) },
        wwall:  { name: 'Dinding Jendela', col: 0xd9d4c7, geo: () => solidGeo([Bx(1, 4, .5, -1.5, 2, 0), Bx(1, 4, .5, 1.5, 2, 0), Bx(2, 1, .5, 0, .5, 0), Bx(2, 1, .5, 0, 3.5, 0)]) },
        dwall:  { name: 'Dinding Pintu', col: 0xd9d4c7, geo: () => solidGeo([Bx(1, 4, .5, -1.5, 2, 0), Bx(1, 4, .5, 1.5, 2, 0), Bx(2, 1.2, .5, 0, 3.4, 0)]) },
        floor:  { name: 'Lantai', col: 0xb08a60, geo: () => solidGeo([Bx(4, .4, 4, 0, .2, 0)]) },
        pillar: { name: 'Pilar', col: 0xe8e4da, geo: () => solidGeo([Cy(.5, .6, 4, 12, 0, 2, 0), Cy(.8, .8, .3, 12, 0, .15, 0), Cy(.8, .8, .3, 12, 0, 3.85, 0)]) },
        stairs: { name: 'Tangga', col: 0xc9bfae, geo: () => steps(4, 4, 4, 4), steps: 4 },
        ramp:   { name: 'Ramp', col: 0xbbbbbb, geo: () => prism(4, [[-2, 0], [2, 0], [2, 4]]), steps: 8 },
        box:    { name: 'Kotak', col: 0x9aa8b8, geo: () => solidGeo([Bx(4, 4, 4, 0, 2, 0)]) },
        sphere: { name: 'Bola', col: 0xe07a5f, geo: () => new THREE.SphereGeometry(2, 16, 12).translate(0, 2, 0), solid: [{ w: 3, h: 4, d: 3, x: 0, y: 0, z: 0 }] },
        cone:   { name: 'Kerucut', col: 0x81b29a, geo: () => new THREE.ConeGeometry(2, 4, 12).translate(0, 2, 0), solid: [{ w: 3, h: 2, d: 3, x: 0, y: 0, z: 0 }] },
        cylinder: { name: 'Tabung', col: 0xf2cc8f, geo: () => new THREE.CylinderGeometry(2, 2, 4, 16).translate(0, 2, 0) },
        dome:   { name: 'Kubah', col: 0x8ecae6, geo: () => new THREE.SphereGeometry(2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), solid: [{ w: 3, h: 1.6, d: 3, x: 0, y: 0, z: 0 }] },
        roof:   { name: 'Atap', col: 0xb5483a, geo: () => prism(4.4, [[-2.4, 0], [2.4, 0], [0, 2.2]]), solid: [{ w: 4.4, h: 1, d: 4.8, x: 0, y: 0, z: 0 }] }
    };
    Object.values(S).forEach(p => p.sc = true);

    const N = { // ── ALAM ──
        tree: { name: 'Pohon', build: () => mesh([Cy(.6, 1, 4, 7, 0, 2, 0, 0x5a3a1a), Ic(2.2, 0, 5.2, 0, 0x3aa84a), Ic(1.6, 1.4, 6.2, .5, 0x2f8a3a), Ic(1.4, -1.2, 6.5, -.4, 0x4ac05a), Ic(1.2, .2, 7.4, -.6, 0x56c968)]), solid: [{ w: 1.2, h: 5, d: 1.2, x: 0, y: 0, z: 0 }] },
        pine: { name: 'Pinus', build: () => mesh([Cy(.4, .6, 2, 6, 0, 1, 0, 0x5a3a1a), Co(2.6, 3, 8, 0, 3.4, 0, 0x1f6b3a), Co(2.1, 2.8, 8, 0, 5.2, 0, 0x2a8a48), Co(1.5, 2.6, 8, 0, 7, 0, 0x37a85a), Co(.9, 1.6, 8, 0, 8.6, 0, 0xeaf6ff)]), solid: [{ w: 1, h: 5, d: 1, x: 0, y: 0, z: 0 }] },
        palm: { name: 'Palem', build: () => { const ps = [Cy(.35, .55, 5, 6, 0, 2.5, 0, 0xb08a58, { rx: .12 })]; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; ps.push(Co(.5, 3.2, 3, Math.cos(a) * 1.3, 5.2, Math.sin(a) * 1.3, 0x3fae4a, { rz: -Math.cos(a) * 1.25, rx: Math.sin(a) * 1.25, sy: 1 })); } ps.push(Ic(.35, .3, 4.8, 0, 0x6a4a2a), Ic(.35, -.2, 4.7, .3, 0x6a4a2a)); return mesh(ps); }, solid: [{ w: .9, h: 5, d: .9, x: 0, y: 0, z: 0 }] },
        bush: { name: 'Semak', build: () => mesh([Ic(1, 0, .8, 0, 0x3f9d4a), Ic(.8, .9, .6, .3, 0x4fb85a), Ic(.7, -.8, .55, -.2, 0x2f8a3a), Ic(.18, .5, 1.3, .6, 0xff6688), Ic(.18, -.4, 1.2, .7, 0xffd23f)]), solid: 'none' },
        flower: { name: 'Bunga', build: () => { const ps = []; [[0, 0, 0xff6688], [.5, .3, 0xffd23f], [-.4, .4, 0xb07aff]].forEach(([x, z, c], i) => { ps.push(Cy(.04, .04, .6 + i * .15, 4, x, .3 + i * .07, z, 0x3a7a2f), Ic(.2, x, .65 + i * .15, z, c), Ic(.09, x, .8 + i * .15, z, 0xffe27a)); }); return mesh(ps); }, solid: 'none' },
        grass: { name: 'Rumput', build: () => { const ps = []; for (let i = 0; i < 9; i++) { const a = i * 2.4, r = .15 + (i % 3) * .12; ps.push(Co(.12, .6 + (i % 4) * .18, 3, Math.cos(a) * r, .35 + (i % 4) * .09, Math.sin(a) * r, i % 2 ? 0x4fa040 : 0x62b84f, { rz: Math.cos(a) * .25, rx: Math.sin(a) * .25 })); } return mesh(ps); }, solid: 'none' },
        rock: { name: 'Batu', build: () => mesh([Ic(1.2, 0, .7, 0, 0x8d8d86, { sy: .75 }), Ic(.6, 1, .35, .5, 0x9c9c94, { sy: .8 })]), solid: [{ w: 2, h: 1.2, d: 2, x: 0, y: 0, z: 0 }] },
        rocks: { name: 'Tumpukan Batu', build: () => mesh([Ic(1.5, 0, .9, 0, 0x7d7d76, { sy: .8 }), Ic(1.1, 1.8, .6, .4, 0x8d8d86, { sy: .8 }), Ic(.9, -1.4, .5, .8, 0x9c9c94, { sy: .8 }), Ic(.7, .4, 1.9, -.2, 0xa8a8a0, { sy: .8 })]), solid: [{ w: 3.4, h: 1.6, d: 2.4, x: 0, y: 0, z: 0 }] },
        mushroom: { name: 'Jamur', build: () => mesh([Cy(.25, .3, .8, 6, 0, .4, 0, 0xf4ecd8), { geo: new THREE.SphereGeometry(.7, 10, 6, 0, 6.283, 0, 1.6), y: .75, color: 0xe63946 }, Ic(.1, .3, 1.3, .2, 0xffffff), Ic(.1, -.3, 1.2, -.2, 0xffffff), Ic(.08, -.1, 1.4, .4, 0xffffff)]), solid: 'none' },
        cactus: { name: 'Kaktus', build: () => mesh([Cy(.45, .5, 3.2, 8, 0, 1.6, 0, 0x3f9d5a), Ic(.45, 0, 3.2, 0, 0x3f9d5a), Cy(.22, .22, 1, 6, .8, 1.8, 0, 0x3f9d5a, { rz: 0 }), Cy(.22, .22, .8, 6, .55, 1.4, 0, 0x3f9d5a, { rz: 1.57 }), Cy(.22, .22, .9, 6, -.8, 2.2, 0, 0x3f9d5a), Cy(.22, .22, .8, 6, -.55, 1.8, 0, 0x3f9d5a, { rz: 1.57 }), Ic(.14, 0, 3.8, 0, 0xff7aa8)]), solid: [{ w: 1, h: 3.4, d: 1, x: 0, y: 0, z: 0 }] },
        stump: { name: 'Tunggul', build: () => mesh([Cy(.8, 1, 1, 9, 0, .5, 0, 0x7a4a22), Cy(.7, .7, .06, 9, 0, 1, 0, 0xd9b27a), Cy(.4, .4, .08, 9, 0, 1.01, 0, 0xc89a60)]) }
    };
    const F = { // ── PERABOT ──
        lamp: { name: 'Lampu Jalan', build: () => grp([Cy(.14, .2, 4.4, 6, 0, 2.2, 0, 0x2f343b), Cy(.35, .35, .3, 6, 0, .15, 0, 0x2f343b), Bx(1, .12, .12, .35, 4.45, 0, 0x2f343b), Bx(.8, .3, .8, .8, 4.2, 0, 0x2f343b), Co(.6, .4, 4, .8, 4.65, 0, 0x2f343b, { ry: .785 })], g => { const b = glow(new THREE.IcosahedronGeometry(.28, 1), 0xffe27a, .8, 4.05, 0); g.add(b); g.userData.tick = t => { b.scale.setScalar(1 + Math.sin(t * 5) * .04); }; }), solid: [{ w: .6, h: 4.5, d: .6, x: 0, y: 0, z: 0 }] },
        lantern: { name: 'Lentera Batu', build: () => grp([Bx(1.2, .3, 1.2, 0, .15, 0, STONE), Cy(.2, .25, 1.2, 6, 0, .9, 0, LSTONE), Bx(1, .2, 1, 0, 1.6, 0, STONE), Bx(.9, .05, .9, 0, 2.1, 0, LSTONE), Co(.95, .6, 4, 0, 2.5, 0, STONE, { ry: .785 }), Ic(.15, 0, 2.9, 0, LSTONE)], g => g.add(glow(new THREE.BoxGeometry(.6, .6, .6), 0xffd88a, 0, 1.85, 0))), solid: [{ w: 1.2, h: 3, d: 1.2, x: 0, y: 0, z: 0 }] },
        bench: { name: 'Bangku', build: () => mesh([Bx(3, .25, 1, 0, .85, 0, 0xa06a35), Bx(3, .9, .18, 0, 1.45, -.45, 0xa06a35, { rx: -.12 }), Bx(.25, .85, .9, -1.3, .42, 0, 0x2f343b), Bx(.25, .85, .9, 1.3, .42, 0, 0x2f343b), Bx(.25, .5, .15, -1.3, 1.15, -.4, 0x2f343b), Bx(.25, .5, .15, 1.3, 1.15, -.4, 0x2f343b)]), solid: [{ w: 3, h: 1, d: 1, x: 0, y: 0, z: 0 }] },
        table: { name: 'Meja', build: () => { const ps = [Bx(3, .2, 2, 0, 1.4, 0, 0xb27a3f)]; [[-1.3, -.8], [1.3, -.8], [-1.3, .8], [1.3, .8]].forEach(([x, z]) => ps.push(Bx(.2, 1.3, .2, x, .65, z, DWOOD))); ps.push(Bx(2.8, .1, 1.8, 0, 1.2, 0, DWOOD)); return mesh(ps); }, solid: [{ w: 3, h: 1.5, d: 2, x: 0, y: 0, z: 0 }] },
        chair: { name: 'Kursi', build: () => { const ps = [Bx(1, .15, 1, 0, .9, 0, 0xc0884a), Bx(1, 1.1, .12, 0, 1.5, -.44, 0xc0884a)]; [[-.4, -.4], [.4, -.4], [-.4, .4], [.4, .4]].forEach(([x, z]) => ps.push(Bx(.12, .85, .12, x, .42, z, DWOOD))); return mesh(ps); }, solid: [{ w: 1, h: 1, d: 1, x: 0, y: 0, z: 0 }] },
        crate: { name: 'Peti', build: () => { const ps = [Bx(1.6, 1.6, 1.6, 0, .8, 0, 0xb98a50)]; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => ps.push(Bx(.2, 1.7, .2, x * .78, .85, z * .78, DWOOD))); [.05, 1.6].forEach(y => ps.push(Bx(1.7, .18, 1.7, 0, y + .08, 0, DWOOD))); ps.push(Bx(.12, 2.1, .06, 0, .8, .82, DWOOD, { rz: .78 })); return mesh(ps); } },
        barrel: { name: 'Barel', build: () => mesh([Cy(.65, .7, .5, 12, 0, .25, 0, 0x8b5a2b), Cy(.8, .65, .5, 12, 0, .75, 0, 0x9a6632), Cy(.8, .8, .4, 12, 0, 1.2, 0, 0x8b5a2b), Cy(.7, .8, .5, 12, 0, 1.65, 0, 0x9a6632), Cy(.72, .72, .12, 12, 0, .45, 0, 0x2f343b), Cy(.82, .82, .12, 12, 0, 1.0, 0, 0x2f343b), Cy(.72, .72, .12, 12, 0, 1.85, 0, 0x2f343b), Cy(.62, .62, .06, 12, 0, 1.92, 0, 0xc89a60)]), solid: [{ w: 1.5, h: 1.9, d: 1.5, x: 0, y: 0, z: 0 }] },
        mailbox: { name: 'Kotak Pos', build: () => mesh([Bx(.2, 1.6, .2, 0, .8, 0, WOOD), Bx(.9, .55, .6, 0, 1.75, 0, 0x3d8bff), Cy(.3, .3, .9, 8, 0, 2.02, 0, 0x3d8bff, { rz: 1.57 }), Bx(.08, .5, .25, .5, 2.05, 0, 0xff5d5d)]), solid: [{ w: .8, h: 2.2, d: .6, x: 0, y: 0, z: 0 }] },
        pot: { name: 'Pot Tanaman', build: () => mesh([Cy(.7, .5, .9, 10, 0, .45, 0, 0xc4623a), Cy(.78, .78, .15, 10, 0, .95, 0, 0xd4724a), Ic(.7, 0, 1.4, 0, 0x3f9d4a), Ic(.5, .5, 1.6, .2, 0x4fb85a), Ic(.15, -.2, 1.9, .3, 0xff6688)]), solid: [{ w: 1.5, h: 1, d: 1.5, x: 0, y: 0, z: 0 }] },
        sign: { name: 'Papan Petunjuk', build: () => mesh([Bx(.2, 2.6, .2, 0, 1.3, 0, DWOOD), Bx(1.8, .7, .12, .5, 2.3, 0, 0xe6c07a), Co(.45, .8, 3, 1.6, 2.3, 0, 0xe6c07a, { rz: -1.57 }), Bx(1.4, .55, .12, -.3, 1.5, .02, 0xd9a85a), Bx(1.4, .08, .02, .4, 2.3, .07, DWOOD)]), solid: [{ w: .5, h: 2.6, d: .5, x: 0, y: 0, z: 0 }] },
        tent: { name: 'Tenda', build: () => mesh([{ geo: prism(3.8, [[-2.4, 0], [2.4, 0], [0, 2.8]]), color: 0xff8a3a }, { geo: prism(3.9, [[-.9, 0], [.9, 0], [0, 1.8]]), y: .01, z: 2.3 * 0 + .2, color: 0x4a2f1a }, Bx(.12, .12, 5, 0, 2.78, 0, 0x5a3a1a, { rx: 0, ry: 0 }), Bx(.08, 2.9, .08, 1.8, 1.4, 2.5, 0xcfcfcf)]), solid: [{ w: 3.8, h: 2.4, d: 4.8, x: 0, y: 0, z: 0 }] },
        umbrella: { name: 'Payung Pantai', build: () => mesh([Cy(.07, .07, 3.4, 6, 0, 1.7, 0, 0xeeeeee), Co(2.2, .9, 8, 0, 3.55, 0, 0xff5d5d), Co(1.5, .6, 8, 0, 3.8, 0, 0xffffff), Ic(.12, 0, 4.15, 0, 0xffd23f)]), solid: [{ w: .3, h: 3.5, d: .3, x: 0, y: 0, z: 0 }] }
    };
    const G = { // ── BANGUNAN ──
        house: { name: 'Rumah Kecil', build: () => mesh([Bx(6, 3.6, 5, 0, 1.8, 0, 0xf2e2c0), { geo: prism(6.8, [[-3.2, 0], [3.2, 0], [0, 2.4]]), y: 3.6, color: 0xc0503a }, Bx(1.3, 2.3, .15, 0, 1.15, 2.55, 0x6b4423), Ic(.08, .4, 1.1, 2.65, 0xffd23f), Bx(1.2, 1.1, .15, -2, 2.1, 2.55, 0x9fd8ff), Bx(1.2, 1.1, .15, 2, 2.1, 2.55, 0x9fd8ff), Bx(1.4, .15, .3, -2, 1.5, 2.6, 0xffffff), Bx(1.4, .15, .3, 2, 1.5, 2.6, 0xffffff), Bx(.8, 1.6, .8, 1.8, 5, -.8, 0x9a6a5a)]), solid: [{ w: 6, h: 3.6, d: 5, x: 0, y: 0, z: 0 }] },
        tower: { name: 'Menara', build: () => { const ps = [Cy(2, 2.4, 8, 10, 0, 4, 0, 0xa8a8a0), Cy(2.5, 2.5, .6, 10, 0, 8.3, 0, 0x8a8a82), Co(2.6, 3.4, 10, 0, 10.4, 0, 0xb5483a), Bx(.9, 1.4, .3, 0, 5, 2, 0x2a2a30), Bx(.5, 1, .3, 0, 7.2, 2, 0x2a2a30)]; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ps.push(Bx(.7, .7, .7, Math.cos(a) * 2.2, 8.9, Math.sin(a) * 2.2, 0x8a8a82, { ry: -a })); } return mesh(ps); }, solid: [{ w: 4.4, h: 8.6, d: 4.4, x: 0, y: 0, z: 0 }] },
        archway: { name: 'Gerbang', build: () => mesh([Bx(1, 7, 1, -3, 3.5, 0, 0x8a8a82), Bx(1, 7, 1, 3, 3.5, 0, 0x8a8a82), Bx(1.4, .5, 1.4, -3, .25, 0, STONE), Bx(1.4, .5, 1.4, 3, .25, 0, STONE), Bx(8, .9, 1, 0, 7.4, 0, 0x9a9a92), Bx(8.6, .3, 1.3, 0, 8, 0, 0x7a7a72), { geo: new THREE.TorusGeometry(1.4, .18, 6, 20, Math.PI), y: 7.8, color: 0xffd23f }, Ic(.4, -3, 7.5, 0, 0xffd23f, {}), Ic(.4, 3, 7.5, 0, 0xffd23f)]), solid: [{ w: 1, h: 7, d: 1, x: -3, y: 0, z: 0 }, { w: 1, h: 7, d: 1, x: 3, y: 0, z: 0 }, { w: 8, h: 1.2, d: 1, x: 0, y: 6.9, z: 0 }] },
        bridge: { name: 'Jembatan', build: () => { const ps = []; for (let i = 0; i < 10; i++) ps.push(Bx(3, .18, .72, 0, .9, -3.6 + i * .8, i % 2 ? 0xa06a35 : 0xb27a3f)); ps.push(Bx(.25, .3, 8, -1.4, .75, 0, DWOOD), Bx(.25, .3, 8, 1.4, .75, 0, DWOOD)); for (let i = 0; i < 5; i++) [-1.4, 1.4].forEach(x => ps.push(Bx(.2, 1.1, .2, x, 1.4, -3.6 + i * 1.8, WOOD))); ps.push(Bx(.15, .15, 8, -1.4, 2, 0, WOOD), Bx(.15, .15, 8, 1.4, 2, 0, WOOD)); return mesh(ps); }, solid: [{ w: 3, h: .9, d: 8, x: 0, y: 0, z: 0 }] },
        fence: { name: 'Pagar', build: () => { const ps = []; for (let i = 0; i < 5; i++) ps.push(Bx(.22, 1.4, .22, i * .8 - 1.6, .7, 0, 0xc8a070), Co(.16, .3, 4, i * .8 - 1.6, 1.55, 0, 0xc8a070, { ry: .785 })); ps.push(Bx(3.6, .15, .1, 0, .5, 0, 0xa8804f), Bx(3.6, .15, .1, 0, 1.0, 0, 0xa8804f)); return mesh(ps); }, solid: [{ w: 3.6, h: 1.4, d: .4, x: 0, y: 0, z: 0 }] },
        well: { name: 'Sumur', build: () => mesh([Cy(1.7, 1.9, 1.3, 12, 0, .65, 0, 0x8a8a82), Cy(1.4, 1.4, .1, 12, 0, 1.25, 0, 0x2a6a9a), Bx(.2, 3.2, .2, -1.5, 2.4, 0, WOOD), Bx(.2, 3.2, .2, 1.5, 2.4, 0, WOOD), Cy(.1, .1, 3.2, 6, 0, 3.6, 0, DWOOD, { rz: 1.57 }), { geo: prism(4, [[-2, 0], [2, 0], [0, 1.5]]), y: 4, color: 0xa04030 }, Cy(.05, .05, .9, 4, 0, 3.1, 0, 0xcccccc), Cy(.25, .2, .35, 8, 0, 2.5, 0, 0x8a6a3a)]), solid: [{ w: 3.8, h: 1.4, d: 3.8, x: 0, y: 0, z: 0 }] },
        fountain: { name: 'Air Mancur', build: () => grp([Cy(2.6, 2.8, .9, 16, 0, .45, 0, LSTONE), Cy(2.3, 2.3, .2, 16, 0, .85, 0, 0x4aa8e8), Cy(.4, .5, 1.8, 8, 0, 1.3, 0, 0xd0d0c6), Cy(1.2, .5, .3, 12, 0, 2.2, 0, LSTONE), Cy(1, 1, .1, 12, 0, 2.38, 0, 0x6ac0f0), Cy(.15, .15, .8, 6, 0, 2.8, 0, 0xcfefff)], g => { const dr = []; for (let i = 0; i < 8; i++) { const m = glow(new THREE.IcosahedronGeometry(.12, 0), 0x9ee0ff, 0, 0, 0); g.add(m); dr.push(m); } g.userData.tick = t => dr.forEach((m, i) => { const k = ((t * .8 + i / 8) % 1), a = i / 8 * 6.283; m.position.set(Math.cos(a) * k * 1.7, 3.2 + Math.sin(k * Math.PI) * 1.1 - k * k * 1.6, Math.sin(a) * k * 1.7); }); }), solid: [{ w: 5.2, h: 1, d: 5.2, x: 0, y: 0, z: 0 }] },
        windmill: { name: 'Kincir Angin', build: () => grp([Cy(1.3, 2.2, 6.5, 8, 0, 3.25, 0, 0xf4ecd8), Co(1.9, 2, 8, 0, 7.5, 0, 0xb5483a), Bx(.8, 1.3, .2, 0, 1.2, 2.05, 0x6b4423), Bx(.7, .8, .2, 0, 4, 1.4, 0x9fd8ff)], g => { const bl = new THREE.Group(); bl.position.set(0, 6, 1.7); bl.add(mesh([Cy(.3, .3, .8, 8, 0, 0, 0, 0x5a3a1a, { rx: 1.57 })])); for (let i = 0; i < 4; i++) { const s = mesh([Bx(.2, 3.4, .08, 0, 1.9, 0, 0x8b5a2b), Bx(.9, 2.2, .05, .5, 2.2, .06, 0xf4ecd8)]); s.rotation.z = i * Math.PI / 2; bl.add(s); } g.add(bl); g.userData.tick = t => { bl.rotation.z = t * .8; }; }), solid: [{ w: 4.4, h: 7, d: 4.4, x: 0, y: 0, z: 0 }] },
        lighthouse: { name: 'Mercusuar', build: () => grp([Cy(1.3, 2, 3, 12, 0, 1.5, 0, 0xffffff), Cy(1.05, 1.3, 3, 12, 0, 4.5, 0, 0xe63946), Cy(.85, 1.05, 3, 12, 0, 7.5, 0, 0xffffff), Cy(1.5, 1.5, .3, 12, 0, 9.15, 0, 0x2f343b), Cy(.75, .75, 1.2, 8, 0, 9.9, 0, 0xcfefff, { }), Co(1.1, 1.2, 8, 0, 11.1, 0, 0xe63946)], g => { const b = glow(new THREE.IcosahedronGeometry(.5, 1), 0xffee88, 0, 9.9, 0); g.add(b); g.userData.tick = t => { b.scale.setScalar(1 + Math.sin(t * 6) * .12); }; }), solid: [{ w: 3.4, h: 9.2, d: 3.4, x: 0, y: 0, z: 0 }] },
        flagpole: { name: 'Tiang Bendera', build: () => grp([Cy(.5, .6, .4, 8, 0, .2, 0, STONE), Cy(.08, .1, 7, 6, 0, 3.8, 0, 0xcfcfcf), Ic(.18, 0, 7.4, 0, 0xffd23f)], g => { const f = mesh([Bx(2, 1.2, .05, 1, 0, 0, 0xe63946), Bx(2, .4, .06, 1, 0, 0, 0xffffff)]); f.position.set(0, 6.5, 0); g.add(f); g.userData.tick = t => { f.rotation.y = Math.sin(t * 2.2) * .25; }; }), solid: [{ w: 1, h: 7, d: 1, x: 0, y: 0, z: 0 }] },
        statue: { name: 'Patung', build: () => mesh([Bx(2.4, .5, 2.4, 0, .25, 0, 0x8a8a8a), Bx(1.8, 1.2, 1.8, 0, 1.1, 0, 0x9a9a9a), Bx(2, .2, 2, 0, 1.8, 0, 0xaaaaaa), Cy(.5, .8, 1.8, 8, 0, 2.9, 0, 0xe6b422), Bx(.3, 1.2, .3, -.85, 3, 0, 0xe6b422, { rz: .5 }), Bx(.3, 1.6, .3, .85, 3.3, 0, 0xe6b422, { rz: -.5 }), Ic(.55, 0, 4.2, 0, 0xf2c94c), Ic(.22, 1.3, 4.1, 0, 0xffee88)]), solid: [{ w: 2.4, h: 2, d: 2.4, x: 0, y: 0, z: 0 }] },
        campfire: { name: 'Api Unggun', build: () => { const ps = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; ps.push(Cy(.14, .14, 1.5, 5, Math.cos(a) * .5, .45, Math.sin(a) * .5, DWOOD, { rz: -Math.cos(a) * .85, rx: Math.sin(a) * .85 })); } for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; ps.push({ geo: new THREE.DodecahedronGeometry(.3, 0), x: Math.cos(a) * 1.3, y: .15, z: Math.sin(a) * 1.3, color: 0x6a6a62 }); } const g = new THREE.Group(); g.add(mesh(ps)); const mk = (r, h, c, y) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .9 })); m.position.y = y; g.add(m); return m; }; const f1 = mk(.6, 1.5, 0xff5d1a, 1), f2 = mk(.4, 1.1, 0xffa51a, 1.1), f3 = mk(.22, .8, 0xffe27a, 1.1); g.userData.tick = t => { f1.scale.set(1 + Math.sin(t * 9) * .1, 1 + Math.sin(t * 11) * .18, 1); f2.scale.set(1, 1 + Math.sin(t * 13 + 1) * .2, 1); f3.scale.set(1, 1 + Math.sin(t * 17 + 2) * .25, 1); }; return g; }, solid: 'none' },
        pool: { name: 'Kolam', build: () => mesh([Bx(8, .3, 8, 0, .15, 0, 0x4aa8e8), Bx(8.6, .6, .6, 0, .3, -4, LSTONE), Bx(8.6, .6, .6, 0, .3, 4, LSTONE), Bx(.6, .6, 7.4, -4, .3, 0, LSTONE), Bx(.6, .6, 7.4, 4, .3, 0, LSTONE), Ic(.5, -2, .35, 1, 0x6ac0f0, { sy: .15 }), Ic(.4, 1.5, .35, -2, 0x6ac0f0, { sy: .15 })]), solid: [{ w: 8.6, h: .6, d: 8.6, x: 0, y: 0, z: 0 }] }
    };

    const defs = { bentuk: S, alam: N, perabot: F, bangunan: G };
    for (const c in defs) for (const k in defs[c]) { defs[c][k].cat = c; defs[c][k].key = k; }
    return defs;
})();
const BUILD_CAT_NAMES = { bentuk: 'Bentuk', alam: 'Alam', perabot: 'Perabot', bangunan: 'Bangunan' };
const BUILD_COLORS = [0xd9d4c7, 0xffffff, 0x9aa8b8, 0x5c6b7a, 0xe63946, 0xf2cc8f, 0xffd23f, 0x81b29a, 0x3d8bff, 0xb08a60, 0xff8ad8, 0x2f343b];
const BUILD_INDEX = {}; for (const c in BUILD_PARTS) for (const k in BUILD_PARTS[c]) BUILD_INDEX[k] = BUILD_PARTS[c][k];

function bMake(type, color) {
    const d = BUILD_INDEX[type]; if (!d) return null;
    let o;
    if (d.sc) {
        const c = color != null ? color : d.col;
        o = new THREE.Mesh(d.geo(), new THREE.MeshPhongMaterial({ color: c, flatShading: true, shininess: 8, side: THREE.DoubleSide }));
        o.userData.color = c;
    } else o = d.build();
    o.userData.type = type; o.userData.sc = !!d.sc;
    o.traverse(m => { if (m.isMesh) { m.castShadow = !!R.shadowMap.enabled; m.receiveShadow = true; } });
    return o;
}

/* ───────────── Thumbnail 3D untuk picker ───────────── */
const bThumb = (() => {
    let r, sc2, cm, cache = {};
    return type => {
        if (cache[type]) return cache[type];
        try {
            if (!r) {
                r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
                r.setSize(88, 88); r.setPixelRatio(1);
                sc2 = new THREE.Scene(); sc2.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, .95));
                const dl2 = new THREE.DirectionalLight(0xffffff, .8); dl2.position.set(3, 6, 4); sc2.add(dl2);
                cm = new THREE.PerspectiveCamera(32, 1, .1, 200);
            }
            const o = bMake(type); const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
            const rad = Math.max(s.x, s.y, s.z, .5) * .5 * 1.08; const dist = rad / Math.tan(16 * Math.PI / 180) * 1.12;
            sc2.add(o); cm.position.set(c.x + dist * .62, c.y + dist * .42, c.z + dist * .66); cm.lookAt(c);
            r.setClearColor(0x000000, 0); r.render(sc2, cm);
            cache[type] = r.domElement.toDataURL('image/png'); sc2.remove(o);
        } catch (e) { cache[type] = ''; }
        return cache[type];
    };
})();

/* ───────────── Init ───────────── */
function initBuildMode() {
    if (buildGroup) sc.remove(buildGroup);
    buildGroup = new THREE.Group(); sc.add(buildGroup);
    placedObjects = []; selectedObject = null; undoStack = []; selBox = null; buildGhost = null;
    currentTool = 'add'; currentPartCat = 'bentuk'; currentPartType = 'wall'; currentColor = null; ghostRot = 0; buildPlay = false;
    buildCamera.target.set(0, 0, 0);
    cy = .6; pitch = .75; zd = 10; cam.fov = 60; cam.updateProjectionMatrix();

    buildFloor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshPhongMaterial({ color: 0x3f9a4e }));
    buildFloor.rotation.x = -Math.PI / 2; buildFloor.position.y = .04; buildFloor.receiveShadow = true; buildFloor.name = 'BUILD_FLOOR';
    buildGroup.add(buildFloor);
    const grid = new THREE.GridHelper(1000, 1000 / BUILD_GRID / 2, 0x0d3a18, 0x0d3a18);
    grid.position.y = .09; grid.material.transparent = true; grid.material.opacity = .28; grid.name = 'BUILD_GRID';
    buildGroup.add(grid);
    const axes = new THREE.GridHelper(1000, 1000 / 20, 0x145020, 0x145020); axes.position.y = .1; axes.material.transparent = true; axes.material.opacity = .35; buildGroup.add(axes);

    buildRay = new THREE.Raycaster();
    document.body.classList.add('bld'); document.body.classList.remove('bplay');
    $('hud').classList.remove('hide');
    bBindInput(); initBuildUI(); switchTool('add'); bPickerRefresh();
    pl.vy = pl.vx = pl.vz = 0; pl.y = 0; pl.root.visible = true;
    toast('Mode Builds! Drag = putar kamera · WASD = geser · Klik = pasang · Tombol ▶ = coba main');
}
function buildCleanup() {
    buildPlay = false; cols.length = 0;
    document.body.classList.remove('bld', 'bplay');
    ['part-picker', 'inspector', 'save-panel', 'bstop'].forEach(i => { const e = document.getElementById(i); if (e) e.classList.add('hide'); });
    if (buildGroup) { sc.remove(buildGroup); buildGroup = null; }
}

/* ───────────── Input (klik ≠ drag) ───────────── */
function bBindInput() {
    if (bBindInput.done) return; bBindInput.done = true;
    const down = new Map(); cv.style.touchAction = 'none';
    const set = e => { buildPtr.x = e.clientX / innerWidth * 2 - 1; buildPtr.y = -(e.clientY / innerHeight * 2 - 1); };
    cv.addEventListener('pointerdown', e => { if (!inBuild()) return; down.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now(), mv: 0 }); if (down.size > 1) down.forEach(d => d.multi = 1); set(e); });
    cv.addEventListener('pointermove', e => { if (!inBuild()) return; const d = down.get(e.pointerId); if (d) d.mv = Math.max(d.mv, Math.hypot(e.clientX - d.x, e.clientY - d.y)); set(e); });
    const up = e => {
        const d = down.get(e.pointerId); down.delete(e.pointerId);
        if (!d || e.type === 'pointercancel' || d.multi || d.mv > 8 || performance.now() - d.t > 350 || buildPlay || (e.pointerType === 'mouse' && e.button !== 0) || !inBuild()) return;
        set(e); buildClick();
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('keydown', e => {
        if (!inBuild() || e.target.tagName === 'INPUT') return;
        if (e.code === 'KeyR' || e.code === 'KeyQ') rotateGhost();
        else if ((e.code === 'Delete' || e.code === 'Backspace') && selectedObject) { deleteObj(selectedObject); }
        else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) { buildUndo(); e.preventDefault(); }
        else if (e.code === 'KeyP') buildPlay ? stopPlay() : startPlay();
    });
}
function bSfx(k) { try { if (k === 'place') { tn(420, 760, .09, 'square', .14); nz(.05, .08, 1800); } else if (k === 'del') { tn(320, 90, .13, 'sawtooth', .13); } else tn(600, 600, .04, 'square', .08); } catch (e) { } }

/* ───────────── Ghost / penempatan ───────────── */
function updateGhostPart() {
    if (buildGhost) { buildGroup.remove(buildGhost); buildGhost = null; }
    if (currentTool !== 'add' || buildPlay) return;
    const o = bMake(currentPartType); if (!o) return;
    const gm = new THREE.MeshBasicMaterial({ color: 0x58b4ff, transparent: true, opacity: .5, depthWrite: false });
    o.traverse(m => { if (m.isMesh) { m.material = gm; m.castShadow = m.receiveShadow = false; } });
    o.userData.tick = null; buildGhost = o; o.rotation.y = ghostRot; buildGroup.add(o);
}
function rotateGhost() { ghostRot = (ghostRot + Math.PI / 2) % (Math.PI * 2); if (buildGhost) buildGhost.rotation.y = ghostRot; bSfx('tick'); }
function bRoot(o) { while (o.parent && o.parent !== buildGroup) o = o.parent; return o; }

function placeGhost() {
    if (!buildGhost) return false;
    buildRay.setFromCamera(buildPtr, cam);
    const hits = buildRay.intersectObjects([buildFloor, ...placedObjects], true);
    if (!hits.length) return false;
    const h = hits[0], p = h.point.clone(); let y = 0;
    buildGhost.rotation.y = ghostRot; buildGhost.updateMatrixWorld(true);
    const gb = new THREE.Box3().setFromObject(buildGhost), hx = (gb.max.x - gb.min.x) / 2, hz = (gb.max.z - gb.min.z) / 2;
    if (h.object !== buildFloor) {
        const root = bRoot(h.object), rb = new THREE.Box3().setFromObject(root);
        const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
        if (n.y > .6) y = rb.max.y;
        else { y = rb.min.y; if (Math.abs(n.x) > Math.abs(n.z)) p.x += Math.sign(n.x) * hx; else p.z += Math.sign(n.z) * hz; }
    }
    p.x = Math.round(p.x / BUILD_GRID) * BUILD_GRID; p.z = Math.round(p.z / BUILD_GRID) * BUILD_GRID;
    p.x = Math.max(-BUILD_LIMIT, Math.min(BUILD_LIMIT, p.x)); p.z = Math.max(-BUILD_LIMIT, Math.min(BUILD_LIMIT, p.z));
    buildGhost.position.set(p.x, Math.max(0, y), p.z);
    return true;
}

function buildClick() {
    if (currentTool === 'add') {
        if (!placeGhost()) return;
        const o = bMake(currentPartType, BUILD_INDEX[currentPartType].sc ? currentColor : null); if (!o) return;
        o.position.copy(buildGhost.position); o.rotation.y = ghostRot;
        addObj(o, true); bSfx('place');
    } else {
        buildRay.setFromCamera(buildPtr, cam);
        const hit = buildRay.intersectObjects(placedObjects, true)[0];
        if (!hit) { if (currentTool === 'sculpt') selectObj(null); return; }
        const t = bRoot(hit.object);
        if (currentTool === 'remove') deleteObj(t); else selectObj(t);
    }
}
function addObj(o, record) {
    buildGroup.add(o); placedObjects.push(o);
    if (record) { undoStack.push({ t: 'add', o }); if (undoStack.length > 80) undoStack.shift(); }
}
function deleteObj(o) {
    if (!placedObjects.includes(o)) return;
    buildGroup.remove(o); placedObjects = placedObjects.filter(x => x !== o);
    if (selectedObject === o) selectObj(null);
    undoStack.push({ t: 'del', o }); bSfx('del');
}
function buildUndo() {
    const a = undoStack.pop(); if (!a) { toast('Tidak ada yang bisa di-undo'); return; }
    if (a.t === 'add') { buildGroup.remove(a.o); placedObjects = placedObjects.filter(x => x !== a.o); if (selectedObject === a.o) selectObj(null); }
    else { buildGroup.add(a.o); placedObjects.push(a.o); }
    bSfx('tick');
}
function selectObj(o) {
    selectedObject = o;
    if (selBox) { buildGroup.remove(selBox); selBox = null; }
    if (!o) { hideInspector(); return; }
    selBox = new THREE.BoxHelper(o, 0xffd23f); selBox.material.depthTest = false; selBox.renderOrder = 9; buildGroup.add(selBox);
    showInspector(o);
}

/* ───────────── Loop ───────────── */
function updateBuildMode(now, dt) {
    if (!inBuild() || !buildGroup) return;
    const t = buildCamera.target, typing = document.activeElement && document.activeElement.tagName === 'INPUT';
    const tm = now / 1000;
    for (const o of placedObjects) if (o.userData.tick) o.userData.tick(tm);

    if (buildPlay) { buildPlayStep(dt); }
    else {
        const k = typing ? {} : keys;
        const a = ix + (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), b = iy + (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0);
        const dist = 4 + zd * zd * .25, sp = (14 + dist * .55) * dt * (k.ShiftRight ? .35 : 1);
        t.x += (Math.cos(cy) * a - Math.sin(cy) * b) * sp; t.z += (-Math.sin(cy) * a - Math.cos(cy) * b) * sp;
        t.y += ((k.Space ? 1 : 0) + (bHold.up ? 1 : 0) - (k.ShiftLeft ? 1 : 0) - (bHold.down ? 1 : 0)) * sp;
        if (k.ArrowLeft) cy += dt * 2; if (k.ArrowRight) cy -= dt * 2;
        if (k.ArrowUp) pitch -= dt * 1.5; if (k.ArrowDown) pitch += dt * 1.5;
        pitch = Math.min(1.5, Math.max(.05, pitch));
        t.x = Math.max(-BUILD_LIMIT, Math.min(BUILD_LIMIT, t.x)); t.z = Math.max(-BUILD_LIMIT, Math.min(BUILD_LIMIT, t.z)); t.y = Math.max(0, Math.min(120, t.y));
        const cp = Math.cos(pitch);
        cam.position.set(t.x + Math.sin(cy) * cp * dist, Math.max(.6, t.y + Math.sin(pitch) * dist), t.z + Math.cos(cy) * cp * dist);
        cam.lookAt(t.x, t.y, t.z);
        pl.x = t.x; pl.z = t.z; pl.y = 0; pl.vx = pl.vz = pl.vy = 0;
        if (currentTool === 'add') placeGhost();
        if (selBox) selBox.update();
    }
    // bayangan & langit mengikuti kamera
    const f = buildPlay ? pl : t;
    if (skyDome) skyDome.position.set(f.x, 0, f.z);
    dl.position.set(f.x + 60, 100, f.z + 40); dlTarget.position.set(f.x, 0, f.z);
    if (R.shadowMap.enabled) dl.shadow.camera.updateProjectionMatrix();
}
const bHold = { up: 0, down: 0 };

/* ───────────── Mode Play (coba jalan di bangunanmu) ───────────── */
function buildCols() {
    cols.length = 0;
    cols.push({ x: 0, y: -3, z: 0, w: 1200, h: 3, d: 1200, enabled: true, slip: 0 });
    const v = new THREE.Vector3(), bb = new THREE.Box3();
    for (const o of placedObjects) {
        const d = BUILD_INDEX[o.userData.type]; o.updateMatrixWorld(true);
        const swap = Math.abs(Math.sin(o.rotation.y)) > .7, S = o.scale;
        const push = (w, h, dd, cx, cy_, cz) => cols.push({ x: cx, y: cy_, z: cz, w: swap ? dd : w, h, d: swap ? w : dd, enabled: true, slip: 0 });
        if (d.solid === 'none') continue;
        if (d.steps) { // tangga/ramp: potong jadi anak tangga
            const n = d.steps, H = 4 * S.y, W = 4 * S.x, D = 4 * S.z;
            for (let i = 0; i < n; i++) { v.set(0, 0, -2 * S.z + (i + .5) * D / n).applyEuler(o.rotation).add(o.position); push(W, H * (i + 1) / n, D / n + .02, v.x, o.position.y, v.z); }
        } else if (Array.isArray(d.solid)) {
            for (const s of d.solid) { v.set(s.x * S.x, 0, s.z * S.z).applyEuler(o.rotation).add(o.position); push(s.w * S.x, s.h * S.y, s.d * S.z, v.x, o.position.y + s.y * S.y, v.z); }
        } else {
            bb.setFromObject(o); push(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z, (bb.max.x + bb.min.x) / 2, bb.min.y, (bb.max.z + bb.min.z) / 2);
            const c = cols[cols.length - 1]; c.w = bb.max.x - bb.min.x; c.d = bb.max.z - bb.min.z; // sudah dalam koordinat dunia
        }
    }
}
function startPlay() {
    if (buildPlay) return;
    buildPlay = true; selectObj(null);
    if (buildGhost) { buildGroup.remove(buildGhost); buildGhost = null; }
    ['part-picker', 'inspector', 'save-panel'].forEach(i => $(i).classList.add('hide'));
    buildCols();
    pl.x = buildCamera.target.x; pl.z = buildCamera.target.z; pl.y = 200; pl.vx = pl.vz = pl.vy = 0; pl.y = groundY().GY; pl.jc = 0;
    zd = 9; pitch = .45; cam.fov = 60;
    document.body.classList.add('bplay'); $('bstop').classList.remove('hide'); $('build-bar').classList.add('hide');
    toast('Mode Main! Joystick / WASD = jalan · Spasi / JUMP = lompat · ■ = kembali edit');
}
function stopPlay() {
    if (!buildPlay) return;
    buildPlay = false; cols.length = 0;
    buildCamera.target.set(pl.x, Math.max(0, pl.y), pl.z); pl.y = 0; pl.vx = pl.vz = pl.vy = 0;
    zd = 10; pitch = .75;
    document.body.classList.remove('bplay'); $('bstop').classList.add('hide'); $('build-bar').classList.remove('hide');
    switchTool(currentTool);
}
function buildPlayStep(dt) {
    const k = document.activeElement && document.activeElement.tagName === 'INPUT' ? {} : keys;
    const jumpIn = jmp || k.Space, fresh = jumpIn && !pl._prevJump; pl._prevJump = jumpIn; jmp = false;
    if (k.ArrowLeft) cy += dt * 2; if (k.ArrowRight) cy -= dt * 2;
    let a = ix + (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), b = iy + (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0);
    const l = Math.hypot(a, b); if (l > 1) { a /= l; b /= l; }
    const mx = Math.cos(cy) * a - Math.sin(cy) * b, mz = -Math.sin(cy) * a - Math.cos(cy) * b, sp = (run || k.ShiftLeft) ? 9 : 5;
    pl.vx += (mx * sp - pl.vx) * Math.min(1, dt * 24); pl.vz += (mz * sp - pl.vz) * Math.min(1, dt * 24);
    pl.x += pl.vx * dt; pl.z += pl.vz * dt; resolveH();
    pl.x = Math.max(-BUILD_LIMIT, Math.min(BUILD_LIMIT, pl.x)); pl.z = Math.max(-BUILD_LIMIT, Math.min(BUILD_LIMIT, pl.z));
    if (a || b) { const th = Math.atan2(mx, mz); let d = th - pl.r; d = Math.atan2(Math.sin(d), Math.cos(d)); pl.r += d * Math.min(1, dt * 12); }
    let GY = groundY().GY;
    if (pl.y <= GY + .01) pl.jc = 0;
    if (fresh && pl.jc < 2) { pl.vy = pl.jc ? 9 : 8; pl.jc++; }
    pl.pvy = pl.vy; pl.vy -= 22 * dt; pl.y += pl.vy * dt;
    GY = groundY().GY; if (pl.y <= GY) { pl.y = GY; if (pl.vy < 0) pl.vy = 0; }
    const cp = Math.cos(pitch);
    cam.position.set(pl.x + Math.sin(cy) * cp * zd, Math.max(.4, pl.y + 1 + Math.sin(pitch) * zd), pl.z + Math.cos(cy) * cp * zd);
    cam.lookAt(pl.x, pl.y + .8, pl.z);
}

/* ───────────── UI ───────────── */
const B_ICONS = {
    add: '<path d="M12 5v14M5 12h14"/>', sculpt: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>', remove: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v6M14 11v6"/>',
    rot: '<path d="M19 12a7 7 0 1 1-2.1-5M19 4v4h-4"/>', undo: '<path d="M9 5L4 10l5 5M4 10h10a5 5 0 0 1 0 10h-4"/>',
    play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>', stop: '<rect x="6" y="6" width="12" height="12" fill="currentColor"/>',
    save: '<path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6"/>', exit: '<path d="M10 4H5v16h5M14 8l5 4-5 4M19 12H9"/>', up: '<path d="M12 19V6M6 11l6-6 6 6"/>', down: '<path d="M12 5v13M6 13l6 6 6-6"/>'
};
const bIcon = k => '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter">' + B_ICONS[k] + '</svg>';

function initBuildUI() {
    const ui = $('build-ui'); ui.classList.remove('hide');
    document.querySelectorAll('[data-bi]').forEach(b => { const s = b.querySelector('i'); if (s) s.innerHTML = bIcon(b.dataset.bi); });
    $('bt-add').onclick = () => { if (currentTool === 'add') $('part-picker').classList.toggle('hide'); else switchTool('add'); };
    $('bt-sculpt').onclick = () => switchTool('sculpt');
    $('bt-remove').onclick = () => switchTool('remove');
    $('bt-rot').onclick = rotateGhost;
    $('bt-undo').onclick = buildUndo;
    $('bt-play').onclick = startPlay; $('bt-stop').onclick = stopPlay;
    $('bt-save').onclick = () => { $('save-panel').classList.remove('hide'); refreshLoadList(); };
    $('bt-exit').onclick = () => { buildCleanup(); leave(); };
    const hold = (id, k) => { const e = $(id); const on = ev => { ev.preventDefault(); bHold[k] = 1; }, off = () => bHold[k] = 0; e.onpointerdown = on; e.onpointerup = e.onpointercancel = e.onpointerleave = off; };
    hold('bt-up', 'up'); hold('bt-down', 'down');

    const ids = ['sx', 'sy', 'sz', 'ry', 'px', 'py', 'pz'];
    ids.forEach(id => {
        const s = $('in-' + id); if (!s) return;
        s.oninput = () => {
            const o = selectedObject; if (!o) return; const v = parseFloat(s.value);
            if (id === 'sx') o.scale.x = v; else if (id === 'sy') o.scale.y = v; else if (id === 'sz') o.scale.z = v;
            else if (id === 'ry') o.rotation.y = v; else if (id === 'px') o.position.x = v; else if (id === 'py') o.position.y = v; else o.position.z = v;
            if (selBox) selBox.update();
        };
    });
    $('in-su').oninput = () => { const o = selectedObject; if (!o) return; const v = parseFloat($('in-su').value); o.scale.multiplyScalar(v / (o.userData._su || 1)); o.userData._su = v; ['sx', 'sy', 'sz'].forEach(i => $('in-' + i).value = o.scale[i[1]]); if (selBox) selBox.update(); };
    $('in-col').oninput = () => { const o = selectedObject; if (!o || !o.userData.sc) return; o.material.color.set($('in-col').value); o.userData.color = o.material.color.getHex(); };
    $('in-dup').onclick = () => {
        const o = selectedObject; if (!o) return; const n = bMake(o.userData.type, o.userData.color);
        n.position.copy(o.position); n.position.x += BUILD_GRID * 2; n.rotation.copy(o.rotation); n.scale.copy(o.scale);
        addObj(n, true); selectObj(n); bSfx('place');
    };
    $('in-del').onclick = () => { if (selectedObject) deleteObj(selectedObject); };
    $('in-close').onclick = () => selectObj(null);

    $('btn-save').onclick = saveBuild; $('btn-load').onclick = loadBuild;
    $('save-close').onclick = () => $('save-panel').classList.add('hide');
}

function bPickerRefresh() {
    const tabs = $('part-tabs'), grid = $('part-grid'), cols_ = $('part-colors');
    tabs.innerHTML = '';
    for (const c in BUILD_PARTS) {
        const b = document.createElement('button'); b.textContent = BUILD_CAT_NAMES[c]; b.className = 's' + (c === currentPartCat ? ' on' : '');
        b.onclick = () => { currentPartCat = c; bPickerRefresh(); }; tabs.appendChild(b);
    }
    grid.innerHTML = '';
    for (const k in BUILD_PARTS[currentPartCat]) {
        const d = BUILD_PARTS[currentPartCat][k], b = document.createElement('button');
        b.className = 'pp' + (k === currentPartType ? ' on' : ''); b.title = d.name;
        const im = document.createElement('img'); im.alt = ''; im.width = im.height = 56; b.appendChild(im);
        const sp = document.createElement('span'); sp.textContent = d.name; b.appendChild(sp);
        requestAnimationFrame(() => { im.src = bThumb(k); });
        b.onclick = () => { currentPartType = k; ghostRot = 0; updateGhostPart(); $('part-picker').classList.add('hide'); bPickerRefresh(); };
        grid.appendChild(b);
    }
    cols_.classList.toggle('hide', currentPartCat !== 'bentuk');
    cols_.innerHTML = '';
    BUILD_COLORS.forEach(c => {
        const b = document.createElement('button'); b.className = 'sw' + (currentColor === c ? ' on' : ''); b.style.background = '#' + c.toString(16).padStart(6, '0');
        b.onclick = () => { currentColor = c; if (buildGhost) { /* ghost tetap biru */ } bPickerRefresh(); }; cols_.appendChild(b);
    });
}

function switchTool(tool) {
    currentTool = tool; selectObj(null);
    if (buildGhost) { buildGroup.remove(buildGhost); buildGhost = null; }
    if (tool === 'add') updateGhostPart();
    ['add', 'sculpt', 'remove'].forEach(t => $('bt-' + t).classList.toggle('on', t === tool));
    $('bt-rot').style.display = tool === 'add' ? '' : 'none';
    if (tool !== 'add') $('part-picker').classList.add('hide'); 
    $('bhint').textContent = tool === 'add' ? 'Klik / tap = pasang · R = putar · klik lagi tombol + = daftar part' : tool === 'sculpt' ? 'Klik objek untuk diedit: geser, ubah ukuran, warna' : 'Klik objek untuk menghapus';
}
function showInspector(o) {
    $('inspector').classList.remove('hide');
    const v = (i, x) => $('in-' + i).value = x;
    v('sx', o.scale.x); v('sy', o.scale.y); v('sz', o.scale.z); v('ry', ((o.rotation.y % 6.283) + 6.283) % 6.283); v('px', o.position.x); v('py', o.position.y); v('pz', o.position.z); v('su', o.userData._su || 1);
    $('in-colrow').classList.toggle('hide', !o.userData.sc);
    if (o.userData.sc) $('in-col').value = '#' + new THREE.Color(o.userData.color).getHexString();
    $('in-name').textContent = BUILD_INDEX[o.userData.type].name;
}
function hideInspector() { $('inspector').classList.add('hide'); }

/* ───────────── Save / Load ───────────── */
function saveBuild() {
    const name = $('save-name').value.trim();
    if (!name) { toast('Masukkan nama bangunan!'); return; }
    const data = { v: 2, items: placedObjects.map(o => ({ type: o.userData.type, color: o.userData.color, x: o.position.x, y: o.position.y, z: o.position.z, ry: o.rotation.y, sx: o.scale.x, sy: o.scale.y, sz: o.scale.z })) };
    try { localStorage.setItem('meetup_build_' + name, JSON.stringify(data)); toast('Bangunan "' + name + '" berhasil disimpan!'); refreshLoadList(); }
    catch (e) { toast('Gagal menyimpan: ' + e.message); }
}
function loadBuild() {
    const name = $('load-list').value;
    if (!name) { toast('Pilih bangunan yang mau dimuat!'); return; }
    try {
        const raw = JSON.parse(localStorage.getItem('meetup_build_' + name)); if (!raw) return;
        const items = Array.isArray(raw) ? raw : raw.items;
        selectObj(null); placedObjects.forEach(o => buildGroup.remove(o)); placedObjects = []; undoStack = [];
        items.forEach(d => {
            const o = bMake(d.type, d.color); if (!o) return;
            o.position.set(d.x, d.y, d.z); o.rotation.y = d.ry || 0; o.scale.set(d.sx || 1, d.sy || 1, d.sz || 1);
            addObj(o, false);
        });
        toast('Bangunan "' + name + '" dimuat (' + placedObjects.length + ' objek)'); $('save-panel').classList.add('hide');
    } catch (e) { toast('Gagal memuat: ' + e.message); }
}
function refreshLoadList() {
    const sel = $('load-list'); sel.innerHTML = '';
    Object.keys(localStorage).filter(k => k.startsWith('meetup_build_')).forEach(key => {
        const opt = document.createElement('option'); opt.value = key.replace('meetup_build_', ''); opt.textContent = opt.value; sel.appendChild(opt);
    });
    if (!sel.children.length) { const opt = document.createElement('option'); opt.textContent = 'Belum ada simpanan'; opt.disabled = true; sel.appendChild(opt); }
}
