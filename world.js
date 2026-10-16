// ================================================================
// Meet-UP — Enhanced 3D Game Engine (world.js)
// Featuring 15 Authentic Cars, Drag (4) / Rally (5) / Circuit (4)
// ================================================================

(function(window) {
    'use strict';

    const World = {
        scene: null,
        camera: null,
        renderer: null,
        clock: new THREE.Clock(),
        currentMap: 'island',
        mapObjects: [],
        colliders: [],
        checkpoints: [],
        currentCheckpoint: 0,
        raceActive: false,
        raceFinished: false,
        raceStartTime: 0,
        raceDistance: 250,
        currentProgress: 0,
        isCarMode: false,
        currentCarId: 'dodge_demon',
        carMesh: null,
        playerMesh: null,
        playerPos: new THREE.Vector3(0, 1, 0),
        playerVel: new THREE.Vector3(0, 0, 0),
        playerRot: 0,
        speed: 0,
        maxSpeed: 160,
        accel: 9.5,
        handling: 5.0,
        boostPower: 10.0,
        boostAmount: 100,
        isBoosting: false,
        keys: {},
        audioCtx: null,

        // 15 SPECIFIED CAR DEFINITIONS
        carsData: {
            // --- DRAG RACE ---
            dodge_demon: {
                id: 'dodge_demon',
                name: 'Dodge Challenger SRT Demon',
                category: 'drag',
                catLabel: 'Drag Race',
                speed: 160,
                accel: 9.6,
                handling: 5.2,
                boost: 10.0,
                desc: 'Monster drag V8 supercharged dengan tenaga instan dan akselerasi kilat di lintasan lurus.',
                color: '#d8342a'
            },
            copo_camaro: {
                id: 'copo_camaro',
                name: 'Chevrolet COPO Camaro',
                category: 'drag',
                catLabel: 'Drag Race',
                speed: 165,
                accel: 9.8,
                handling: 4.8,
                boost: 10.0,
                desc: 'Legenda drag strip dengan kap mesin cowl induction dan ban slicks raksasa.',
                color: '#f09020'
            },
            supra_mk4: {
                id: 'supra_mk4',
                name: 'Toyota Supra (MK4)',
                category: 'drag',
                catLabel: 'Drag Race',
                speed: 175,
                accel: 8.8,
                handling: 6.8,
                boost: 9.5,
                desc: 'Mesin 2JZ legendaris dengan turbo masif, sayap tinggi dan top speed luar biasa.',
                color: '#e8f2ff'
            },
            gtr_r35: {
                id: 'gtr_r35',
                name: 'Nissan GT-R (R35)',
                category: 'drag',
                catLabel: 'Drag Race',
                speed: 170,
                accel: 9.7,
                handling: 7.5,
                boost: 9.2,
                desc: 'Godzilla dengan AWD mutakhir untuk start peluncuran tanpa kehilangan traksi.',
                color: '#8f9fb8'
            },
            mustang_cobrajet: {
                id: 'mustang_cobrajet',
                name: 'Ford Mustang Cobra Jet',
                category: 'drag',
                catLabel: 'Drag Race',
                speed: 168,
                accel: 9.9,
                handling: 4.6,
                boost: 10.0,
                desc: 'Jet darat khusus drag dengan supercharger blower dan parasut rem darurat.',
                color: '#3d8bff'
            },

            // --- RALLY ---
            subaru_sti: {
                id: 'subaru_sti',
                name: 'Subaru Impreza WRX STI',
                category: 'rally',
                catLabel: 'Rally',
                speed: 145,
                accel: 8.6,
                handling: 9.4,
                boost: 7.6,
                desc: 'Ikon World Rally Blue legendaris, velg emas dan sayap besar penakluk tanah & kerikil.',
                color: '#2a62d8'
            },
            lancer_evo: {
                id: 'lancer_evo',
                name: 'Mitsubishi Lancer Evolution',
                category: 'rally',
                catLabel: 'Rally',
                speed: 146,
                accel: 8.7,
                handling: 9.2,
                boost: 7.6,
                desc: 'Rival sejati reli dengan kap mesin berongga aerodinamis dan sistem 4WD lincah.',
                color: '#e03030'
            },
            audi_quattro: {
                id: 'audi_quattro',
                name: 'Audi Quattro',
                category: 'rally',
                catLabel: 'Rally',
                speed: 148,
                accel: 8.4,
                handling: 8.8,
                boost: 8.0,
                desc: 'Pelopor Group B reli bertubuh kotak berotot dengan lampu reli khas 80-an.',
                color: '#ffffff'
            },
            lancia_delta: {
                id: 'lancia_delta',
                name: 'Lancia Delta HF Integrale',
                category: 'rally',
                catLabel: 'Rally',
                speed: 142,
                accel: 8.9,
                handling: 9.6,
                boost: 7.3,
                desc: 'Hot hatch penguasa reli dunia, fender kotak melebar dan bermanuver sangat tajam.',
                color: '#900c3f'
            },
            toyota_celica: {
                id: 'toyota_celica',
                name: 'Toyota Celica GT-Four',
                category: 'rally',
                catLabel: 'Rally',
                speed: 146,
                accel: 8.5,
                handling: 9.0,
                boost: 7.7,
                desc: 'Juara reli legendaris dengan 4 lampu bulat ikonik dan aerodinamika mulus.',
                color: '#2fa854'
            },

            // --- SIRKUIT ---
            porsche_gt3rs: {
                id: 'porsche_gt3rs',
                name: 'Porsche GT3 RS',
                category: 'circuit',
                catLabel: 'Sirkuit',
                speed: 182,
                accel: 9.0,
                handling: 9.9,
                boost: 8.3,
                desc: 'Master lintasan dengan swan-neck rear wing raksasa dan downforce presisi sirkuit.',
                color: '#34d85a'
            },
            mclaren_senna: {
                id: 'mclaren_senna',
                name: 'McLaren Senna',
                category: 'circuit',
                catLabel: 'Sirkuit',
                speed: 192,
                accel: 9.5,
                handling: 9.8,
                boost: 8.7,
                desc: 'Hypercar aero ekstrem dengan sayap aktif bertingkat dan waktu lap sirkuit tercepat.',
                color: '#ff7728'
            },
            radical_sr8: {
                id: 'radical_sr8',
                name: 'Radical SR8',
                category: 'circuit',
                catLabel: 'Sirkuit',
                speed: 178,
                accel: 9.6,
                handling: 10.0,
                boost: 8.0,
                desc: 'Mobil prototype kokpit terbuka seringan bulu dengan cengkeraman tikungan tak tertandingi.',
                color: '#ffd23f'
            },
            ferrari_fxxk: {
                id: 'ferrari_fxxk',
                name: 'Ferrari FXX-K Evo',
                category: 'circuit',
                catLabel: 'Sirkuit',
                speed: 196,
                accel: 9.7,
                handling: 9.7,
                boost: 9.2,
                desc: 'Monster lintasan balap Italia dengan sayap sirip ganda dan kecepatan puncak dahsyat.',
                color: '#c4151c'
            },
            civic_typer: {
                id: 'civic_typer',
                name: 'Honda Civic Type R',
                category: 'circuit',
                catLabel: 'Sirkuit',
                speed: 156,
                accel: 8.3,
                handling: 9.2,
                boost: 7.5,
                desc: 'Hot hatch sirkuit dengan knalpot tripel di tengah, vortex generator dan aero wing.',
                color: '#ffffff'
            }
        },

        // MAP DEFINITIONS: Hangout, Drag (4), Rally (5), Circuit (4), Mini Games
        mapsData: {
            // Hangout
            island: { id: 'island', name: 'Pulau Santai', group: 'hangout', desc: 'Pulau tropis cerah dengan dermaga dan pantai' },
            desert: { id: 'desert', name: 'Gurun Pasir', group: 'hangout', desc: 'Lautan pasir keemasan dengan piramida kuno' },
            jungle: { id: 'jungle', name: 'Hutan Tropis', group: 'hangout', desc: 'Hutan lebat dengan jembatan tali dan sungai' },
            snow: { id: 'snow', name: 'Dataran Salju', group: 'hangout', desc: 'Hamparan salju putih dengan danau es membeku' },

            // DRAG (4 MAPS: 250J, 500J, 1000J, 5000J)
            drag_250: { id: 'drag_250', name: 'Drag Strip 250J', group: 'drag', distance: 250, desc: 'Adu cepat sprint 250J dengan lampu start Christmas tree' },
            drag_500: { id: 'drag_500', name: 'Drag Strip 500J', group: 'drag', distance: 500, desc: 'Akselerasi seperempat mil 500J dengan tribun penonton' },
            drag_1000: { id: 'drag_1000', name: 'Highway Drag 1000J', group: 'drag', distance: 1000, desc: 'Lari 1000J di jalan layang perkotaan berhias lampu neon' },
            drag_5000: { id: 'drag_5000', name: 'Supersonic Flats 5000J', group: 'drag', distance: 5000, desc: 'Lintasan lurus raksasa 5000J di danau garam gurun luas' },

            // RALLY (5 MAPS: VERSI SEKARANG)
            rally_canyon: { id: 'rally_canyon', name: 'Gurun Canyon Rally', group: 'rally', distance: 2200, desc: 'Trek debu berbatu dengan tebing curam dan tanjakan lompat' },
            rally_jungle: { id: 'rally_jungle', name: 'Jungle Mud Trail', group: 'rally', distance: 2400, desc: 'Trek tanah berlumpur menerobos lebatnya kanopi hutan hujan' },
            rally_snow: { id: 'rally_snow', name: 'Snow Mountain Pass', group: 'rally', distance: 2300, desc: 'Trek salju licin di lereng pegunungan pinus membeku' },
            rally_volcano: { id: 'rally_volcano', name: 'Volcano Ridge Rally', group: 'rally', distance: 2500, desc: 'Trek cadas bebatuan vulkanik di atas jurang magma membara' },
            rally_coastal: { id: 'rally_coastal', name: 'Coastal Cliff Sprint', group: 'rally', distance: 2100, desc: 'Jalur reli pesisir pantai dengan tikungan tajam tepi tebing' },

            // CIRCUIT (4 MAPS: MASING-MASING 4500 J JARAKNYA)
            circuit_apex: { id: 'circuit_apex', name: 'Grand Prix Apex Ring', group: 'circuit', distance: 4500, desc: 'Sirkuit aspal teknikal Formula 4500J dengan chicane & kerb' },
            circuit_cyber: { id: 'circuit_cyber', name: 'Cyber Neon Metropolis', group: 'circuit', distance: 4500, desc: 'Sirkuit futuristik 4500J di tengah gemerlap gedung pencakar langit' },
            circuit_coastal: { id: 'circuit_coastal', name: 'Suzuka Coastal Raceway', group: 'circuit', distance: 4500, desc: 'Sirkuit legendaris 4500J di tepi laut dengan tikungan S & jembatan' },
            circuit_sunset: { id: 'circuit_sunset', name: 'Sunset Valley International', group: 'circuit', distance: 4500, desc: 'Sirkuit cepat 4500J di lembah berbukit dengan tikungan miring (banked)' },

            // Fun & Creative
            parkour: { id: 'parkour', name: 'Parkour Sky', group: 'fun', desc: 'Rintangan melayang di langit menantang ketangkasan' },
            boxing: { id: 'boxing', name: 'Ring Tinju Jello', group: 'fun', desc: 'Baku hantam di atas ring tinju seru dan lucu' },
            builds: { id: 'builds', name: 'Mode Builds (Kreatif)', group: 'fun', desc: 'Dunia bebas untuk membangun istana, sirkuit, dan kota impian' }
        },

        init: function() {
            const canvas = document.getElementById('c');
            if (!canvas) return;

            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x8fd0ff);
            this.scene.fog = new THREE.FogExp2(0x8fd0ff, 0.0035);

            // Camera setup
            this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.set(0, 10, 18);

            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Lighting
            const ambient = new THREE.AmbientLight(0xffffff, 0.65);
            this.scene.add(ambient);

            const sun = new THREE.DirectionalLight(0xfff7e6, 0.9);
            sun.position.set(40, 70, 30);
            sun.castShadow = true;
            sun.shadow.mapSize.width = 1024;
            sun.shadow.mapSize.height = 1024;
            sun.shadow.camera.near = 0.5;
            sun.shadow.camera.far = 300;
            sun.shadow.camera.left = -80;
            sun.shadow.camera.right = 80;
            sun.shadow.camera.top = 80;
            sun.shadow.camera.bottom = -80;
            this.scene.add(sun);

            // Input handlers
            window.addEventListener('resize', () => this.onResize());
            window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true; });
            window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });

            // Create initial player
            this.createPlayerMesh();

            // Load default map
            this.loadMap('island');

            // Start loop
            this.animate();
        },

        onResize: function() {
            if (!this.camera || !this.renderer) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        },

        // AUDIO RETRO SYNTHESIZER
        playRetroSound: function(type) {
            try {
                if (!this.audioCtx) {
                    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                const ctx = this.audioCtx;
                if (ctx.state === 'suspended') ctx.resume();

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                const t = ctx.currentTime;
                if (type === 'boost') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(140, t);
                    osc.frequency.exponentialRampToValueAtTime(600, t + 0.35);
                    gain.gain.setValueAtTime(0.3, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
                    osc.start(t);
                    osc.stop(t + 0.35);
                } else if (type === 'countdown') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(440, t);
                    gain.gain.setValueAtTime(0.2, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                    osc.start(t);
                    osc.stop(t + 0.15);
                } else if (type === 'go') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(880, t);
                    gain.gain.setValueAtTime(0.3, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                    osc.start(t);
                    osc.stop(t + 0.4);
                } else if (type === 'place') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(520, t);
                    osc.frequency.exponentialRampToValueAtTime(780, t + 0.12);
                    gain.gain.setValueAtTime(0.2, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
                    osc.start(t);
                    osc.stop(t + 0.12);
                } else if (type === 'delete') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(300, t);
                    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
                    gain.gain.setValueAtTime(0.2, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                    osc.start(t);
                    osc.stop(t + 0.15);
                }
            } catch (e) {}
        },

        // PROCEDURAL JELLO CHARACTER
        createPlayerMesh: function() {
            if (this.playerMesh && this.playerMesh.parent) {
                this.playerMesh.parent.remove(this.playerMesh);
            }

            const group = new THREE.Group();
            const bodyGeo = new THREE.CylinderGeometry(0.7, 0.9, 1.2, 16);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0x3d8bff });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.6;
            body.castShadow = true;
            group.add(body);

            // Eyes
            const eyeGeo = new THREE.BoxGeometry(0.18, 0.35, 0.1);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111625 });
            const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
            eyeL.position.set(-0.25, 0.7, 0.72);
            const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
            eyeR.position.set(0.25, 0.7, 0.72);
            group.add(eyeL, eyeR);

            this.playerMesh = group;
            this.scene.add(this.playerMesh);
        },

        // PROCEDURAL 3D CAR GENERATORS (15 DISTINCT MODELS)
        createCarMesh: function(carId) {
            const group = new THREE.Group();
            const carDef = this.carsData[carId] || this.carsData.dodge_demon;
            const mainColor = new THREE.Color(carDef.color);
            const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, metalness: 0.3, roughness: 0.4 });
            const glassMat = new THREE.MeshStandardMaterial({ color: 0x172844, roughness: 0.2, metalness: 0.8 });
            const blackMat = new THREE.MeshLambertMaterial({ color: 0x111625 });
            const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
            const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const rimMat = new THREE.MeshStandardMaterial({ color: carDef.category === 'rally' ? 0xffd23f : 0xdddddd, metalness: 0.8 });

            // Base Chassis
            const baseBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 4.4), bodyMat);
            baseBody.position.y = 0.55;
            baseBody.castShadow = true;
            group.add(baseBody);

            // Wheels
            const makeWheel = (x, z, size) => {
                const w = new THREE.Group();
                const tire = new THREE.Mesh(new THREE.CylinderGeometry(size || 0.45, size || 0.45, 0.35, 14), wheelMat);
                tire.rotation.z = Math.PI / 2;
                tire.castShadow = true;
                const rim = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.65 || 0.3, size * 0.65 || 0.3, 0.36, 8), rimMat);
                rim.rotation.z = Math.PI / 2;
                w.add(tire, rim);
                w.position.set(x, size || 0.45, z);
                return w;
            };

            const wRearSize = (carDef.category === 'drag') ? 0.58 : 0.45;
            group.add(makeWheel(-1.1, 1.4, 0.42)); // Front Left
            group.add(makeWheel(1.1, 1.4, 0.42));  // Front Right
            group.add(makeWheel(-1.15, -1.3, wRearSize)); // Rear Left
            group.add(makeWheel(1.15, -1.3, wRearSize));  // Rear Right

            // Cabin / Roof
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 2.2), glassMat);
            cabin.position.set(0, 1.1, -0.2);
            cabin.castShadow = true;
            group.add(cabin);

            // CUSTOM AERO & UNIQUE FEATURES PER MODEL
            if (carId === 'dodge_demon') {
                // Wide hood scoop
                const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.8), blackMat);
                scoop.position.set(0, 0.95, 1.1);
                // Front splitter
                const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.08, 0.4), blackMat);
                splitter.position.set(0, 0.25, 2.3);
                group.add(scoop, splitter);
            } else if (carId === 'copo_camaro') {
                // Tall cowl induction hood
                const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 1.2), bodyMat);
                cowl.position.set(0, 1.0, 1.0);
                // Wheelie bars
                const barL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.2), chromeMat);
                barL.position.set(-0.6, 0.25, -2.6);
                const barR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.2), chromeMat);
                barR.position.set(0.6, 0.25, -2.6);
                group.add(cowl, barL, barR);
            } else if (carId === 'supra_mk4') {
                // Iconic rounded tall hoop rear wing
                const wingTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.4), bodyMat);
                wingTop.position.set(0, 1.4, -2.0);
                const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.3), bodyMat);
                wingL.position.set(-0.85, 1.1, -2.0);
                const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.3), bodyMat);
                wingR.position.set(0.85, 1.1, -2.0);
                // 4 Circular rear tail lights
                for (let i = -0.6; i <= 0.6; i += 0.4) {
                    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0xff1a1a }));
                    tail.rotation.x = Math.PI / 2;
                    tail.position.set(i, 0.6, -2.22);
                    group.add(tail);
                }
                group.add(wingTop, wingL, wingR);
            } else if (carId === 'gtr_r35') {
                // GT-R signature twin round lights
                const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), new THREE.MeshBasicMaterial({ color: 0xff1a1a }));
                t1.rotation.x = Math.PI / 2; t1.position.set(-0.6, 0.65, -2.22);
                const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), new THREE.MeshBasicMaterial({ color: 0xff1a1a }));
                t2.rotation.x = Math.PI / 2; t2.position.set(0.6, 0.65, -2.22);
                // Carbon rear wing
                const wing = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.35), blackMat);
                wing.position.set(0, 1.3, -2.0);
                group.add(t1, t2, wing);
            } else if (carId === 'mustang_cobrajet') {
                // Huge blower intake poking out
                const blower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.6), chromeMat);
                blower.position.set(0, 1.1, 1.2);
                // Parachute bag pack on rear bumper
                const chute = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), new THREE.MeshLambertMaterial({ color: 0x17306b }));
                chute.position.set(0, 0.65, -2.35);
                group.add(blower, chute);
            } else if (carId === 'subaru_sti') {
                // World rally arched wing
                const wing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.4), bodyMat);
                wing.position.set(0, 1.5, -1.9);
                const uprightL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.35), bodyMat);
                uprightL.position.set(-0.8, 1.15, -1.9);
                const uprightR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.35), bodyMat);
                uprightR.position.set(0.8, 1.15, -1.9);
                // Hood scoop
                const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.6), bodyMat);
                scoop.position.set(0, 0.95, 0.9);
                // Red mudflaps
                const flapMat = new THREE.MeshLambertMaterial({ color: 0xd8342a });
                const flapL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.02), flapMat); flapL.position.set(-1.18, 0.3, -1.6);
                const flapR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.02), flapMat); flapR.position.set(1.18, 0.3, -1.6);
                group.add(wing, uprightL, uprightR, scoop, flapL, flapR);
            } else if (carId === 'lancer_evo') {
                // Tall straight rally wing
                const wing = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 0.35), bodyMat);
                wing.position.set(0, 1.45, -1.9);
                const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.25), bodyMat); p1.position.set(-0.75, 1.15, -1.9);
                const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.25), bodyMat); p2.position.set(0.75, 1.15, -1.9);
                // Front large fog lamps
                const fog1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                fog1.rotation.x = Math.PI / 2; fog1.position.set(-0.6, 0.45, 2.22);
                const fog2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                fog2.rotation.x = Math.PI / 2; fog2.position.set(0.6, 0.45, 2.22);
                group.add(wing, p1, p2, fog1, fog2);
            } else if (carId === 'audi_quattro') {
                // Boxy 80s Group B angular flares
                const flareF = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.4, 0.9), bodyMat); flareF.position.set(0, 0.55, 1.4);
                const flareR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 0.9), bodyMat); flareR.position.set(0, 0.55, -1.3);
                // Quad rectangular headlights
                for (let x = -0.8; x <= 0.8; x += 0.4) {
                    if (Math.abs(x) > 0.2) {
                        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.05), new THREE.MeshBasicMaterial({ color: 0xfffbe0 }));
                        hl.position.set(x, 0.65, 2.22);
                        group.add(hl);
                    }
                }
                group.add(flareF, flareR);
            } else if (carId === 'lancia_delta') {
                // Boxy hot-hatch rear roof spoiler
                const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.4), blackMat);
                spoiler.position.set(0, 1.45, -1.3);
                spoiler.rotation.x = 0.3;
                group.add(spoiler);
            } else if (carId === 'toyota_celica') {
                // 4 Round projector rally headlights
                for (let x of [-0.75, -0.45, 0.45, 0.75]) {
                    const lgt = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                    lgt.rotation.x = Math.PI / 2; lgt.position.set(x, 0.65, 2.2);
                    group.add(lgt);
                }
                const wing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.35), bodyMat);
                wing.position.set(0, 1.35, -2.0);
                group.add(wing);
            } else if (carId === 'porsche_gt3rs') {
                // Swan neck top-mounted GT wing
                const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.5), blackMat);
                wing.position.set(0, 1.7, -1.9);
                const swanL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.3), blackMat); swanL.position.set(-0.7, 1.35, -1.85); swanL.rotation.x = -0.2;
                const swanR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.3), blackMat); swanR.position.set(0.7, 1.35, -1.85); swanR.rotation.x = -0.2;
                // Fender vents
                const ventL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.5), blackMat); ventL.position.set(-0.9, 0.9, 1.3);
                const ventR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.5), blackMat); ventR.position.set(0.9, 0.9, 1.3);
                group.add(wing, swanL, swanR, ventL, ventR);
            } else if (carId === 'mclaren_senna') {
                // Hypercar aero: massive active rear wing with vertical endplates
                const wing = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.55), blackMat);
                wing.position.set(0, 1.8, -2.0);
                const endL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.65), bodyMat); endL.position.set(-1.15, 1.8, -2.0);
                const endR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.65), bodyMat); endR.position.set(1.15, 1.8, -2.0);
                // Roof snorkel intake
                const snorkel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.9), blackMat);
                snorkel.position.set(0, 1.5, 0.1);
                group.add(wing, endL, endR, snorkel);
            } else if (carId === 'radical_sr8') {
                // Open cockpit prototype: remove standard cabin box, add roll hoop & shark fin
                group.remove(cabin);
                const tub = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 2.0), blackMat); tub.position.set(0, 0.7, -0.1);
                const rollHoop = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 12, Math.PI), chromeMat); rollHoop.position.set(0, 1.15, -0.4);
                const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 1.4), bodyMat); fin.position.set(0, 1.25, -1.2);
                const wing = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 0.4), blackMat); wing.position.set(0, 1.4, -2.0);
                group.add(tub, rollHoop, fin, wing);
            } else if (carId === 'ferrari_fxxk') {
                // Dual separate rear fin wings with central horizontal plane
                const finL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.5), bodyMat); finL.position.set(-1.0, 1.4, -2.0); finL.rotation.y = 0.15;
                const finR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.5), bodyMat); finR.position.set(1.0, 1.4, -2.0); finR.rotation.y = -0.15;
                const midWing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.35), blackMat); midWing.position.set(0, 1.5, -2.0);
                group.add(finL, finR, midWing);
            } else if (carId === 'civic_typer') {
                // Hot hatch track weapon: rear wing & triple center exhaust
                const wing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.35), blackMat); wing.position.set(0, 1.5, -1.8);
                const standL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.2), blackMat); standL.position.set(-0.7, 1.25, -1.8);
                const standR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.2), blackMat); standR.position.set(0.7, 1.25, -1.8);
                // Triple exhaust tips
                for (let i = -0.16; i <= 0.16; i += 0.16) {
                    const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.15, 8), chromeMat);
                    ex.rotation.x = Math.PI / 2; ex.position.set(i, 0.3, -2.25);
                    group.add(ex);
                }
                group.add(wing, standL, standR);
            }

            return group;
        },

        equipCar: function(carId) {
            this.currentCarId = carId;
            const carDef = this.carsData[carId];
            if (!carDef) return;

            this.maxSpeed = carDef.speed;
            this.accel = carDef.accel;
            this.handling = carDef.handling;
            this.boostPower = carDef.boost;

            if (this.carMesh && this.carMesh.parent) {
                this.carMesh.parent.remove(this.carMesh);
            }

            this.carMesh = this.createCarMesh(carId);
            this.scene.add(this.carMesh);

            if (this.isCarMode) {
                this.playerMesh.visible = false;
                this.carMesh.visible = true;
            } else {
                this.carMesh.visible = false;
                this.playerMesh.visible = true;
            }
        },

        // MAP BUILDER ENGINE
        clearCurrentMap: function() {
            while (this.mapObjects.length > 0) {
                const obj = this.mapObjects.pop();
                this.scene.remove(obj);
            }
            this.colliders = [];
            this.checkpoints = [];
            this.currentCheckpoint = 0;
            this.raceActive = false;
            this.raceFinished = false;
        },

        loadMap: function(mapId) {
            console.log('[World] Loading map:', mapId);
            this.clearCurrentMap();
            this.currentMap = mapId;
            const mapDef = this.mapsData[mapId] || this.mapsData.island;

            // Apply environment sky & fog
            if (mapDef.group === 'drag') {
                this.scene.background = new THREE.Color(0x1a264a);
                this.scene.fog = new THREE.FogExp2(0x1a264a, 0.002);
            } else if (mapDef.group === 'circuit') {
                this.scene.background = new THREE.Color(0x7ac4ff);
                this.scene.fog = new THREE.FogExp2(0x7ac4ff, 0.0018);
            } else if (mapId === 'desert' || mapId === 'rally_canyon') {
                this.scene.background = new THREE.Color(0xffdb99);
                this.scene.fog = new THREE.FogExp2(0xffdb99, 0.003);
            } else if (mapId === 'snow' || mapId === 'rally_snow') {
                this.scene.background = new THREE.Color(0xdceeff);
                this.scene.fog = new THREE.FogExp2(0xdceeff, 0.004);
            } else {
                this.scene.background = new THREE.Color(0x8fd0ff);
                this.scene.fog = new THREE.FogExp2(0x8fd0ff, 0.0035);
            }

            // Route builder according to category
            if (mapDef.group === 'drag') {
                this.buildDragStrip(mapDef.distance);
                this.setupRaceMode(mapDef.distance);
            } else if (mapDef.group === 'rally') {
                this.buildRallyTrack(mapId, mapDef.distance);
                this.setupRaceMode(mapDef.distance);
            } else if (mapDef.group === 'circuit') {
                this.buildCircuitTrack(mapId, mapDef.distance);
                this.setupRaceMode(mapDef.distance);
            } else if (mapId === 'builds') {
                this.buildFlatCreativeWorld();
            } else {
                this.buildHangoutWorld(mapId);
            }

            // Update UI classes
            if (mapDef.group === 'drag' || mapDef.group === 'rally' || mapDef.group === 'circuit') {
                document.body.classList.add('racing');
                this.isCarMode = true;
                this.equipCar(this.currentCarId);
            } else {
                document.body.classList.remove('racing');
                this.isCarMode = false;
                if (this.carMesh) this.carMesh.visible = false;
                if (this.playerMesh) this.playerMesh.visible = true;
            }
        },

        // DRAG STRIP BUILDER (250J, 500J, 1000J, 5000J)
        buildDragStrip: function(distance) {
            const trackWidth = 24;
            const roadGeo = new THREE.PlaneGeometry(trackWidth, distance + 100);
            roadGeo.rotateX(-Math.PI / 2);
            const roadMat = new THREE.MeshStandardMaterial({ color: 0x22252e, roughness: 0.8 });
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.position.set(0, 0, -(distance / 2));
            road.receiveShadow = true;
            this.scene.add(road);
            this.mapObjects.push(road);

            // Ground surrounding
            const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, distance + 400), new THREE.MeshLambertMaterial({ color: 0x111625 }));
            ground.rotateX(-Math.PI / 2);
            ground.position.set(0, -0.1, -(distance / 2));
            this.scene.add(ground);
            this.mapObjects.push(ground);

            // Christmas Tree Start Light Tower at Z = -10
            const xTree = new THREE.Group();
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5.0, 8), new THREE.MeshLambertMaterial({ color: 0xffd23f }));
            pole.position.y = 2.5;
            xTree.add(pole);
            for (let i = 0; i < 4; i++) {
                const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: i === 3 ? 0x3fdc6a : 0xffd23f }));
                bulb.position.set(0, 3.8 - i * 0.6, 0.2);
                xTree.add(bulb);
            }
            xTree.position.set(0, 0, -10);
            this.scene.add(xTree);
            this.mapObjects.push(xTree);

            // Barriers and Lights along track
            for (let z = 0; z >= -distance; z -= 50) {
                // Left barrier
                const bL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 48), new THREE.MeshLambertMaterial({ color: 0xd8342a }));
                bL.position.set(-(trackWidth / 2 + 0.3), 0.5, z - 25);
                // Right barrier
                const bR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 48), new THREE.MeshLambertMaterial({ color: 0xd8342a }));
                bR.position.set((trackWidth / 2 + 0.3), 0.5, z - 25);

                // Stadium floodlights
                const lightPoleL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 14, 8), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
                lightPoleL.position.set(-(trackWidth / 2 + 5), 7, z);
                const lamp = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                lamp.position.set(-(trackWidth / 2 + 4.5), 13.8, z);

                this.scene.add(bL, bR, lightPoleL, lamp);
                this.mapObjects.push(bL, bR, lightPoleL, lamp);
            }

            // Finish Line Arch at Z = -distance
            const finishArch = new THREE.Group();
            const f1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 8, 1.0), new THREE.MeshLambertMaterial({ color: 0x17306b }));
            f1.position.set(-(trackWidth / 2 + 1), 4, 0);
            const f2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 8, 1.0), new THREE.MeshLambertMaterial({ color: 0x17306b }));
            f2.position.set((trackWidth / 2 + 1), 4, 0);
            const banner = new THREE.Mesh(new THREE.BoxGeometry(trackWidth + 3, 2.0, 0.4), new THREE.MeshBasicMaterial({ color: 0xffd23f }));
            banner.position.set(0, 7, 0);
            finishArch.add(f1, f2, banner);
            finishArch.position.set(0, 0, -distance);
            this.scene.add(finishArch);
            this.mapObjects.push(finishArch);

            // Player start position
            this.playerPos.set(0, 0.5, 5);
            this.playerRot = Math.PI; // Face down track
        },

        // RALLY TRACK BUILDER (5 MAPS)
        buildRallyTrack: function(mapId, distance) {
            const groundColor = (mapId === 'rally_snow') ? 0xeef7ff : (mapId === 'rally_volcano' ? 0x241d24 : 0xab8254);
            const trackColor = (mapId === 'rally_snow') ? 0xcce0f5 : (mapId === 'rally_volcano' ? 0x151218 : 0x7a5832);

            const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshLambertMaterial({ color: groundColor }));
            ground.rotateX(-Math.PI / 2);
            ground.receiveShadow = true;
            this.scene.add(ground);
            this.mapObjects.push(ground);

            // Winding track curve waypoints
            const points = [];
            const segments = 24;
            const radius = distance / (Math.PI * 2);
            for (let i = 0; i <= segments; i++) {
                const ang = (i / segments) * Math.PI * 2;
                const r = radius + Math.sin(ang * 3) * (radius * 0.35);
                points.push(new THREE.Vector3(Math.cos(ang) * r, 0.2, Math.sin(ang) * r));
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const trackGeo = new THREE.TubeGeometry(curve, 180, 7, 8, true);
            const trackMat = new THREE.MeshLambertMaterial({ color: trackColor });
            const trackMesh = new THREE.Mesh(trackGeo, trackMat);
            trackMesh.scale.y = 0.05; // Flatten into road
            trackMesh.receiveShadow = true;
            this.scene.add(trackMesh);
            this.mapObjects.push(trackMesh);

            // Add props (trees / rocks / jumps) along track
            for (let i = 0; i < points.length - 1; i += 2) {
                const p = points[i];
                const tree = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 6), new THREE.MeshLambertMaterial({ color: mapId === 'rally_snow' ? 0xffffff : 0x226b35 }));
                tree.position.set(p.x * 1.25, 4, p.z * 1.25);
                tree.castShadow = true;
                this.scene.add(tree);
                this.mapObjects.push(tree);

                // Checkpoint gates
                if (i % 4 === 0) {
                    const gate = new THREE.Mesh(new THREE.TorusGeometry(8, 0.4, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: 0x3fdc6a }));
                    gate.position.set(p.x, 0, p.z);
                    gate.lookAt(points[i + 1]);
                    this.scene.add(gate);
                    this.mapObjects.push(gate);
                    this.checkpoints.push(p);
                }
            }

            this.playerPos.copy(points[0]).add(new THREE.Vector3(0, 0.5, 0));
        },

        // CIRCUIT TRACK BUILDER (4 MAPS, EACH 4500 J DISTANCE)
        buildCircuitTrack: function(mapId, distance) {
            const isCyber = (mapId === 'circuit_cyber');
            const groundColor = isCyber ? 0x080c18 : 0x3d8c40;
            const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshLambertMaterial({ color: groundColor }));
            ground.rotateX(-Math.PI / 2);
            ground.receiveShadow = true;
            this.scene.add(ground);
            this.mapObjects.push(ground);

            // Generate Technical 4500J Circuit Loop
            const points = [];
            const segCount = 40;
            const rBase = distance / 14; // Approx 320 unit radius for ~4500 length
            for (let i = 0; i <= segCount; i++) {
                const t = (i / segCount) * Math.PI * 2;
                // Add chicane, long straight, and sweeping hairpins
                const r = rBase * (1 + 0.35 * Math.sin(2 * t) + 0.2 * Math.cos(4 * t));
                const x = Math.cos(t) * r;
                const z = Math.sin(t) * r;
                points.push(new THREE.Vector3(x, 0.25, z));
            }

            const circuitCurve = new THREE.CatmullRomCurve3(points);
            const roadGeo = new THREE.TubeGeometry(circuitCurve, 240, 9, 8, true);
            const roadMat = new THREE.MeshStandardMaterial({
                color: isCyber ? 0x141824 : 0x22242a,
                roughness: 0.7
            });
            const roadMesh = new THREE.Mesh(roadGeo, roadMat);
            roadMesh.scale.y = 0.04; // Lay flat
            roadMesh.receiveShadow = true;
            this.scene.add(roadMesh);
            this.mapObjects.push(roadMesh);

            // Curbs (Red & White apex kerbs)
            const curbGeo = new THREE.TubeGeometry(circuitCurve, 240, 9.6, 8, true);
            const curbMat = new THREE.MeshBasicMaterial({ color: isCyber ? 0x7fd0ff : 0xd8342a });
            const curbMesh = new THREE.Mesh(curbGeo, curbMat);
            curbMesh.scale.y = 0.02;
            curbMesh.position.y = -0.05;
            this.scene.add(curbMesh);
            this.mapObjects.push(curbMesh);

            // Grandstands and Electronic Race Towers
            for (let i = 0; i < points.length; i += 6) {
                const p = points[i];
                const grandstand = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 12), new THREE.MeshLambertMaterial({ color: 0x9aaec4 }));
                grandstand.position.set(p.x * 1.18, 4, p.z * 1.18);
                grandstand.lookAt(p);
                this.scene.add(grandstand);
                this.mapObjects.push(grandstand);

                // Neon checkpoint gates
                const gTower1 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 1), new THREE.MeshLambertMaterial({ color: 0x17306b }));
                gTower1.position.set(p.x + 12, 5, p.z);
                const gTower2 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 1), new THREE.MeshLambertMaterial({ color: 0x17306b }));
                gTower2.position.set(p.x - 12, 5, p.z);
                const gBeam = new THREE.Mesh(new THREE.BoxGeometry(25, 0.4, 0.4), new THREE.MeshBasicMaterial({ color: isCyber ? 0x00ffff : 0xffd23f }));
                gBeam.position.set(p.x, 9.8, p.z);
                this.scene.add(gTower1, gTower2, gBeam);
                this.mapObjects.push(gTower1, gTower2, gBeam);
                this.checkpoints.push(p);
            }

            this.playerPos.copy(points[0]).add(new THREE.Vector3(0, 0.6, 0));
        },

        // FLAT CREATIVE WORLD FOR BUILDS MODE
        buildFlatCreativeWorld: function() {
            const gridHelper = new THREE.GridHelper(400, 200, 0x3d8bff, 0xcfe0f7);
            gridHelper.position.y = 0.01;
            this.scene.add(gridHelper);
            this.mapObjects.push(gridHelper);

            const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({ color: 0xf4f9ff }));
            floor.rotateX(-Math.PI / 2);
            floor.receiveShadow = true;
            this.scene.add(floor);
            this.mapObjects.push(floor);

            this.playerPos.set(0, 1, 0);
        },

        // HANGOUT WORLDS
        buildHangoutWorld: function(mapId) {
            const groundMat = new THREE.MeshLambertMaterial({ color: mapId === 'desert' ? 0xe2b678 : (mapId === 'snow' ? 0xf0f8ff : 0x5cb85c) });
            const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), groundMat);
            ground.rotateX(-Math.PI / 2);
            ground.receiveShadow = true;
            this.scene.add(ground);
            this.mapObjects.push(ground);

            // Add scenery
            for (let i = 0; i < 20; i++) {
                const ang = Math.random() * Math.PI * 2;
                const dist = 25 + Math.random() * 80;
                const prop = new THREE.Mesh(new THREE.ConeGeometry(2, 6, 6), new THREE.MeshLambertMaterial({ color: 0x2e8b57 }));
                prop.position.set(Math.cos(ang) * dist, 3, Math.sin(ang) * dist);
                prop.castShadow = true;
                this.scene.add(prop);
                this.mapObjects.push(prop);
            }
            this.playerPos.set(0, 1, 0);
        },

        // RACE SYSTEM
        setupRaceMode: function(distance) {
            this.raceActive = false;
            this.raceFinished = false;
            this.raceDistance = distance;
            this.currentProgress = 0;
            this.speed = 0;

            const cdEl = document.getElementById('cd');
            const rtimer = document.getElementById('raceTimer');
            const rbar = document.getElementById('rbar');
            const spd = document.getElementById('spd');
            const rpos = document.getElementById('rpos');

            if (rtimer) { rtimer.classList.remove('hide'); rtimer.textContent = '0.00s'; }
            if (rbar) { rbar.classList.remove('hide'); const i = rbar.querySelector('i'); if (i) i.style.width = '0%'; }
            if (spd) spd.classList.remove('hide');
            if (rpos) rpos.classList.remove('hide');

            // Countdown sequence
            if (cdEl) {
                cdEl.classList.remove('hide');
                let count = 3;
                cdEl.textContent = count;
                this.playRetroSound('countdown');

                const interval = setInterval(() => {
                    count--;
                    if (count > 0) {
                        cdEl.textContent = count;
                        this.playRetroSound('countdown');
                    } else if (count === 0) {
                        cdEl.textContent = 'GO!';
                        this.playRetroSound('go');
                        this.raceActive = true;
                        this.raceStartTime = performance.now();
                    } else {
                        cdEl.classList.add('hide');
                        clearInterval(interval);
                    }
                }, 1000);
            }
        },

        // BUILDS MODE INTEGRATION
        enterBuildMode: function() {
            this.loadMap('builds');
        },

        exitBuildMode: function() {
            this.loadMap('island');
        },

        setBuildTestMode: function(active) {
            this.isCarMode = false;
            if (this.carMesh) this.carMesh.visible = false;
            if (this.playerMesh) this.playerMesh.visible = true;
            this.playerPos.set(0, 2, 0);
        },

        // MAIN GAME ANIMATION LOOP
        animate: function() {
            requestAnimationFrame(() => this.animate());

            const delta = Math.min(this.clock.getDelta(), 0.1);

            // Driving & Player Physics
            if (this.isCarMode && this.raceActive && !this.raceFinished) {
                // Acceleration
                if (this.keys['w'] || this.keys['arrowup']) {
                    this.speed = Math.min(this.maxSpeed, this.speed + this.accel * delta * 12);
                } else if (this.keys['s'] || this.keys['arrowdown']) {
                    this.speed = Math.max(-25, this.speed - this.accel * delta * 10);
                } else {
                    this.speed *= 0.98; // Drag friction
                }

                // Nitro Boost (Shift or Space)
                if ((this.keys['shift'] || this.keys[' ']) && this.boostAmount > 0) {
                    this.speed = Math.min(this.maxSpeed * 1.35, this.speed + this.boostPower * delta * 18);
                    this.boostAmount = Math.max(0, this.boostAmount - delta * 30);
                    this.isBoosting = true;
                    if (Math.random() < 0.2) this.playRetroSound('boost');
                } else {
                    this.isBoosting = false;
                    this.boostAmount = Math.min(100, this.boostAmount + delta * 12);
                }

                // Steering
                if (this.keys['a'] || this.keys['arrowleft']) {
                    this.playerRot += (this.handling * 0.45) * delta * (this.speed >= 0 ? 1 : -1);
                }
                if (this.keys['d'] || this.keys['arrowright']) {
                    this.playerRot -= (this.handling * 0.45) * delta * (this.speed >= 0 ? 1 : -1);
                }

                // Move position
                const moveDist = (this.speed / 3.6) * delta;
                this.playerPos.x += Math.sin(this.playerRot) * moveDist;
                this.playerPos.z += Math.cos(this.playerRot) * moveDist;
                this.currentProgress += Math.abs(moveDist);

                // Check finish
                if (this.currentProgress >= this.raceDistance) {
                    this.raceFinished = true;
                    this.playRetroSound('go');
                    if (window.UI && window.UI.toast) {
                        const time = ((performance.now() - this.raceStartTime) / 1000).toFixed(2);
                        window.UI.toast('FINISH! Waktu: ' + time + ' detik!');
                    }
                }

                // Update Race HUD
                const rtimer = document.getElementById('raceTimer');
                if (rtimer) {
                    const elapsed = ((performance.now() - this.raceStartTime) / 1000).toFixed(2);
                    rtimer.textContent = elapsed + 's';
                }

                const rbar = document.getElementById('rbar');
                if (rbar) {
                    const i = rbar.querySelector('i');
                    if (i) {
                        const pct = Math.min(100, (this.currentProgress / this.raceDistance) * 100);
                        i.style.width = pct + '%';
                    }
                }

                const spdEl = document.getElementById('spd');
                if (spdEl) {
                    const b = spdEl.querySelector('b');
                    if (b) b.textContent = Math.round(Math.abs(this.speed));
                    const sbI = spdEl.querySelector('.sb i');
                    if (sbI) sbI.style.width = Math.min(100, (Math.abs(this.speed) / this.maxSpeed) * 100) + '%';
                    spdEl.classList.toggle('bo', this.isBoosting);
                }
            } else if (!this.isCarMode) {
                // Free walking physics for Jello character
                let moveX = 0, moveZ = 0;
                if (this.keys['w'] || this.keys['arrowup']) moveZ -= 1;
                if (this.keys['s'] || this.keys['arrowdown']) moveZ += 1;
                if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
                if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

                if (moveX !== 0 || moveZ !== 0) {
                    const angle = Math.atan2(moveX, moveZ);
                    this.playerRot = angle + Math.PI;
                    const speed = 12 * delta;
                    this.playerPos.x += Math.sin(angle) * speed;
                    this.playerPos.z += Math.cos(angle) * speed;
                }
            }

            // Update mesh positions
            if (this.isCarMode && this.carMesh) {
                this.carMesh.position.copy(this.playerPos);
                this.carMesh.rotation.y = this.playerRot;
            } else if (this.playerMesh) {
                this.playerMesh.position.copy(this.playerPos);
                this.playerMesh.rotation.y = this.playerRot;
            }

            // Smooth 3rd person chase camera
            const camOffset = this.isCarMode ? new THREE.Vector3(0, 6, -14) : new THREE.Vector3(0, 7, -12);
            camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRot);
            const targetCamPos = this.playerPos.clone().add(camOffset);
            this.camera.position.lerp(targetCamPos, 0.15);
            this.camera.lookAt(this.playerPos.clone().add(new THREE.Vector3(0, 1.5, 0)));

            this.renderer.render(this.scene, this.camera);
        }
    };

    window.World = World;
    window.addEventListener('DOMContentLoaded', () => World.init());
})(window);
