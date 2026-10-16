/* ═══ builds.js — Mode Bangun-Bangunan ═══
   Berisi logika untuk mode Builds: Map, Tools, Parts, Save/Load, dan UI.
   Dimuat setelah world.js dan game.js. ═══ */

const BUILD_GRID = 4; // Ukuran grid
const BUILD_LIMIT = 500; // Batas luas map (1000x1000 total)
let buildGroup, buildGhost, buildRaycaster, buildMouse;
let placedObjects = [];
let selectedObject = null;
let currentTool = 'add'; // 'add', 'sculpt', 'remove'
let currentPartCat = 'sculptable';
let currentPartType = 'wall';
let buildCamera = { target: new THREE.Vector3(0, 0, 0) };

// ── Part Library ──
const BUILD_PARTS = {
    sculptable: {
        wall: { name: 'Dinding', geo: () => new THREE.BoxGeometry(1, 1, 1), col: 0xcccccc },
        floor: { name: 'Lantai', geo: () => new THREE.BoxGeometry(1, 0.2, 1), col: 0xaaaaaa },
        pillar: { name: 'Pilar', geo: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 8), col: 0xdddddd },
        ramp: { name: 'Ramp', geo: () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), col: 0xbbbbbb, custom: true },
        box: { name: 'Kotak', geo: () => new THREE.BoxGeometry(1, 1, 1), col: 0x999999 },
        sphere: { name: 'Bola', geo: () => new THREE.SphereGeometry(0.5, 8, 8), col: 0x888888 }
    },
    nonsculptable: {
        lamp: { name: 'Lampu Jalan', build: () => buildLamp() },
        bench: { name: 'Bangku', build: () => buildBench() },
        tree: { name: 'Pohon', build: () => buildTree() },
        flower: { name: 'Bunga', build: () => buildFlower() },
        grass: { name: 'Rumput', build: () => buildGrass() },
        fence: { name: 'Pagar', build: () => buildFence() },
        crate: { name: 'Peti', build: () => buildCrate() },
        barrel: { name: 'Barel', build: () => buildBarrel() },
        statue: { name: 'Patung', build: () => buildStatue() },
        campfire: { name: 'Api Unggun', build: () => buildCampfire() },
        well: { name: 'Sumur', build: () => buildWell() },
        archway: { name: 'Gerbang', build: () => buildArchway() }
    }
};

// ── Build Helpers (Objek Non-Sculptable) ──
function buildLamp() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 4, 6), LM(0x333333));
    pole.position.y = 2; g.add(pole);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), LM(0x333333));
    head.position.y = 4.2; g.add(head);
    const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({ color: 0xffe27a }));
    bulb.position.y = 4; g.add(bulb);
    return g;
}
function buildBench() {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 1), LM(0x8b5a2b));
    seat.position.y = 0.8; g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 0.2), LM(0x8b5a2b));
    back.position.set(0, 1.5, -0.4); g.add(back);
    for(let i=-1; i<=1; i+=2) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.8), LM(0x5a3a1a));
        leg.position.set(i*1.2, 0.4, 0); g.add(leg);
    }
    return g;
}
function buildTree() {
    const P = [];
    P.push({ geo: new THREE.CylinderGeometry(0.6, 1, 4, 7), y: 2, color: 0x5a3a1a });
    P.push({ geo: new THREE.IcosahedronGeometry(2, 0), y: 5, color: 0x3aa84a });
    P.push({ geo: new THREE.IcosahedronGeometry(1.5, 0), x: 1.2, y: 6, z: 0.5, color: 0x2f8a3a });
    P.push({ geo: new THREE.IcosahedronGeometry(1.3, 0), x: -1, y: 6.2, z: -0.4, color: 0x4ac05a });
    const mesh = new THREE.Mesh(mergeParts(P), new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true }));
    if (R.shadowMap.enabled) mesh.castShadow = true;
    return mesh;
}
function buildFlower() {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 4), LM(0x3a7a2f));
    stem.position.y = 0.2; g.add(stem);
    const petal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), LM(0xff6688));
    petal.position.y = 0.45; g.add(petal);
    return g;
}
function buildGrass() {
    const P = [];
    P.push({ geo: new THREE.ConeGeometry(0.2, 0.8, 3), y: 0.4, color: 0x4fa040 });
    P.push({ geo: new THREE.ConeGeometry(0.15, 0.7, 3), x: 0.2, y: 0.35, z: 0.15, color: 0x5fb050 });
    P.push({ geo: new THREE.ConeGeometry(0.15, 0.6, 3), x: -0.15, y: 0.3, z: -0.2, color: 0x4fa040 });
    const mesh = new THREE.Mesh(mergeParts(P), new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true }));
    return mesh;
}
function buildFence() {
    const P = [];
    for(let i=0; i<4; i++) {
        P.push({ geo: new THREE.BoxGeometry(0.15, 1.2, 0.15), x: i*0.8 - 1.2, y: 0.6, color: 0x8b5a2b });
    }
    P.push({ geo: new THREE.BoxGeometry(3.2, 0.1, 0.1), y: 0.5, color: 0x6b4a2b });
    P.push({ geo: new THREE.BoxGeometry(3.2, 0.1, 0.1), y: 1, color: 0x6b4a2b });
    const mesh = new THREE.Mesh(mergeParts(P), new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true }));
    return mesh;
}
function buildCrate() {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), LM(0xa07040));
    mesh.position.y = 0.75;
    return mesh;
}
function buildBarrel() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 1.4, 10), LM(0x8b5a2b));
    body.position.y = 0.7; g.add(body);
    const ring1 = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.15, 10), LM(0x3a2a1a));
    ring1.position.y = 0.4; g.add(ring1);
    const ring2 = ring1.clone(); ring2.position.y = 1.0; g.add(ring2);
    return g;
}
function buildStatue() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 2), LM(0x8a8a8a));
    base.position.y = 0.25; g.add(base);
    const mid = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 1.5), LM(0x9a9a9a));
    mid.position.y = 1; g.add(mid);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), LM(0xffd23f));
    head.position.y = 2.2; g.add(head);
    return g;
}
function buildCampfire() {
    const P = [];
    for(let i=0; i<6; i++) {
        const a = i/6*Math.PI*2;
        P.push({ geo: new THREE.CylinderGeometry(0.15,0.15,1.4,5), x: Math.cos(a)*0.7, y: 0.5, z: Math.sin(a)*0.7, color: 0x5a3a1a, rx: Math.PI/2.3, ry: a });
    }
    for(let i=0; i<8; i++) {
        const a = i/8*Math.PI*2;
        P.push({ geo: new THREE.DodecahedronGeometry(0.3, 0), x: Math.cos(a)*1.2, y: 0.15, z: Math.sin(a)*1.2, color: 0x5a5a52 });
    }
    const mesh = new THREE.Mesh(mergeParts(P), new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true }));
    const flame1 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 6), new THREE.MeshBasicMaterial({ color: 0xff5d1a, transparent: true, opacity: 0.85 }));
    flame1.position.y = 1;
    const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.9 }));
    flame2.position.y = 1.2;
    const g = new THREE.Group(); g.add(mesh, flame1, flame2);
    return g;
}
function buildWell() {
    const P = [];
    P.push({ geo: new THREE.CylinderGeometry(2,2.2,1.5,10), y: 0.75, color: 0x8a8a82 });
    P.push({ geo: new THREE.CylinderGeometry(1.7,1.7,0.6,10), y: 0.5, color: 0x2a6a9a });
    [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]].forEach(([x,z]) => {
        P.push({ geo: new THREE.BoxGeometry(0.3,4,0.3), x, y: 2, z, color: 0x8b5a2b });
    });
    P.push({ geo: new THREE.ConeGeometry(3,1.8,4), y: 5, color: 0xa04030, ry: Math.PI/4 });
    const mesh = new THREE.Mesh(mergeParts(P), new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true }));
    return mesh;
}
function buildArchway() {
    const P = [];
    P.push({ geo: new THREE.BoxGeometry(0.8,7,0.8), x: -3, y: 3.5, color: 0x8a8a82 });
    P.push({ geo: new THREE.BoxGeometry(0.8,7,0.8), x: 3, y: 3.5, color: 0x8a8a82 });
    P.push({ geo: new THREE.BoxGeometry(7,0.8,0.8), y: 7, color: 0x9a9a92 });
    P.push({ geo: new THREE.TorusGeometry(1,0.15,4,16), y: 8.2, color: 0xffd23f });
    const mesh = new THREE.Mesh(mergeParts(P), new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true }));
    return mesh;
}

// ── Init Build Mode ──
function initBuildMode() {
    if (buildGroup) sc.remove(buildGroup);
    buildGroup = new THREE.Group();
    sc.add(buildGroup);
    placedObjects = [];
    selectedObject = null;
    currentTool = 'add';
    currentPartCat = 'sculptable';
    currentPartType = 'wall';
    
    // Buat lantai dasar 1000x1000
    const floorGeo = new THREE.PlaneGeometry(1000, 1000);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x5cb85c, depthWrite: true });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = "BUILD_FLOOR";
    buildGroup.add(floor);

    // Grid helper
    const grid = new THREE.GridHelper(1000, 250, 0x000000, 0x000000);
    grid.position.y = 0.05;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    buildGroup.add(grid);

    // Inisialisasi Raycaster & Mouse
    buildRaycaster = new THREE.Raycaster();
    buildMouse = new THREE.Vector2(0, 0);

    // Inisialisasi UI
    initBuildUI();
    
    // Set default part
    updateGhostPart();
    
    // Reset player physics
    pl.vy = 0; pl.vx = 0; pl.vz = 0;
    pl.y = 0;
    
    toast('Mode Builds aktif! Gunakan toolbar untuk membangun.');
}

// ── Update Ghost (Preview) ──
function updateGhostPart() {
    if (buildGhost) {
        buildGroup.remove(buildGhost);
        buildGhost = null;
    }
    if (currentTool !== 'add') return;

    const partDef = BUILD_PARTS[currentPartCat][currentPartType];
    if (!partDef) return;

    let mesh;
    if (currentPartCat === 'sculptable') {
        const geo = partDef.geo();
        const mat = new THREE.MeshBasicMaterial({ color: 0x3d8bff, transparent: true, opacity: 0.5, wireframe: true });
        mesh = new THREE.Mesh(geo, mat);
        if (partDef.custom && currentPartType === 'ramp') {
            mesh.geometry.rotateX(-Math.PI/4);
        }
    } else {
        mesh = partDef.build();
        mesh.traverse(c => {
            if (c.isMesh) {
                c.material = c.material.clone();
                c.material.transparent = true;
                c.material.opacity = 0.5;
                c.material.color.setHex(0x3d8bff);
            }
        });
    }
    buildGhost = mesh;
    buildGroup.add(buildGhost);
}

// ── Update Loop Build Mode ──
function updateBuildMode(now, dt) {
    if (!playing || curMap !== 'builds') return;

    // Kontrol Kamera Terbang (Fly Camera)
    const speed = 30 * dt;
    const forward = new THREE.Vector3(Math.sin(cy)*Math.cos(pitch), Math.sin(pitch), Math.cos(cy)*Math.cos(pitch));
    const right = new THREE.Vector3(Math.sin(cy - Math.PI/2), 0, Math.cos(cy - Math.PI/2));
    
    if (keys.KeyW) buildCamera.target.add(forward.multiplyScalar(speed));
    if (keys.KeyS) buildCamera.target.add(forward.multiplyScalar(-speed));
    if (keys.KeyA) buildCamera.target.add(right.multiplyScalar(-speed));
    if (keys.KeyD) buildCamera.target.add(right.multiplyScalar(speed));
    if (keys.Space) buildCamera.target.y += speed;
    if (keys.ShiftLeft) buildCamera.target.y -= speed;

    cam.position.copy(buildCamera.target).add(new THREE.Vector3(0, 15, -20));
    cam.lookAt(buildCamera.target);

    // Raycast untuk Ghost
    if (currentTool === 'add' && buildGhost) {
        buildRaycaster.setFromCamera(buildMouse, cam);
        const intersects = buildRaycaster.intersectObjects(buildGroup.children);
        
        let hitPoint = new THREE.Vector3(0, 0, 0);
        let hitObject = null;
        
        if (intersects.length > 0) {
            for (let hit of intersects) {
                if (hit.object !== buildGhost && hit.object.name !== "BUILD_FLOOR") {
                    hitPoint.copy(hit.point);
                    hitObject = hit.object;
                    break;
                } else if (hit.object.name === "BUILD_FLOOR") {
                    hitPoint.copy(hit.point);
                    break;
                }
            }
        }

        // Snap ke grid
        hitPoint.x = Math.round(hitPoint.x / BUILD_GRID) * BUILD_GRID;
        hitPoint.z = Math.round(hitPoint.z / BUILD_GRID) * BUILD_GRID;
        
        if (hitObject && hitObject.name !== "BUILD_FLOOR") {
            const bbox = new THREE.Box3().setFromObject(hitObject);
            hitPoint.y = Math.round(bbox.max.y / BUILD_GRID) * BUILD_GRID;
        } else {
            hitPoint.y = 0;
        }

        // Batasi area build
        hitPoint.x = Math.max(-BUILD_LIMIT, Math.min(BUILD_LIMIT, hitPoint.x));
        hitPoint.z = Math.max(-BUILD_LIMIT, Math.min(BUILD_LIMIT, hitPoint.z));

        buildGhost.position.copy(hitPoint);
        buildGhost.rotation.y = pl.r;
    }

    // Interaksi Klik
    if (buildMouse.clicked) {
        buildMouse.clicked = false;
        
        buildRaycaster.setFromCamera({x: 0, y: 0}, cam);
        
        if (currentTool === 'add') {
            const partDef = BUILD_PARTS[currentPartCat][currentPartType];
            let newObj;
            if (currentPartCat === 'sculptable') {
                const geo = partDef.geo();
                const mat = new THREE.MeshPhongMaterial({ color: partDef.col, flatShading: true });
                newObj = new THREE.Mesh(geo, mat);
                if (R.shadowMap.enabled) { newObj.castShadow = true; newObj.receiveShadow = true; }
            } else {
                newObj = partDef.build();
                newObj.traverse(c => { if (c.isMesh) { if (R.shadowMap.enabled) c.castShadow = true; c.receiveShadow = true; } });
            }
            newObj.position.copy(buildGhost.position);
            newObj.rotation.y = buildGhost.rotation.y;
            newObj.userData = { type: currentPartType, cat: currentPartCat };
            buildGroup.add(newObj);
            placedObjects.push(newObj);
            if (SFX && SFX.place) SFX.place();
        } 
        else if (currentTool === 'sculpt' || currentTool === 'remove') {
            const intersects = buildRaycaster.intersectObjects(placedObjects);
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                let target = obj;
                while (target.parent && target.parent !== buildGroup) {
                    target = target.parent;
                }

                if (currentTool === 'remove') {
                    buildGroup.remove(target);
                    placedObjects = placedObjects.filter(o => o !== target);
                    if (selectedObject === target) selectedObject = null;
                    if (SFX && SFX.remove) SFX.remove();
                } else if (currentTool === 'sculpt') {
                    selectedObject = target;
                    showInspector(target);
                }
            } else {
                selectedObject = null;
                hideInspector();
            }
        }
    }
}

// ── UI Functions ──
function initBuildUI() {
    const ui = document.getElementById('build-ui');
    if (!ui) return;
    ui.classList.remove('hide');
    
    // Toolbar
    document.getElementById('bt-add').onclick = () => switchTool('add');
    document.getElementById('bt-sculpt').onclick = () => switchTool('sculpt');
    document.getElementById('bt-remove').onclick = () => switchTool('remove');
    
    // Part Picker
    const grid = document.getElementById('part-grid');
    grid.innerHTML = '';
    for (const cat in BUILD_PARTS) {
        for (const key in BUILD_PARTS[cat]) {
            const btn = document.createElement('button');
            btn.textContent = BUILD_PARTS[cat][key].name;
            btn.dataset.cat = cat;
            btn.dataset.type = key;
            btn.onclick = () => {
                currentPartCat = cat;
                currentPartType = key;
                updateGhostPart();
                document.getElementById('part-picker').classList.add('hide');
                grid.querySelectorAll('button').forEach(b => b.classList.remove('on'));
                btn.classList.add('on');
            };
            grid.appendChild(btn);
        }
    }
    
    // Toggle Part Picker
    document.getElementById('bt-add').oncontextmenu = (e) => {
        e.preventDefault();
        document.getElementById('part-picker').classList.toggle('hide');
    };
    let lastTap = 0;
    document.getElementById('bt-add').onclick = () => {
        const now = Date.now();
        if (now - lastTap < 300) {
            document.getElementById('part-picker').classList.toggle('hide');
        }
        lastTap = now;
    };

    // Inspector Sliders
    ['sx', 'sy', 'sz', 'ry', 'px', 'py', 'pz'].forEach(id => {
        const slider = document.getElementById('in-' + id);
        if (slider) {
            slider.oninput = () => {
                if (!selectedObject) return;
                const val = parseFloat(slider.value);
                if (id === 'sx') selectedObject.scale.x = val;
                if (id === 'sy') selectedObject.scale.y = val;
                if (id === 'sz') selectedObject.scale.z = val;
                if (id === 'ry') selectedObject.rotation.y = val;
                if (id === 'px') selectedObject.position.x = val;
                if (id === 'py') selectedObject.position.y = val;
                if (id === 'pz') selectedObject.position.z = val;
            };
        }
    });

    // Save/Load
    document.getElementById('btn-save-menu').onclick = () => {
        document.getElementById('save-panel').classList.remove('hide');
        refreshLoadList();
    };
    document.getElementById('btn-save').onclick = saveBuild;
    document.getElementById('btn-load').onclick = loadBuild;
    document.getElementById('save-close').onclick = () => document.getElementById('save-panel').classList.add('hide');
    
    // Exit Build Mode
    document.getElementById('bt-exit').onclick = () => {
        leave();
        document.getElementById('build-ui').classList.add('hide');
    };
}

function switchTool(tool) {
    currentTool = tool;
    if (buildGhost) { buildGroup.remove(buildGhost); buildGhost = null; }
    if (tool === 'add') updateGhostPart();
    document.getElementById('inspector').classList.add('hide');
    
    ['bt-add', 'bt-sculpt', 'bt-remove'].forEach(id => {
        document.getElementById(id).classList.toggle('on', id === 'bt-' + tool);
    });
    
    if (tool === 'add') document.getElementById('part-picker').classList.remove('hide');
}

function showInspector(obj) {
    const ins = document.getElementById('inspector');
    ins.classList.remove('hide');
    document.getElementById('in-sx').value = obj.scale.x;
    document.getElementById('in-sy').value = obj.scale.y;
    document.getElementById('in-sz').value = obj.scale.z;
    document.getElementById('in-ry').value = obj.rotation.y;
    document.getElementById('in-px').value = obj.position.x;
    document.getElementById('in-py').value = obj.position.y;
    document.getElementById('in-pz').value = obj.position.z;
}
function hideInspector() { document.getElementById('inspector').classList.add('hide'); }

// ── Save / Load ──
function saveBuild() {
    const name = document.getElementById('save-name').value.trim();
    if (!name) { toast('Masukkan nama bangunan!'); return; }
    
    const data = placedObjects.map(obj => ({
        type: obj.userData.type,
        cat: obj.userData.cat,
        x: obj.position.x, y: obj.position.y, z: obj.position.z,
        rx: obj.rotation.x, ry: obj.rotation.y, rz: obj.rotation.z,
        sx: obj.scale.x, sy: obj.scale.y, sz: obj.scale.z
    }));
    
    try {
        localStorage.setItem('meetup_build_' + name, JSON.stringify(data));
        toast('Bangunan "' + name + '" berhasil disimpan!');
        refreshLoadList();
    } catch (e) {
        toast('Gagal menyimpan: ' + e.message);
    }
}

function loadBuild() {
    const sel = document.getElementById('load-list');
    const name = sel.value;
    if (!name) { toast('Pilih bangunan yang mau dimuat!'); return; }
    
    try {
        const data = JSON.parse(localStorage.getItem('meetup_build_' + name));
        if (!data) return;
        
        placedObjects.forEach(o => buildGroup.remove(o));
        placedObjects = [];
        
        data.forEach(d => {
            const partDef = BUILD_PARTS[d.cat][d.type];
            if (!partDef) return;
            let obj;
            if (d.cat === 'sculptable') {
                const geo = partDef.geo();
                const mat = new THREE.MeshPhongMaterial({ color: partDef.col, flatShading: true });
                obj = new THREE.Mesh(geo, mat);
                if (R.shadowMap.enabled) { obj.castShadow = true; obj.receiveShadow = true; }
            } else {
                obj = partDef.build();
                obj.traverse(c => { if (c.isMesh) { if (R.shadowMap.enabled) c.castShadow = true; c.receiveShadow = true; } });
            }
            obj.position.set(d.x, d.y, d.z);
            obj.rotation.set(d.rx, d.ry, d.rz);
            obj.scale.set(d.sx, d.sy, d.sz);
            obj.userData = { type: d.type, cat: d.cat };
            buildGroup.add(obj);
            placedObjects.push(obj);
        });
        
        toast('Bangunan "' + name + '" berhasil dimuat!');
        document.getElementById('save-panel').classList.add('hide');
    } catch (e) {
        toast('Gagal memuat: ' + e.message);
    }
}

function refreshLoadList() {
    const sel = document.getElementById('load-list');
    sel.innerHTML = '';
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('meetup_build_')) {
            const opt = document.createElement('option');
            opt.value = key.replace('meetup_build_', '');
            opt.textContent = opt.value;
            sel.appendChild(opt);
        }
    });
    if (sel.children.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'Belum ada simpanan';
        opt.disabled = true;
        sel.appendChild(opt);
    }
}
