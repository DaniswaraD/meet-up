// ================================================================
// Meet-UP — Enhanced UI Controller (ui.js)
// Polished Builds Mode UI, Multi-category Racing & 15 Cars Selector
// ================================================================

(function(window) {
    'use strict';

    const UI = {
        currentCarCategory: 'drag', // 'drag', 'rally', 'circuit'
        currentBuildCategory: 'struct',

        init: function() {
            console.log('[UI] Initializing enhanced Meet-UP UI...');
            this.bindMenuButtons();
            this.setupMapPicker();
            this.setupCarSelector();
            this.setupColorPickers();
            this.setupBuildToolbar();
            this.hideLoader();
        },

        toast: function(msg) {
            const t = document.getElementById('toast');
            if (!t) return;
            t.textContent = msg;
            t.classList.remove('hide');
            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => {
                t.classList.add('hide');
            }, 3000);
        },

        hideLoader: function() {
            setTimeout(() => {
                const load = document.getElementById('load');
                if (load) load.classList.add('hide');
                const menu = document.getElementById('menu');
                if (menu) menu.classList.remove('hide');
            }, 600);
        },

        bindMenuButtons: function() {
            const showScreen = (screenId) => {
                document.querySelectorAll('.ui').forEach(el => {
                    if (el.id !== 'toast' && el.id !== 'rot' && el.id !== 'build-ui') el.classList.add('hide');
                });
                const target = document.getElementById(screenId);
                if (target) target.classList.remove('hide');
            };

            // Main Menu
            const btnPlay = document.getElementById('mp');
            if (btnPlay) btnPlay.onclick = () => showScreen('playpick');

            const btnSkin = document.getElementById('ms');
            if (btnSkin) btnSkin.onclick = () => { showScreen('skin'); this.renderCarGrid(); };

            const btnRoom = document.getElementById('mr');
            if (btnRoom) btnRoom.onclick = () => showScreen('croom');

            const btnSet = document.getElementById('mt');
            if (btnSet) btnSet.onclick = () => showScreen('set');

            // Back buttons
            document.querySelectorAll('.bk, #ppbk, #sb, #vbk').forEach(b => {
                b.onclick = () => showScreen('menu');
            });

            // HUD pause
            const pb = document.getElementById('pb');
            if (pb) pb.onclick = () => {
                const pause = document.getElementById('pause');
                if (pause) pause.classList.remove('hide');
            };

            const pr = document.getElementById('pr');
            if (pr) pr.onclick = () => {
                const pause = document.getElementById('pause');
                if (pause) pause.classList.add('hide');
            };

            const pe = document.getElementById('pe');
            if (pe) pe.onclick = () => {
                const pause = document.getElementById('pause');
                if (pause) pause.classList.add('hide');
                const hud = document.getElementById('hud');
                if (hud) hud.classList.add('hide');
                if (window.BuildSystem && window.BuildSystem.active) window.BuildSystem.exit();
                showScreen('menu');
            };
        },

        // MAP SELECTION (Hangout, Drag (4), Rally (5), Circuit (4), Mini Games)
        setupMapPicker: function() {
            const containers = ['playpick', 'croom'];
            containers.forEach(contId => {
                const cont = document.getElementById(contId);
                if (!cont) return;

                // Find or create category containers
                const mapGroupWrap = cont.querySelector('.mapGroups');
                if (!mapGroupWrap) return;

                mapGroupWrap.innerHTML = `
                    <div class="mapGroup" data-group="hangout">
                        <div class="lbl">🌴 Hangout</div>
                        <div class="grid map" id="${contId}_hangout"></div>
                    </div>
                    <div class="mapGroup" data-group="drag">
                        <div class="lbl">⚡ Drag Race (4 Map)</div>
                        <div class="grid map" id="${contId}_drag"></div>
                    </div>
                    <div class="mapGroup" data-group="rally">
                        <div class="lbl">🏁 Rally (5 Map - Versi Sekarang)</div>
                        <div class="grid map" id="${contId}_rally"></div>
                    </div>
                    <div class="mapGroup" data-group="circuit">
                        <div class="lbl">🏎️ Sirkuit 4500J (4 Map)</div>
                        <div class="grid map" id="${contId}_circuit"></div>
                    </div>
                    <div class="mapGroup" data-group="fun">
                        <div class="lbl">🎮 Mode Seru & Kreatif</div>
                        <div class="grid map" id="${contId}_fun"></div>
                    </div>
                `;

                if (!window.World || !window.World.mapsData) return;
                const maps = window.World.mapsData;

                Object.keys(maps).forEach(mapKey => {
                    const map = maps[mapKey];
                    const targetGrid = document.getElementById(`${contId}_${map.group}`);
                    if (!targetGrid) return;

                    const btn = document.createElement('button');
                    btn.className = 'jc' + (mapKey === window.World.currentMap ? ' on' : '');
                    btn.setAttribute('data-map', mapKey);
                    btn.innerHTML = `
                        <span>${map.name}</span>
                        <small>${map.distance ? map.distance + 'J' : 'FREE'}</small>
                    `;
                    btn.onclick = () => {
                        cont.querySelectorAll('.grid.map button').forEach(b => b.classList.remove('on'));
                        btn.classList.add('on');
                        this.startMap(mapKey);
                    };
                    targetGrid.appendChild(btn);
                });
            });
        },

        startMap: function(mapId) {
            document.querySelectorAll('.ui').forEach(el => {
                if (el.id !== 'toast' && el.id !== 'rot') el.classList.add('hide');
            });

            if (mapId === 'builds') {
                if (window.BuildSystem) window.BuildSystem.start();
            } else {
                if (window.World) window.World.loadMap(mapId);
                const hud = document.getElementById('hud');
                if (hud) hud.classList.remove('hide');
                const mob = document.getElementById('mob');
                if (mob && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) mob.classList.remove('hide');
            }

            const mapDef = window.World ? window.World.mapsData[mapId] : null;
            if (mapDef) this.toast('Memasuki: ' + mapDef.name);
        },

        // 15 CARS SELECTOR WITH 3 CATEGORY TABS
        setupCarSelector: function() {
            const carContainer = document.getElementById('cars');
            if (!carContainer) return;

            // Insert Category Tabs before car grid
            let tabs = document.getElementById('car-tabs');
            if (!tabs) {
                tabs = document.createElement('div');
                tabs.id = 'car-tabs';
                tabs.className = 'car-nav-tabs';
                tabs.innerHTML = `
                    <button class="car-tab on" data-cat="drag">⚡ DRAG RACE</button>
                    <button class="car-tab" data-cat="rally">🏁 RALLY</button>
                    <button class="car-tab" data-cat="circuit">🏎️ SIRKUIT</button>
                `;
                carContainer.parentNode.insertBefore(tabs, carContainer);

                tabs.querySelectorAll('.car-tab').forEach(tb => {
                    tb.onclick = () => {
                        tabs.querySelectorAll('.car-tab').forEach(b => b.classList.remove('on'));
                        tb.classList.add('on');
                        this.currentCarCategory = tb.getAttribute('data-cat');
                        this.renderCarGrid();
                    };
                });
            }

            this.renderCarGrid();
        },

        renderCarGrid: function() {
            const grid = document.getElementById('cars');
            if (!grid || !window.World || !window.World.carsData) return;
            grid.innerHTML = '';

            const cars = window.World.carsData;
            Object.keys(cars).forEach(carKey => {
                const car = cars[carKey];
                if (car.category !== this.currentCarCategory) return;

                const isEquipped = (window.World.currentCarId === carKey);
                const btn = document.createElement('button');
                btn.className = 'car' + (isEquipped ? ' on' : '');
                btn.innerHTML = `
                    <div class="cn">${car.name}</div>
                    <canvas class="car-thumb" width="120" height="60" data-car="${carKey}"></canvas>
                    <div class="car-stats-bars">
                        <div class="cs-row"><span class="cs-lbl">SPD</span><div class="cs-bar"><i style="width:${(car.speed / 200) * 100}%"></i></div></div>
                        <div class="cs-row"><span class="cs-lbl">ACC</span><div class="cs-bar"><i style="width:${car.accel * 10}%"></i></div></div>
                        <div class="cs-row"><span class="cs-lbl">HND</span><div class="cs-bar"><i style="width:${car.handling * 10}%"></i></div></div>
                        <div class="cs-row"><span class="cs-lbl">BST</span><div class="cs-bar cs-boost"><i style="width:${car.boost * 10}%"></i></div></div>
                    </div>
                    <span class="cp ${isEquipped ? 'owned' : ''}">${isEquipped ? 'DIPAKAI' : 'PILIH MOBIL'}</span>
                `;

                btn.onclick = () => {
                    grid.querySelectorAll('button.car').forEach(b => {
                        b.classList.remove('on');
                        const cp = b.querySelector('.cp');
                        if (cp) { cp.className = 'cp'; cp.textContent = 'PILIH MOBIL'; }
                    });
                    btn.classList.add('on');
                    const cp = btn.querySelector('.cp');
                    if (cp) { cp.className = 'cp owned'; cp.textContent = 'DIPAKAI'; }

                    window.World.equipCar(carKey);
                    this.toast('Mobil dipilih: ' + car.name);
                };

                grid.appendChild(btn);

                // Draw 2D Pixel Thumbnail
                setTimeout(() => this.drawCarThumbnail(btn.querySelector('.car-thumb'), car), 50);
            });
        },

        drawCarThumbnail: function(canvas, car) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // Ground shadow
            ctx.fillStyle = '#0f1f4444';
            ctx.beginPath();
            ctx.ellipse(w / 2, h - 8, w * 0.4, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Car body
            ctx.fillStyle = car.color || '#3d8bff';
            ctx.fillRect(18, h - 26, w - 36, 12);

            // Cabin / Roof
            ctx.fillStyle = '#172844';
            ctx.fillRect(36, h - 38, w - 74, 13);

            // Windshield highlight
            ctx.fillStyle = '#7fd0ff';
            ctx.fillRect(w - 48, h - 36, 6, 10);

            // Wheels
            ctx.fillStyle = '#111625';
            ctx.beginPath();
            ctx.arc(36, h - 14, 8, 0, Math.PI * 2);
            ctx.arc(w - 36, h - 14, 8, 0, Math.PI * 2);
            ctx.fill();

            // Rims
            ctx.fillStyle = (car.category === 'rally') ? '#ffd23f' : '#ffffff';
            ctx.beginPath();
            ctx.arc(36, h - 14, 4, 0, Math.PI * 2);
            ctx.arc(w - 36, h - 14, 4, 0, Math.PI * 2);
            ctx.fill();

            // Headlight & Taillight
            ctx.fillStyle = '#ffe27a';
            ctx.fillRect(w - 20, h - 24, 3, 5);
            ctx.fillStyle = '#ff3a5a';
            ctx.fillRect(17, h - 24, 3, 5);
        },

        setupColorPickers: function() {
            const swatches = [
                '#3d8bff', '#7fd0ff', '#2fc457', '#ffd23f', '#ff5db1', '#ff3a5a',
                '#8f5cff', '#ffffff', '#e8f2ff', '#17306b', '#111625', '#f09020'
            ];
            ['c1grid', 'c2grid', 'ncgrid'].forEach(gridId => {
                const grid = document.getElementById(gridId);
                if (!grid) return;
                grid.innerHTML = '';
                swatches.forEach((color, idx) => {
                    const btn = document.createElement('button');
                    btn.className = (idx === 0) ? 'on' : '';
                    btn.style.setProperty('--sw', color);
                    btn.setAttribute('data-c', color);
                    btn.onclick = () => {
                        grid.querySelectorAll('button').forEach(b => b.classList.remove('on'));
                        btn.classList.add('on');
                    };
                    grid.appendChild(btn);
                });
            });
        },

        // BUILDS MODE TOOLBAR & EVENT HOOKS
        setupBuildToolbar: function() {
            const toolMap = {
                'bt-add': 'add',
                'bt-sculpt': 'sculpt',
                'bt-remove': 'remove',
                'bt-rot': 'rot',
                'bt-undo': 'undo',
                'bt-play': 'play',
                'bt-save': 'save',
                'bt-exit': 'exit'
            };

            Object.keys(toolMap).forEach(btnId => {
                const btn = document.getElementById(btnId);
                if (!btn) return;
                const tool = toolMap[btnId];

                btn.onclick = () => {
                    if (!window.BuildSystem) return;

                    if (tool === 'play') {
                        window.BuildSystem.togglePlayMode();
                    } else if (tool === 'undo') {
                        window.BuildSystem.undo();
                    } else if (tool === 'rot') {
                        window.BuildSystem.rotateSelected(Math.PI / 4);
                    } else if (tool === 'save') {
                        const panel = document.getElementById('save-panel');
                        if (panel) panel.classList.toggle('hide');
                    } else if (tool === 'exit') {
                        window.BuildSystem.exit();
                        const menu = document.getElementById('menu');
                        if (menu) menu.classList.remove('hide');
                    } else {
                        window.BuildSystem.setTool(tool);
                    }
                };
            });

            // Stop play mode button
            const btStop = document.getElementById('bt-stop');
            if (btStop) {
                btStop.onclick = () => {
                    if (window.BuildSystem) window.BuildSystem.togglePlayMode();
                };
            }

            // Save panel buttons
            const btnSave = document.getElementById('btn-save');
            const saveName = document.getElementById('save-name');
            if (btnSave) {
                btnSave.onclick = () => {
                    const name = saveName ? saveName.value.trim() : '';
                    if (window.BuildSystem) window.BuildSystem.saveToLocalStorage(name);
                    const panel = document.getElementById('save-panel');
                    if (panel) panel.classList.add('hide');
                };
            }

            const btnLoad = document.getElementById('btn-load');
            if (btnLoad) {
                btnLoad.onclick = () => {
                    const name = saveName ? saveName.value.trim() : '';
                    if (window.BuildSystem) window.BuildSystem.loadFromLocalStorage(name);
                    const panel = document.getElementById('save-panel');
                    if (panel) panel.classList.add('hide');
                };
            }

            const saveClose = document.getElementById('save-close');
            if (saveClose) {
                saveClose.onclick = () => {
                    const panel = document.getElementById('save-panel');
                    if (panel) panel.classList.add('hide');
                };
            }
        }
    };

    window.UI = UI;
    window.addEventListener('DOMContentLoaded', () => UI.init());
})(window);
