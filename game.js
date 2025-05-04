// --- Constants ---
const TICK_INTERVAL = 1000; // Milliseconds per game tick
const MAP_WIDTH = 15;
const MAP_HEIGHT = 15;
const NEXUS_X = 7;
const NEXUS_Y = 7;
const SAVE_SLOT_PREFIX = 'arcaneChamberSave_';
const MAX_SAVES = 5;
const AUTOSAVE_INTERVAL_TICKS = 300; // ~5 minutes default
const EVENT_LOG_MAX_SIZE = 150;

// --- Game State ---
// WARNING: This is a heavily modified structure. Many systems are placeholders
// and will require significant implementation. Expect inconsistencies.
const gameState = {
    started: false,
    version: '1.0.1-dev', // Incremented version
    tick: 0,
    lastTick: Date.now(),
    tickInterval: TICK_INTERVAL,

    // ... rest of gameState definition ...
    exploration: {
        map: [], // MAP_WIDTH x MAP_HEIGHT grid
        currentLocation: { x: NEXUS_X, y: NEXUS_Y }, // Center is Nexus Core
        visited: [{ x: NEXUS_X, y: NEXUS_Y }],
        discovered: [],
        mapRevealed: false,
        returning: false,
        inCombat: false,
        currentEnemy: null,
    },
    // ... rest of gameState definition ...
    events: [], // Log of past events - limited by EVENT_LOG_MAX_SIZE
    // ... rest of gameState definition ...
    settings: {
        soundEffects: true,
        music: true,
        volume: 0.7,
        theme: 'dark', // Added 'dark', 'light', 'system'
        highContrast: false,
        screenReader: false, // This still needs real implementation
        visualEffects: true,
        autosave: true
    }
};

// --- Data Templates ---

// --- Resource Information ---
// Includes new magical resources
const resourceInfo = {
    // ... existing resourceInfo ...
};

// --- Nexus Construct Templates (Building Examples) ---
const constructTemplates = [
    // ... existing constructTemplates ...
];

// --- Attuned Soul Templates (Worker Examples) ---
const soulTemplates = [
    // ... existing soulTemplates ...
];

// --- Infusion Templates (Crafting Examples) ---
const infusionTemplates = [
    // ... existing infusionTemplates ...
];

// --- Spell Templates ---
let spellTemplates = [
    // ... existing spellTemplates ...
];

// --- Achievement Templates (Rethemed Examples) ---
const achievementTemplates = [
    // ... existing achievementTemplates ...
];

// --- Story Events (Rethemed Examples) ---
const storyEvents = [
    // ... existing storyEvents ...
];

// --- Map Location Types (Rethemed) ---
 const locationTypes = [
    // ... existing locationTypes ...
];

// --- Enemy Templates (Rethemed Examples) ---
 const enemyTemplates = [
    // ... existing enemyTemplates ...
 ];

// --- Audio ---
// NOTE: You would NEED to find or create suitable magical sound effects.
const audioFiles = {
    // ... existing audioFiles ...
};
// ... setup audio properties ...

// --- DOM Elements ---
const elements = {}; // Will be populated by cacheElements()

// --- Initialization & Setup ---

function initGame() {
    console.log("Initializing game...");
    try {
        // Cache elements first and check success
        if (!cacheElements()) {
             // Error logged within cacheElements, maybe display general UI error message here
             const loadingText = document.querySelector('.loading-text');
             if(loadingText) {
                 loadingText.textContent = "Initialization Error: UI Element Missing!";
                 loadingText.style.color = "var(--danger-color)";
             }
             console.error("cacheElements failed. Stopping initialization.");
             return; // Stop initialization
        }

        // --- Proceed only if caching was successful ---

        initializeMap();
        setupEventListeners();
        gameState.achievements = JSON.parse(JSON.stringify(achievementTemplates));
        loadSettings(); // Apply theme etc.

        // --- Robust Loading Screen Hiding ---
        const loadingScreen = elements.loadingScreen; // Use cached element
        let loadingHidden = false;

        const hideLoadingScreen = () => {
            if (loadingHidden) return;
            loadingHidden = true;
            loadingScreen.style.display = 'none';
            elements.gameContainer.classList.add('visible');
            console.log("Loading screen hidden.");
        };

        loadingScreen.style.opacity = '0';
        console.log("Loading screen fade out initiated.");

        loadingScreen.addEventListener('transitionend', hideLoadingScreen, { once: true });

        setTimeout(() => {
             console.log("Fallback timer triggered for hiding loading screen.");
            hideLoadingScreen();
        }, 1000);

        checkForSavedGames();
        console.log("Init game finished successfully.");

    } catch (error) {
        console.error("Error during game initialization:", error);
        const loadingText = document.querySelector('.loading-text');
        if(loadingText) {
            loadingText.textContent = "Initialization Error!";
            loadingText.style.color = "var(--danger-color)";
        }
         // Example: Display more details if you have a specific error div
         // const errorDetails = document.getElementById('init-error-details');
         // if(errorDetails) errorDetails.textContent = error.message + '\n' + error.stack;
    }
}

function cacheElements() {
     console.log("Caching DOM elements...");
     elements.loadingScreen = document.querySelector('.loading-screen'); // Cache loading screen first
     console.log("Loading Screen Element:", elements.loadingScreen);

     elements.gameContainer = document.getElementById('game-container');
     console.log("Game Container Element:", elements.gameContainer);

     // Check critical elements immediately
     if (!elements.loadingScreen || !elements.gameContainer) {
        console.error("CRITICAL ERROR: Loading screen or Game container not found during cache!");
        // We can return false or throw an error here to signal failure
        // throw new Error("Critical UI elements missing in cacheElements."); // Option 1: Throw error
        return false; // Option 2: Return failure status
     }

     elements.startScreen = document.getElementById('start-screen');
     elements.mainGame = document.getElementById('main-game');
     elements.btnStartGame = document.getElementById('btn-start-game');
     elements.chamberRoom = document.getElementById('chamber-room');
     elements.chamberTitle = document.getElementById('chamber-title');
     elements.chamberDescription = document.getElementById('chamber-description');
     elements.chamberChoices = document.getElementById('chamber-choices');
     elements.resourcesContainer = document.getElementById('resources-container');
     elements.btnGatherMotes = document.getElementById('btn-gather-motes');
     elements.btnChannelMana = document.getElementById('btn-channel-mana');
     elements.eventLog = document.getElementById('event-log');
     elements.mapContainer = document.getElementById('map-container');
     elements.mapGrid = document.getElementById('map-grid');
     elements.btnToggleMap = document.getElementById('btn-toggle-map');
     elements.currentLocation = document.getElementById('current-location');
     elements.locationDescription = document.getElementById('location-description');
     elements.btnExplore = document.getElementById('btn-explore');
     elements.btnReturnNexus = document.getElementById('btn-return-nexus');
     elements.explorationEncounter = document.getElementById('exploration-encounter');
     elements.combatEnemyContainer = document.getElementById('combat-enemy-container');
     elements.combatLog = document.getElementById('combat-log');
     elements.combatActions = document.getElementById('combat-actions');
     elements.constructsContainer = document.getElementById('constructs-container');
     elements.attunementContainer = document.getElementById('attunement-container');
     elements.population = document.getElementById('population');
     elements.maxPopulation = document.getElementById('max-population');
     elements.populationBar = document.getElementById('population-bar');
     elements.infusionContainer = document.getElementById('infusion-container');
     elements.spellsContainer = document.getElementById('spells-container');
     elements.researchContainer = document.getElementById('research-container');
     elements.achievementsContainer = document.getElementById('achievements-container');
     elements.saveSlots = document.getElementById('save-slots');
     elements.loadSlots = document.getElementById('load-slots');

     // Modals
     elements.settingsModal = document.getElementById('settings-modal');
     elements.saveModal = document.getElementById('save-modal');
     elements.loadModal = document.getElementById('load-modal');
     elements.achievementsModal = document.getElementById('achievements-modal');
     elements.restartModal = document.getElementById('restart-modal');
     elements.grimoireModal = document.getElementById('grimoire-modal');

     // Settings elements
     elements.settingTheme = document.getElementById('setting-theme');
     elements.toggleSoundEffects = document.getElementById('toggle-sound-effects');
     elements.toggleMusic = document.getElementById('toggle-music');
     elements.volumeSlider = document.getElementById('volume-slider');
     elements.volumeValue = document.getElementById('volume-value');
     elements.toggleHighContrast = document.getElementById('toggle-high-contrast');
     elements.toggleScreenReader = document.getElementById('toggle-screen-reader');
     elements.toggleVisualEffects = document.getElementById('toggle-visual-effects');
     elements.toggleAutosave = document.getElementById('toggle-autosave');

     // Sidebar elements
     elements.sidebarToggle = document.getElementById('sidebar-toggle-btn');
     elements.sidebar = document.getElementById('sidebar-menu');
     elements.sidebarClose = document.getElementById('sidebar-close-btn');
     elements.btnSaveGame = document.getElementById('btn-save-game');
     elements.btnLoadGame = document.getElementById('btn-load-game');
     elements.btnSettings = document.getElementById('btn-settings');
     elements.btnAchievements = document.getElementById('btn-achievements');
     elements.btnGrimoire = document.getElementById('btn-grimoire');
     elements.btnRestart = document.getElementById('btn-restart');

     // Tab elements
     elements.tabButtons = document.querySelectorAll('.tab-button');
     elements.tabContents = document.querySelectorAll('.tab-content');

    // Close buttons for modals
    elements.modalCloseButtons = document.querySelectorAll('[data-close-modal]');

     // Specific action buttons in modals
     elements.btnRestartConfirm = document.getElementById('btn-restart-confirm');

     console.log("Finished caching elements.");
     return true; // Signal success
}

function setupEventListeners() {
    // ... existing setupEventListeners ...
    // Settings Controls
    elements.settingTheme.addEventListener('change', updateSettings); // Add listener for theme
    elements.toggleSoundEffects.addEventListener('change', updateSettings);
    // ... rest of settings listeners ...
}

// --- Core Game Loop & Updates ---

function gameLoop() {
    // ... existing gameLoop ...
}

function updateGameTick() {
    // ... existing updateGameTick code ...

     // Autosave
     if (gameState.settings.autosave && gameState.tick % AUTOSAVE_INTERVAL_TICKS === 0) {
         autoSaveGame();
     }
    updateResearchProgress(); // Process active research
}

function startGame() {
     // ... existing startGame ...
}

// --- Sound Handling ---
 function playSound(soundName) {
     // ... existing playSound ...
 }

// --- Notifications & Logging ---
function showNotification(title, message, type = 'info', duration = 5000) {
     // ... existing showNotification ...
 }

 function logEvent(message, type = 'info') {
    // ... existing logEvent code ...

     // Limit event log size in gameState
     if (gameState.events.length > EVENT_LOG_MAX_SIZE) {
         gameState.events.shift();
     }
 }

// --- Story & Choice Handling ---

function triggerStoryEvent(eventId) {
     // ... existing triggerStoryEvent ...
 }

 function canMakeChoice(choice) {
    // ... existing canMakeChoice ...
 }

function selectChoice(choice, currentEvent) {
     // ... existing selectChoice ...
 }

 function applyEventTriggers(triggers) {
     // ... existing applyEventTriggers ...
 }

 // --- Chamber State & Actions ---
 function updateChamber() {
    // ... existing updateChamber ...
 }

 function updateChamberVisuals() {
    // ... existing updateChamberVisuals ...
 }

 function gatherMotes() {
     // ... existing gatherMotes ...
 }

 function channelMana() {
     // ... existing channelMana ...
 }

// --- Resource Management ---
function addResource(resourceId, amount) {
    // ... existing addResource ...
}


function updateResources() {
     // ... existing updateResources ...
 }


// --- Player State ---
function updatePlayerState() {
    // ... existing updatePlayerState ...
 }


// --- UI Update Functions ---

 function updateUI() {
     updateResourcesDisplay();
     updatePopulationDisplay();
     updateConstructOptions();
     updateAttunementOptions();
     updateInfusionOptions();
     updateSpellListUI(); // Add call
     updateResearchUI(); // Add call
     updateCombatUI();
     updateExplorationStatus();
     // updateButtonStates(); // Consider adding this for more dynamic disabling
 }

function updateResourcesDisplay() {
     // ... existing updateResourcesDisplay ...
 }

 function getResourceInfo(resourceId) {
    // ... existing getResourceInfo ...
 }

 function updatePopulationDisplay() {
     // ... existing updatePopulationDisplay ...
 }

// --- Nexus Construct (Building) Logic ---
 function updateConstructOptions() {
     // ... existing updateConstructOptions ...
 }

function shouldShowConstruct(template) {
     // ... existing shouldShowConstruct ...
 }

 function manifestConstruct(template) {
     // ... existing manifestConstruct ...
 }

function modResourceStorage(resourceId, delta) {
    // ... existing modResourceStorage ...
}

// --- Attunement (Worker) Logic ---
function updateAttunementOptions() {
    // ... existing updateAttunementOptions ...
}

function shouldShowSoulTask(template) {
    // ... existing shouldShowSoulTask ...
}

// --- Infusion (Crafting) Logic ---
function updateInfusionOptions() {
    // ... existing updateInfusionOptions ...
}

function shouldShowInfusion(template) {
    // ... existing shouldShowInfusion ...
}

function performInfusion(template) {
     // ... existing performInfusion ...
}


// --- Exploration & Map Logic ---
 function initializeMap() {
     gameState.exploration.map = Array(MAP_HEIGHT).fill(null).map((_, y) =>
         Array(MAP_WIDTH).fill(null).map((_, x) => {
             if (x === NEXUS_X && y === NEXUS_Y) return { type: 'nexus_core', explored: true, poi: null }; // Added poi: null
             // Basic random distribution - IMPROVE THIS LATER
             const types = ['shifting_mist', 'resonant_cavern', 'shattered_sanctum', 'astral_pool', 'unraveled_plane', 'planar_breach'];
             // Slightly lower chance for dangerous areas initially? Maybe based on distance from Nexus?
             const typeId = types[Math.floor(Math.random() * types.length)];
             // Placeholder: 5% chance of a POI appearing in non-nexus cells
             const poi = (Math.random() < 0.05) ? { type: 'generic_shrine', discovered: false, data: {} } : null;
             return { type: typeId, explored: false, poi: poi };
         })
     );
     renderMap();
 }

function toggleMap() {
     // ... existing toggleMap ...
 }

function renderMap() {
     if (!elements.mapGrid || !elements.mapContainer.classList.contains('visible')) return;
     elements.mapGrid.innerHTML = '';

    const currentX = gameState.exploration.currentLocation.x;
    const currentY = gameState.exploration.currentLocation.y;

     for (let y = 0; y < MAP_HEIGHT; y++) {
         for (let x = 0; x < MAP_WIDTH; x++) {
             const cellData = gameState.exploration.map[y][x];
             if (!cellData) continue; // Skip if cell data is missing
             const locationType = locationTypes.find(l => l.id === cellData.type) || {};
             const cellDiv = document.createElement('div');
             cellDiv.className = 'map-cell relative'; // Added relative for absolute positioning inside
             cellDiv.title = `${locationType.name || 'Unknown'} (${x}, ${y})`;

             const isCurrent = x === currentX && y === currentY;
             const isVisited = gameState.exploration.visited.some(loc => loc.x === x && loc.y === y);
             const isDiscovered = gameState.exploration.discovered.some(loc => loc.x === x && loc.y === y);

             cellDiv.classList.toggle('current', isCurrent);
             cellDiv.classList.toggle('visited', isVisited && !isCurrent);
             cellDiv.classList.toggle('discovered', isDiscovered && !isVisited && !isCurrent);
             cellDiv.classList.toggle('unexplored', !isVisited && !isDiscovered && !isCurrent);


            // Basic icon display for location type
             if (isVisited || isDiscovered || isCurrent) {
                 cellDiv.innerHTML = `<div class="map-cell-content"><i class="fas ${locationType.icon || 'fa-question'} fa-fw"></i></div>`;

                 // Display POI icon if present and discovered or if on current cell
                 if (cellData.poi && (cellData.poi.discovered || isCurrent)) {
                    const poiIcon = document.createElement('div');
                    // Position POI icon slightly offset - adjust as needed
                    poiIcon.className = 'absolute bottom-0 right-0 text-xs text-accent-color';
                    poiIcon.innerHTML = `<i class="fas fa-star"></i>`; // Example POI icon
                    poiIcon.title = `Point of Interest: ${cellData.poi.type}`; // Tooltip for POI
                    cellDiv.appendChild(poiIcon);
                    cellDiv.classList.add('poi'); // Add class for potential border/background styling
                 }

                 // Make discovered/visited cells clickable for movement
                if(isDiscovered || isVisited) {
                    cellDiv.style.cursor = 'pointer';
                    cellDiv.addEventListener('click', () => movePlayer(x, y));
                    // Add keyboard accessibility for map movement later
                }
             }


             elements.mapGrid.appendChild(cellDiv);
         }
     }
 }

function explore() {
    if (gameState.exploration.inCombat) {
         showNotification('Cannot Probe', 'Resolve the current confrontation first.', 'warning');
         return;
     }
    logEvent("You extend your senses into the void...", "action");
    playSound('generic_click');

    // Mark current location as visited *before* exploring results
    markCurrentLocationVisited();

    // Check for POI interaction first
    const currentCell = gameState.exploration.map[gameState.exploration.currentLocation.y][gameState.exploration.currentLocation.x];
    if (currentCell.poi && !currentCell.poi.interacted) { // Check if POI exists and hasn't been interacted with yet
        interactWithPOI(currentCell.poi);
    } else {
        // Standard exploration outcomes
        const roll = Math.random();
         if (roll < 0.4) findEssence();
         else if (roll < 0.7) discoverLocus();
         else encounterEntity();
    }

     renderMap();
     updateUI();
 }

 function markCurrentLocationVisited() {
    const currentLoc = gameState.exploration.currentLocation;
    if (!gameState.exploration.visited.some(l => l.x === currentLoc.x && l.y === currentLoc.y)) {
        gameState.exploration.visited.push({...currentLoc});
    }
    if(gameState.exploration.map[currentLoc.y] && gameState.exploration.map[currentLoc.y][currentLoc.x]) {
        gameState.exploration.map[currentLoc.y][currentLoc.x].explored = true;
         // Mark POI as discovered if present when visiting the cell
         if(gameState.exploration.map[currentLoc.y][currentLoc.x].poi) {
            gameState.exploration.map[currentLoc.y][currentLoc.x].poi.discovered = true;
         }
    }
 }

function findEssence() {
     // ... existing findEssence ...
 }

 function discoverLocus() {
     const currentX = gameState.exploration.currentLocation.x;
     const currentY = gameState.exploration.currentLocation.y;
     let newlyDiscovered = false;
     const neighbors = [ {x:0,y:-1}, {x:0,y:1}, {x:-1,y:0}, {x:1,y:0} ]; // N, S, W, E

     neighbors.forEach(n => {
         const nx = currentX + n.x;
         const ny = currentY + n.y;
         if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
             const isKnown = gameState.exploration.visited.some(v=>v.x===nx&&v.y===ny) || gameState.exploration.discovered.some(d=>d.x===nx&&d.y===ny);
             if (!isKnown) {
                 gameState.exploration.discovered.push({x: nx, y: ny});
                 // Also mark POI as discovered if one exists there
                 if(gameState.exploration.map[ny][nx]?.poi) {
                    gameState.exploration.map[ny][nx].poi.discovered = true;
                 }
                 newlyDiscovered = true;
             }
         }
     });

     // ... rest of discoverLocus ...
 }

 function encounterEntity() {
    // ... existing encounterEntity ...
 }

function movePlayer(newX, newY) {
    // ... existing movePlayer start ...

    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        // Mark previous location as visited *before* moving
        markCurrentLocationVisited();

        // Move player
        // ... rest of movePlayer logic ...

         // Chance of encounter upon entering a new square
         const newCell = gameState.exploration.map[newY]?.[newX];
         const locType = locationTypes.find(l => l.id === newCell?.type);
         if (locType && Math.random() < (locType.danger * 0.15)) {
           encounterEntity();
         }

    } else if (dx === 0 && dy === 0) {
        // Clicked on current square - maybe re-trigger explore/interact?
        explore(); // Re-running explore will check POI or default actions
    } else {
        showNotification("Cannot Traverse", "You cannot reach that locus directly.", "warning");
    }
}

function interactWithPOI(poi) {
    logEvent(`You examine the point of interest: a ${poi.type}.`, 'poi'); // Add POI type to log
    poi.interacted = true; // Mark as interacted to prevent re-triggering explore

    // --- POI Interaction Logic ---
    switch(poi.type) {
        case 'generic_shrine':
            const outcome = Math.random();
            if (outcome < 0.3) {
                const amount = Math.floor(Math.random() * 5) + 5;
                addResource('mana_motes', amount);
                logEvent(`The shrine pulses, granting you ${amount} Mana Motes!`, 'success');
            } else if (outcome < 0.6) {
                 const amount = Math.floor(Math.random() * 2) + 1;
                 addResource('ether_wisps', amount);
                logEvent(`Faint wisps coalesce around the shrine, granting ${amount} Ether Wisps.`, 'success');
            } else {
                logEvent('The shrine remains dormant, its purpose unclear.', 'info');
            }
            break;
        // Add more POI types: 'lore_fragment', 'puzzle_box', 'mini_boss', 'resource_node' etc.
        default:
             logEvent('You observe the strange anomaly, but gain no insight.', 'info');
    }
    updateUI(); // Update UI in case resources changed
}


function updateExplorationStatus() {
    if (!gameState.exploration.map[gameState.exploration.currentLocation.y]) return; // Map not initialized?
    const loc = gameState.exploration.map[gameState.exploration.currentLocation.y][gameState.exploration.currentLocation.x];
    const locType = locationTypes.find(l => l.id === loc?.type) || {name: 'Unknown Void', description: 'An uncharted area.'};
    elements.currentLocation.textContent = locType.name;

    let descriptionText = locType.description;
    // Add POI info to description if present and discovered
    if (loc.poi && loc.poi.discovered) {
        descriptionText += ` A strange ${loc.poi.interacted ? 'inert' : 'active'} ${loc.poi.type} is present here.`;
    }
    elements.locationDescription.textContent = descriptionText;


    const isNexus = gameState.exploration.currentLocation.x === NEXUS_X && gameState.exploration.currentLocation.y === NEXUS_Y;
    elements.btnReturnNexus.classList.toggle('hidden', isNexus);
    elements.btnExplore.disabled = (isNexus && !gameState.nexusStabilized) || gameState.exploration.inCombat; // Also disable in combat
    elements.btnExplore.classList.toggle('btn-disabled', elements.btnExplore.disabled);
}

function returnToNexus() {
     // ... existing returnToNexus ...
     movePlayer(NEXUS_X, NEXUS_Y); // Use constants
 }

// --- Combat Logic ---
function startCombat(enemy) {
     // ... existing startCombat ...
}

function handleCombatAction(event) {
     if (!event.target.closest('button[data-action]')) return;
     const action = event.target.closest('button[data-action]').dataset.action;

     if (!gameState.exploration.inCombat || !gameState.exploration.currentEnemy) return;

     let playerActed = false; // Flag to check if enemy turn should proceed

     switch (action) {
         case 'attack':
             playerAttack();
             playerActed = true;
             break;
         case 'defend':
             playerDefend();
             playerActed = true;
             break;
         case 'spell':
             // Simple approach: Cast the *first* available combat spell for now
             // TODO: Implement spell selection UI during combat
             const combatSpell = gameState.knownSpells
                 .map(id => spellTemplates.find(s => s.id === id))
                 .find(s => s && s.type === 'combat' && s.target === 'enemy' && gameState.player.mana >= (s.cost?.mana || 0)); // Find first usable offensive spell

             if (combatSpell) {
                 playerCastCombatSpell(combatSpell);
                 playerActed = true;
             } else {
                 showNotification("No Spell Ready", "No suitable combat spell known or insufficient mana.", "warning");
                 // Player didn't act, don't trigger enemy turn yet
             }
             break;
         case 'item':
             showNotification("Use Conduit", "Item/Conduit usage not yet implemented.", "info");
             // playerActed = true; // Set to true once implemented
             break;
         case 'flee':
             attemptFlee(); // Flee attempt counts as an action
             playerActed = true;
             break;
     }

    // If player action was valid and combat didn't end, trigger enemy turn
    if(playerActed && gameState.exploration.inCombat) {
        setTimeout(enemyTurn, 600); // Slightly longer delay for readability
    }
}

function playerAttack() {
     // ... existing playerAttack ...
 }
function playerDefend() {
     // ... existing playerDefend ...
 }
function attemptFlee() {
     // ... existing attemptFlee ...
 }

function enemyTurn() {
    // ... existing enemyTurn ...
 }


 function checkCombatEnd() {
     // ... existing checkCombatEnd ...
 }

 function endCombat(playerWon) {
     // ... existing endCombat ...
 }

 function updateCombatUI() {
     // ... existing updateCombatUI ...
 }

 function logCombat(message, type) {
    // ... existing logCombat ...
 }

function rollDamageVariance(baseDamage) {
     // ... existing rollDamageVariance ...
 }

 function spawnDamageText(value, targetElement) {
     // ... existing spawnDamageText ...
 }


// --- Achievements ---
 function unlockAchievement(id) {
     // ... existing unlockAchievement ...
 }

 function updateAchievementsDisplay() {
    // ... existing updateAchievementsDisplay ...
 }

// --- Modals ---
 function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
         // Store element that had focus before opening modal
         focusedElementBeforeModal = document.activeElement;

        // ... update modal content ...

        modal.classList.add('show');
         playSound('generic_click');

        // Move focus to the modal container or first focusable element inside
         const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
         if (focusableElements.length > 0) {
            focusableElements[0].focus();
         } else {
             modal.querySelector('.modal-content').setAttribute('tabindex', '-1'); // Make content focusable if nothing else is
             modal.querySelector('.modal-content').focus();
         }

         // Add keydown listener for focus trapping
         modal.addEventListener('keydown', trapFocusInModal);
     }
 }
 function closeModal() {
     document.querySelectorAll('.modal-backdrop.show').forEach(modal => {
         modal.classList.remove('show');
         // Remove focus trapping listener
         modal.removeEventListener('keydown', trapFocusInModal);
     });
     playSound('generic_click');

     // Return focus to the element that had it before modal opened
     if (focusedElementBeforeModal) {
         focusedElementBeforeModal.focus();
         focusedElementBeforeModal = null;
     }
 }
 function openSaveModal() { openModal('save-modal'); }
 function openLoadModal() { openModal('load-modal'); }
 function openSettingsModal() { openModal('settings-modal'); }
 function openAchievementsModal() { openModal('achievements-modal'); }
 function openRestartModal() { openModal('restart-modal'); }
 function openGrimoireModal() { openModal('grimoire-modal'); }

// --- Settings ---
function loadSettings() {
     // ... existing loadSettings ...
     applySettings(); // Apply loaded settings to UI controls and game (includes theme)
 }

function saveSettings() {
     // ... existing saveSettings ...
}

function updateSettings(event) {
     const settingId = event.target.id;
     const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

     switch(settingId) {
         case 'setting-theme':
             gameState.settings.theme = value;
             applyTheme(); // Apply theme immediately
             break;
         case 'toggle-sound-effects': gameState.settings.soundEffects = value; break;
         case 'toggle-music':
             // ... existing music toggle logic ...
             break;
         case 'toggle-high-contrast':
             gameState.settings.highContrast = value;
             document.body.classList.toggle('high-contrast', value);
             break;
         // ... rest of settings cases ...
    }
     saveSettings();
}

function updateVolume() {
     // ... existing updateVolume ...
 }

function applySettings() {
    // Update UI controls
    elements.settingTheme.value = gameState.settings.theme; // Set dropdown value
    elements.toggleSoundEffects.checked = gameState.settings.soundEffects;
    // ... update other controls ...
    elements.toggleHighContrast.checked = gameState.settings.highContrast;
    // ... update other controls ...

    // Apply visual/audio settings
    applyTheme(); // Apply light/dark/system theme
    document.body.classList.toggle('high-contrast', gameState.settings.highContrast);
     // ... music logic ...
 }

 function applyTheme() {
    const body = document.body;
    const theme = gameState.settings.theme;
    body.classList.remove('light-theme', 'dark-theme'); // Remove existing theme classes

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            body.classList.add('dark-theme'); // Assuming default is dark or create specific dark-theme class
        } else {
            body.classList.add('light-theme');
        }
    } else if (theme === 'light') {
        body.classList.add('light-theme');
    } else {
         body.classList.add('dark-theme'); // Default to dark
    }
 }

 // Add listener for system theme changes if 'system' is selected
 window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (gameState.settings.theme === 'system') {
        applyTheme();
    }
 });


// --- Save/Load ---
// Using constants defined at the top

function updateSaveLoadSlots(mode) {
    // ... existing updateSaveLoadSlots (using constants) ...
}

function saveGame(slot, overwrite = false) {
    // ... existing saveGame (using constants) ...
}

function loadGame(slot) {
    // ... existing loadGame (using constants, maybe add more state restoration) ...
    // --- CRITICAL: Restore Game State ---
    // Ensure new properties in gameState have defaults if loading an old save
    const loadedState = parsedData.gameState;
    for (const key in gameState) {
        if (loadedState.hasOwnProperty(key)) {
            // Deep merge for objects might be better, but risky without validation
            if (typeof gameState[key] === 'object' && gameState[key] !== null && !Array.isArray(gameState[key])) {
                 Object.assign(gameState[key], loadedState[key]);
            } else {
                 gameState[key] = loadedState[key];
            }
        }
        // Else: Keep the default value for keys not present in the save
    }


    // ... rest of loadGame ...
 }

 function autoSaveGame() {
     console.log("Autosaving...");
     saveGame(0, true); // Use Slot 0 for autosave
 }

 function checkForSavedGames() {
    // ... existing checkForSavedGames (using constants) ...
 }

// --- Game Lifecycle ---
 function restartGame() {
     // ... existing restartGame (using constants) ...
 }

function gameOver() {
     // ... existing gameOver ...
}

// --- Utility Functions ---
function switchTab(tabId) {
     elements.tabButtons.forEach(btn => {
        const isSelected = btn.dataset.tab === tabId;
         btn.classList.toggle('active', isSelected);
         btn.setAttribute('aria-selected', isSelected); // ARIA update
         btn.setAttribute('tabindex', isSelected ? '0' : '-1'); // Manage tab focus
     });
     elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
        content.hidden = (content.id !== `tab-${tabId}`); // More explicit hiding
     });
     if (tabId === 'exploration') renderMap();
 }

 function handleKeyPress(event) {
     // ... existing handleKeyPress ...
 }

 // --- Initial Load ---
 document.addEventListener('DOMContentLoaded', initGame);

// --- Spell System --- (NEW SECTION)
// Define more spells
const newSpellTemplates = [
    { id: 'arcane_bolt', name: 'Arcane Bolt', type: 'combat', target: 'enemy', cost: { mana: 5 }, effects: { damage: 8 }, description: 'A simple bolt of arcane energy.' },
    { id: 'mana_shield', name: 'Mana Shield', type: 'combat', target: 'self', cost: { mana: 8 }, effects: { addStatus: { id: 'shielded', duration: 3, value: 2 } }, description: 'Temporarily boosts resistance.' },
    { id: 'minor_illumination', name: 'Minor Illumination', type: 'utility', target: 'self', cost: { mana: 2 }, description: 'Briefly illuminates surroundings (Flavor only for now).', action: 'castMinorIllumination' },
    { id: 'detect_essence', name: 'Detect Essence', type: 'utility', target: 'location', cost: { mana: 10 }, description: 'Briefly reveals resource concentrations on the map.', action: 'castDetectEssence' },
    { id: 'mend_focus', name: 'Mend Focus', type: 'utility', target: 'self', cost: { mana: 15, arcane_dust: 2 }, description: 'Slightly repairs player integrity.', action: 'castMendFocus' },
    { id: 'flame_lash', name: 'Flame Lash', type: 'combat', target: 'enemy', cost: { mana: 12, soul_fragments: 1 }, effects: { damage: 15, addStatus: { id: 'burning', duration: 2, value: 3 } }, description: 'Lashes the foe with fire, causing burning.' }, // Example advanced spell
];

function updateSpellListUI() {
    if (!elements.spellsContainer) return;
    elements.spellsContainer.innerHTML = ''; // Clear

    if (gameState.knownSpells.length === 0) {
        elements.spellsContainer.innerHTML = '<p class="text-gray-400 italic">Your mind is blank. Seek knowledge or infusion.</p>';
        return;
    }

    const list = document.createElement('div');
    list.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';

    gameState.knownSpells.forEach(spellId => {
        const template = spellTemplates.find(s => s.id === spellId);
        if (template) {
            const canCast = gameState.player.mana >= (template.cost?.mana || 0); // Basic mana check
            // Add checks for other resource costs later if needed for utility spells

            const spellElement = document.createElement('div');
            spellElement.className = 'p-3 border border-gray-700 rounded bg-black bg-opacity-10';
            let costString = '';
            if (template.cost) {
                costString = Object.entries(template.cost).map(([res, amount]) => {
                    const resInfo = getResourceInfo(res) || { name: res, icon: 'fa-question' }; // Handle mana cost display
                    const playerHas = (res === 'mana') ? gameState.player.mana : gameState.resources[res];
                    return `<span class="text-xs mr-2 whitespace-nowrap ${playerHas < amount ? 'text-danger-color' : ''}">${amount} ${resInfo.name}</span>`;
                }).join(' ');
            }

            spellElement.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <strong class="text-secondary-color">${template.name}</strong>
                    <span class="text-xs px-1 py-0.5 bg-gray-600 rounded capitalize">${template.type}</span>
                </div>
                <p class="text-sm text-gray-400 mb-2">${template.description}</p>
                <div class="flex flex-wrap items-center mb-2">${costString}</div>
                ${template.type === 'utility' ? `
                <button class="btn btn-sm ${!canCast ? 'btn-disabled' : 'btn-primary'}" data-spell-id="${template.id}" ${!canCast ? 'disabled' : ''}>
                    Cast <i class="fas fa-wand-magic-sparkles ml-1"></i>
                </button>` : '<p class="text-xs text-gray-500 italic">(Combat Spell)</p>'}
             `;
            if (template.type === 'utility') {
                const button = spellElement.querySelector('button');
                if (button && canCast) {
                    button.addEventListener('click', () => castUtilitySpell(template));
                }
            }
            list.appendChild(spellElement);
        }
    });
    elements.spellsContainer.appendChild(list);
}

function castUtilitySpell(template) {
    // Check mana cost again
    if (gameState.player.mana < (template.cost?.mana || 0)) {
        showNotification('Insufficient Mana', 'Not enough personal mana to cast.', 'warning');
        return;
    }
    // Check resource costs
    for (const [res, amount] of Object.entries(template.cost || {})) {
        if (res !== 'mana' && gameState.resources[res] < amount) {
            showNotification('Insufficient Resources', `Requires ${amount} ${getResourceInfo(res).name}.`, 'warning');
            return;
        }
    }

    // Deduct costs
    gameState.player.mana -= (template.cost?.mana || 0);
    for (const [res, amount] of Object.entries(template.cost || {})) {
        if (res !== 'mana') gameState.resources[res] -= amount;
    }

    logEvent(`You cast ${template.name}.`, 'player');
    playSound('focus_mana'); // Placeholder cast sound

    // Execute specific spell action
    if (template.action && typeof window[template.action] === 'function') {
        window[template.action](template); // Call function by name
    } else {
        showNotification('Fizzle', 'The spell dissipates with no apparent effect.', 'info');
    }

    updateUI(); // Refresh UI after casting
}

// Specific Utility Spell Actions (Examples)
function castMinorIllumination(template) {
    logEvent("A soft light briefly pushes back the shadows.", "info");
    // Could add a temporary visual effect later
}

function castDetectEssence(template) {
    logEvent("Your senses expand, briefly detecting nearby energy signatures.", "info");
    // Add temporary visual indicator to map cells with resources? Needs map rendering enhancement.
    // Example: Add temporary class to map cells
    elements.mapGrid.querySelectorAll('.map-cell').forEach(cell => {
         // Logic to get cell coords from element or data attribute needed here
         // If cell coords match a location with resources, add a temp class like 'essence-detected'
    });
    // Set timeout to remove the class after a few seconds
}

function castMendFocus(template) {
    const healAmount = 10; // Example fixed amount
    gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + healAmount);
    logEvent(`Arcane energy flows inward, mending your focus (+${healAmount} Integrity).`, 'success');
    spawnDamageText(-healAmount, elements.mainGame); // Use negative for heal text
}

// --- Research System --- (NEW SECTION)

const researchTemplates = [
    {
        id: 'basic_runic_sight', name: 'Basic Runic Sight', description: 'Understand the fundamental flow of mana, revealing basic infusion patterns.',
        cost: { mana_motes: 25, ether_wisps: 5 }, duration: 60, // 60 ticks = 1 minute default
        unlocks: { infusion: ['glowstone_shard', 'mana_flask_lesser'] }, requires: {} // No base requirement
    },
    {
        id: 'nexus_stabilization_1', name: 'Nexus Stabilization I', description: 'Reinforce the Nexus core, allowing for more complex constructs.',
        cost: { infused_stone: 30, crystal_shards: 10 }, duration: 90,
        unlocks: { allowsConstruct: ['arcane_workbench', 'aetheric_condenser'] }, requires: { research: ['basic_runic_sight'] }
    },
     {
        id: 'combat_focus_1', name: 'Combat Focus I', description: 'Learn to channel raw power into damaging bolts.',
        cost: { mana_motes: 50, soul_fragments: 1 }, duration: 120,
        unlocks: { spell: 'arcane_bolt' }, requires: { research: ['basic_runic_sight'] }
    },
    {
        id: 'aetheric_attunement', name: 'Aetheric Attunement', description: 'Understand how to safely draw Ether Wisps, enabling gatherers.',
        cost: { ether_wisps: 30 }, duration: 75,
        unlocks: { allowsWorker: ['wisp_gatherer'] }, requires: { research: ['nexus_stabilization_1'] }
    },
     {
        id: 'void_mapping', name: 'Void Mapping', description: 'Develop senses to perceive adjacent void loci.',
        cost: { mana_motes: 40, starlight_essence: 1 }, duration: 150,
        unlocks: { mapAbility: 'discover_adjacent' }, requires: { research: ['basic_runic_sight'] } // Example research link
     },
    // Add more research linking constructs, workers, spells, map abilities, resource storage etc.
];

// Add research state to gameState
gameState.research = {
    activeResearch: null, // { id: researchId, progress: 0, required: X }
    completedResearch: [], // Array of completed research IDs
    availableResearch: [], // IDs of research projects whose requirements are met
};

function updateResearchAvailability() {
    gameState.research.availableResearch = researchTemplates
        .filter(template => !gameState.research.completedResearch.includes(template.id)) // Not already completed
        .filter(template => !gameState.research.activeResearch || gameState.research.activeResearch.id !== template.id) // Not currently researching
        .filter(template => { // Requirements met
            if (!template.requires) return true;
            // Check research prerequisites
            if (template.requires.research) {
                if (!template.requires.research.every(reqId => gameState.research.completedResearch.includes(reqId))) {
                    return false;
                }
            }
            // Check construct prerequisites
            if (template.requires.constructs) {
                 for (const [reqId, count] of Object.entries(template.requires.constructs)) {
                     if (gameState.constructs.filter(c => c.id === reqId).length < count) return false;
                 }
             }
             // Add storyline checks etc. if needed
             return true;
        })
        .map(template => template.id); // Return only the IDs
}

function updateResearchUI() {
    if (!elements.researchContainer) return;
    updateResearchAvailability(); // Recalculate available research first
    elements.researchContainer.innerHTML = ''; // Clear

    const container = document.createElement('div');
    container.className = 'space-y-4';

    // Display Active Research First
    if (gameState.research.activeResearch) {
        const activeId = gameState.research.activeResearch.id;
        const template = researchTemplates.find(t => t.id === activeId);
        if (template) {
            const progressPercent = (gameState.research.activeResearch.progress / gameState.research.activeResearch.required) * 100;
            const researchElement = document.createElement('div');
            researchElement.className = 'p-3 border border-dashed border-primary-color rounded bg-black bg-opacity-10';
             let costString = Object.entries(template.cost).map(([res, amount]) => `<span class="text-xs mr-2">${amount} ${getResourceInfo(res).name}</span>`).join(' ');

            researchElement.innerHTML = `
                <h4 class="font-semibold text-primary-color mb-1">${template.name} (In Progress)</h4>
                <p class="text-sm text-gray-400 mb-2">${template.description}</p>
                <div class="flex text-xs gap-2 mb-1"><span>Duration:</span><span>${template.duration} ticks</span></div>
                <div class="progress-container mb-2"><div class="progress-bar research" style="width: ${progressPercent}%"></div></div>
                <p class="text-xs text-gray-500">${gameState.research.activeResearch.progress}/${gameState.research.activeResearch.required} Progress</p>
                <!-- Maybe add a cancel button later -->
            `;
            container.appendChild(researchElement);
        }
    }

    // Display Available Research
     if (gameState.research.availableResearch.length > 0) {
        gameState.research.availableResearch.forEach(researchId => {
            const template = researchTemplates.find(t => t.id === researchId);
            if (template) {
                let canAfford = true;
                 let costString = Object.entries(template.cost).map(([res, amount]) => {
                     if (gameState.resources[res] < amount) canAfford = false;
                     return `<span class="text-xs mr-2 whitespace-nowrap ${gameState.resources[res] < amount ? 'text-danger-color' : ''}">${amount} ${getResourceInfo(res).name}</span>`;
                 }).join(' ');

                const researchElement = document.createElement('div');
                researchElement.className = 'p-3 border border-gray-700 rounded bg-black bg-opacity-10';
                researchElement.innerHTML = `
                    <h4 class="font-semibold text-secondary-color mb-1">${template.name}</h4>
                    <p class="text-sm text-gray-400 mb-2">${template.description}</p>
                    <div class="flex flex-wrap items-center mb-1">Cost: ${costString}</div>
                    <div class="flex text-xs gap-2 mb-2"><span>Duration:</span><span>${template.duration} ticks</span></div>
                    <button class="btn btn-sm ${!canAfford || gameState.research.activeResearch ? 'btn-disabled' : 'btn-success'}" data-research-id="${template.id}" ${!canAfford || gameState.research.activeResearch ? 'disabled' : ''}>
                        Begin Research
                    </button>
                 `;
                const button = researchElement.querySelector('button');
                 if (button && canAfford && !gameState.research.activeResearch) {
                     button.addEventListener('click', () => startResearch(template));
                 }
                container.appendChild(researchElement);
            }
        });
    } else if (!gameState.research.activeResearch) {
         container.innerHTML = '<p class="text-gray-400 italic">No new research avenues available currently.</p>';
     }


    // Display Completed Research (Optional - could be in Grimoire)
    // ... logic to list completed research ...

    elements.researchContainer.appendChild(container);
}

function startResearch(template) {
    // Double check cost & availability
     if (gameState.research.activeResearch) {
         showNotification('Research Busy', 'Already researching another project.', 'warning');
         return;
     }
     for (const [res, amount] of Object.entries(template.cost)) {
         if (gameState.resources[res] < amount) {
             showNotification('Insufficient Essence', `Requires ${amount} ${getResourceInfo(res).name}.`, 'warning');
             return;
         }
     }

     // Deduct cost
     for (const [res, amount] of Object.entries(template.cost)) {
         gameState.resources[res] -= amount;
     }

     // Start research
     gameState.research.activeResearch = {
         id: template.id,
         progress: 0,
         required: template.duration
     };

     logEvent(`Began researching ${template.name}.`, 'research'); // Use a type for styling?
     playSound('generic_click'); // Research start sound?
     updateResearchUI();
     updateResourcesDisplay();
}

function updateResearchProgress() {
    if (!gameState.research.activeResearch) return;

    const researchId = gameState.research.activeResearch.id;
    const template = researchTemplates.find(t => t.id === researchId);

    // Handle progress gain (e.g., base rate + bonus from Runescribes?)
    let progressGain = 1; // Base 1 progress per tick
    // Add potential bonus from workers like 'runescribe_initiate' here
    const runescribes = gameState.attunedSouls.find(s => s.id === 'runescribe_initiate');
    if (runescribes) {
        // Assuming runescribe 'produces' research_points directly applied here as bonus gain
        const researchPointTemplate = soulTemplates.find(st => st.id === 'runescribe_initiate');
        if (researchPointTemplate?.produces?.research_points) {
            progressGain += researchPointTemplate.produces.research_points * runescribes.count;
            // Also handle consumption for runescribes here if not done in updateResources
             if(researchPointTemplate.consumes) {
                 let canAfford = true;
                 for (const [res, rate] of Object.entries(researchPointTemplate.consumes)) {
                     const costPerTick = rate * runescribes.count / (1000 / gameState.tickInterval);
                     if (gameState.resources[res] < costPerTick) {
                         canAfford = false;
                         progressGain = 1; // Revert to base gain if cannot afford upkeep
                         // logEvent(`Runescribes lack ${res} to assist research.`, 'warning');
                         break;
                     }
                 }
                 if(canAfford) {
                     for (const [res, rate] of Object.entries(researchPointTemplate.consumes)) {
                         const costPerTick = rate * runescribes.count / (1000 / gameState.tickInterval);
                         gameState.resources[res] -= costPerTick;
                     }
                 }
             }
        }
    }


    gameState.research.activeResearch.progress += progressGain;

    // Check for completion
    if (gameState.research.activeResearch.progress >= gameState.research.activeResearch.required) {
        completeResearch(researchId, template);
    }
    // Update UI periodically even if not complete (progress bar)
    if(gameState.tick % 5 === 0) updateResearchUI(); // Update UI every 5 ticks during research
}

function completeResearch(researchId, template) {
    logEvent(`Research complete: ${template.name}!`, 'success');
    showNotification('Research Complete!', template.name, 'success');
    playSound('achievement'); // Or specific research complete sound

    gameState.research.completedResearch.push(researchId);
    gameState.research.activeResearch = null;

    // Apply unlocks
    if (template.unlocks) {
        if (template.unlocks.infusion) {
            // Add logic to make these infusions available (maybe a gameState.availableInfusions array?)
            logEvent(`New infusion patterns available: ${template.unlocks.infusion.join(', ')}`, 'unlock');
        }
        if (template.unlocks.spell) {
            if (!gameState.knownSpells.includes(template.unlocks.spell)) {
                 gameState.knownSpells.push(template.unlocks.spell);
                 logEvent(`Learned new spell: ${template.unlocks.spell}`, 'unlock');
                 updateSpellListUI(); // Update spell list now
            }
        }
        if (template.unlocks.allowsConstruct) {
            logEvent(`Can now manifest: ${template.unlocks.allowsConstruct.join(', ')}`, 'unlock');
            updateConstructOptions(); // Update available constructs
        }
         if (template.unlocks.allowsWorker) {
             logEvent(`New attunement possible: ${template.unlocks.allowsWorker.join(', ')}`, 'unlock');
             updateAttunementOptions(); // Update available workers
         }
        if (template.unlocks.mapAbility) {
            // Set a flag in gameState or directly enable functionality
            gameState.exploration[template.unlocks.mapAbility] = true; // Example: gameState.exploration.discover_adjacent = true;
            logEvent(`Gained map ability: ${template.unlocks.mapAbility}`, 'unlock');
        }
        // Add unlocks for passive bonuses etc.
    }

    updateResearchUI(); // Refresh research UI
    // Potentially update other UI elements if unlocks affect them
}

// --- Exploration & Map Logic ---
// ... initializeMap (no changes needed from prev step) ...
// ... toggleMap ...
// ... renderMap (no changes needed from prev step) ...
// ... explore (no changes needed from prev step) ...
// ... markCurrentLocationVisited (no changes needed from prev step) ...
// ... findEssence ...
// ... discoverLocus (Maybe use gameState.exploration.discover_adjacent flag later)...
// ... encounterEntity ...
// ... movePlayer ...
// ... interactWithPOI ...
// ... updateExplorationStatus ...
// ... returnToNexus ...

// --- Combat Logic ---
// Modify combat actions to allow spell casting
function handleCombatAction(event) {
     if (!event.target.closest('button[data-action]')) return;
     const action = event.target.closest('button[data-action]').dataset.action;

     if (!gameState.exploration.inCombat || !gameState.exploration.currentEnemy) return;

     let playerActed = false; // Flag to check if enemy turn should proceed

     switch (action) {
         case 'attack':
             playerAttack();
             playerActed = true;
             break;
         case 'defend':
             playerDefend();
             playerActed = true;
             break;
         case 'spell':
             // Simple approach: Cast the *first* available combat spell for now
             // TODO: Implement spell selection UI during combat
             const combatSpell = gameState.knownSpells
                 .map(id => spellTemplates.find(s => s.id === id))
                 .find(s => s && s.type === 'combat' && s.target === 'enemy' && gameState.player.mana >= (s.cost?.mana || 0)); // Find first usable offensive spell

             if (combatSpell) {
                 playerCastCombatSpell(combatSpell);
                 playerActed = true;
             } else {
                 showNotification("No Spell Ready", "No suitable combat spell known or insufficient mana.", "warning");
                 // Player didn't act, don't trigger enemy turn yet
             }
             break;
         case 'item':
             showNotification("Use Conduit", "Item/Conduit usage not yet implemented.", "info");
             // playerActed = true; // Set to true once implemented
             break;
         case 'flee':
             attemptFlee(); // Flee attempt counts as an action
             playerActed = true;
             break;
     }

    // If player action was valid and combat didn't end, trigger enemy turn
    if(playerActed && gameState.exploration.inCombat) {
        setTimeout(enemyTurn, 600); // Slightly longer delay for readability
    }
}

function playerCastCombatSpell(template) {
    const enemy = gameState.exploration.currentEnemy;
    // Double check cost
    if (gameState.player.mana < (template.cost?.mana || 0)) {
        logCombat(`Tried to cast ${template.name}, but lacked mana!`, 'warning');
        return; // Don't proceed
    }
     // Check resource costs (e.g., soul fragments for Flame Lash)
     for (const [res, amount] of Object.entries(template.cost || {})) {
         if (res !== 'mana' && gameState.resources[res] < amount) {
             logCombat(`Tried to cast ${template.name}, but lacked ${getResourceInfo(res).name}!`, 'warning');
             return; // Don't proceed
         }
     }

     // Deduct costs
    gameState.player.mana -= (template.cost?.mana || 0);
     for (const [res, amount] of Object.entries(template.cost || {})) {
         if (res !== 'mana') gameState.resources[res] -= amount;
     }


    logCombat(`You cast ${template.name}!`, 'player');
    playSound('spell_cast_bolt'); // Need varied spell sounds

    // Apply Effects
    if (template.effects.damage) {
         const playerPower = gameState.player.spellPower + (gameState.player.focus?.effects?.spellPower || 0);
         // Spells might have their own base power independent of player stats, or add to it
         const spellBaseDamage = template.effects.damage || 0;
         const damage = Math.max(1, spellBaseDamage + playerPower/2 - (enemy.defense || 0) + rollDamageVariance(spellBaseDamage)); // Example: Spell dmg + half player power
        enemy.health -= damage;
        logCombat(`The spell hits ${enemy.name} for ${damage} damage.`, 'player');
        spawnDamageText(damage, elements.combatEnemyContainer);
    }
    if (template.effects.addStatus) {
        // Apply status effect to target (enemy or self)
        // Need status effect handling logic on player/enemy objects and in tick updates
         logCombat(`${enemy.name} is afflicted with ${template.effects.addStatus.id}!`, 'info'); // Placeholder
    }
    // Add effects for healing, buffs, debuffs etc.

    checkCombatEnd();
}


// --- Achievements ---
// ... unlockAchievement, updateAchievementsDisplay ...

// --- Modals & Focus Management --- (Accessibility)
let focusedElementBeforeModal = null;

 function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
         // Store element that had focus before opening modal
         focusedElementBeforeModal = document.activeElement;

        // ... update modal content ...

        modal.classList.add('show');
         playSound('generic_click');

        // Move focus to the modal container or first focusable element inside
         const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
         if (focusableElements.length > 0) {
            focusableElements[0].focus();
         } else {
             modal.querySelector('.modal-content').setAttribute('tabindex', '-1'); // Make content focusable if nothing else is
             modal.querySelector('.modal-content').focus();
         }

         // Add keydown listener for focus trapping
         modal.addEventListener('keydown', trapFocusInModal);
     }
 }
 function closeModal() {
     document.querySelectorAll('.modal-backdrop.show').forEach(modal => {
         modal.classList.remove('show');
         // Remove focus trapping listener
         modal.removeEventListener('keydown', trapFocusInModal);
     });
     playSound('generic_click');

     // Return focus to the element that had it before modal opened
     if (focusedElementBeforeModal) {
         focusedElementBeforeModal.focus();
         focusedElementBeforeModal = null;
     }
 }

 function trapFocusInModal(event) {
    if (event.key !== 'Tab') return;

    const modal = event.currentTarget; // The modal backdrop
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
        }
    } else { // Tab
        if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
        }
    }
}

// ... rest of modal open functions ...

// --- Settings ---
function loadSettings() {
     // ... existing loadSettings ...
     applySettings(); // Apply loaded settings to UI controls and game (includes theme)
 }

// saveSettings remains the same

function updateSettings(event) {
     const settingId = event.target.id;
     const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

     switch(settingId) {
         case 'setting-theme':
             gameState.settings.theme = value;
             applyTheme(); // Apply theme immediately
             break;
         case 'toggle-sound-effects': gameState.settings.soundEffects = value; break;
         case 'toggle-music':
             // ... existing music toggle logic ...
             break;
         case 'toggle-high-contrast':
             gameState.settings.highContrast = value;
             document.body.classList.toggle('high-contrast', value);
             break;
         // ... rest of settings cases ...
    }
     saveSettings();
}

// updateVolume remains the same

function applySettings() {
    // Update UI controls
    elements.settingTheme.value = gameState.settings.theme; // Set dropdown value
    elements.toggleSoundEffects.checked = gameState.settings.soundEffects;
    // ... update other controls ...
    elements.toggleHighContrast.checked = gameState.settings.highContrast;
    // ... update other controls ...

    // Apply visual/audio settings
    applyTheme(); // Apply light/dark/system theme
    document.body.classList.toggle('high-contrast', gameState.settings.highContrast);
     // ... music logic ...
 }

 function applyTheme() {
    const body = document.body;
    const theme = gameState.settings.theme;
    body.classList.remove('light-theme', 'dark-theme'); // Remove existing theme classes

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            body.classList.add('dark-theme'); // Assuming default is dark or create specific dark-theme class
        } else {
            body.classList.add('light-theme');
        }
    } else if (theme === 'light') {
        body.classList.add('light-theme');
    } else {
         body.classList.add('dark-theme'); // Default to dark
    }
 }

 // Add listener for system theme changes if 'system' is selected
 window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (gameState.settings.theme === 'system') {
        applyTheme();
    }
 });


// --- Save/Load ---
// ... existing save/load using constants ...

// --- Game Lifecycle ---
// ... restartGame, gameOver ...

// --- Utility Functions ---
function switchTab(tabId) {
     elements.tabButtons.forEach(btn => {
        const isSelected = btn.dataset.tab === tabId;
         btn.classList.toggle('active', isSelected);
         btn.setAttribute('aria-selected', isSelected); // ARIA update
         btn.setAttribute('tabindex', isSelected ? '0' : '-1'); // Manage tab focus
     });
     elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
        content.hidden = (content.id !== `tab-${tabId}`); // More explicit hiding
     });
     if (tabId === 'exploration') renderMap();
 }

// ... handleKeyPress ...

 // --- Initial Load ---
 document.addEventListener('DOMContentLoaded', initGame); 