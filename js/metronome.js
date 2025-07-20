let interval = null;
const status = document.getElementById('status');
const volumeSlider = document.getElementById('volume');
const volumeValue = document.getElementById('volumeValue');
const trackAudio = document.getElementById('track');

// Preload audio
trackAudio.load();
trackAudio.volume = volumeSlider.value / 100;

// Update HTML input constraints and default values
function updateInputConstraints() {
    // Volume initialization
    const volumeInput = document.getElementById('volume');
    volumeInput.min = CONSTRAINTS.VOLUME.min;
    volumeInput.max = CONSTRAINTS.VOLUME.max;
    volumeInput.value = CONSTRAINTS.VOLUME.default;
    
    const volumeValueInput = document.getElementById('volumeValue');
    volumeValueInput.min = CONSTRAINTS.VOLUME.min;
    volumeValueInput.max = CONSTRAINTS.VOLUME.max;
    volumeValueInput.value = CONSTRAINTS.VOLUME.default;

    // Other inputs initialization
    const inputsConfig = {
        'bpm': { constraint: CONSTRAINTS.BPM, defaultValue: CONSTRAINTS.BPM.default },
        'repeatingBars': { constraint: CONSTRAINTS.BARS, defaultValue: CONSTRAINTS.BARS.default },
        'bpmIncrease': { constraint: CONSTRAINTS.BPM_CHANGE, defaultValue: CONSTRAINTS.BPM_CHANGE.increase_default },
        'bpmDecrease': { constraint: CONSTRAINTS.BPM_CHANGE, defaultValue: CONSTRAINTS.BPM_CHANGE.decrease_default }
    };

    for (const [id, config] of Object.entries(inputsConfig)) {
        const input = document.getElementById(id);
        input.min = config.constraint.min;
        input.max = config.constraint.max;
        input.value = config.defaultValue;
        const hint = input.nextElementSibling;
        if (hint && hint.classList.contains('range-hint')) {
            hint.textContent = `[${config.constraint.min}, ${config.constraint.max}]`;
        }
    }
}

updateInputConstraints();
let beatCount = 0;
let barNumber = 0;
let currentBpm = 0;
let isIncreasing = true;  // Alternare tra aumento e diminuzione
let barsInCurrentPhase = 0;  // Contatore per le battute nella fase corrente

// Input elements
const bpmInput = document.getElementById('bpm');
const repeatingBarsInput = document.getElementById('repeatingBars');
const bpmIncreaseInput = document.getElementById('bpmIncrease');
const bpmDecreaseInput = document.getElementById('bpmDecrease');

// Input validation functions
function validateInput(input, min, max) {
    let value = input.value.replace(/[eE]/g, ''); // Rimuove tutte le 'e' o 'E'
    value = parseInt(value) || min; // Se il parsing fallisce, usa il valore minimo
    if (isNaN(value)) value = min;
    if (value < min) value = min;
    if (value > max) value = max;
    input.value = value;
    return value;
}

// Add validation to all numeric inputs
function addInputValidation(input, min, max) {
    input.onchange = function() { validateInput(this, min, max); };
}

addInputValidation(bpmInput, CONSTRAINTS.BPM.min, CONSTRAINTS.BPM.max);
addInputValidation(repeatingBarsInput, CONSTRAINTS.BARS.min, CONSTRAINTS.BARS.max);
addInputValidation(bpmIncreaseInput, CONSTRAINTS.BPM_CHANGE.min, CONSTRAINTS.BPM_CHANGE.max);
addInputValidation(bpmDecreaseInput, CONSTRAINTS.BPM_CHANGE.min, CONSTRAINTS.BPM_CHANGE.max);

// Sync volume slider and input
volumeSlider.oninput = function() {
    volumeValue.value = this.value;
    trackAudio.volume = this.value / 100;
};

volumeValue.onchange = function() {
    // Ensure the value is within bounds
    if (this.value > 100) this.value = 100;
    if (this.value < 0) this.value = 0;
    
    volumeSlider.value = this.value;
    trackAudio.volume = this.value / 100;
};

function updateBpm() {
    const repeatingBars = validateInput(repeatingBarsInput, 1, 10);
    barsInCurrentPhase++;

    if (barsInCurrentPhase >= repeatingBars) {
        barsInCurrentPhase = 0;
        if (isIncreasing) {
            currentBpm += validateInput(bpmIncreaseInput, 1, 10);
            currentBpm = Math.min(currentBpm, CONSTRAINTS.BPM.max); // Assicura che non superi il massimo BPM
        } else {
            currentBpm -= validateInput(bpmDecreaseInput, CONSTRAINTS.BPM_CHANGE.min, CONSTRAINTS.BPM_CHANGE.max);
            currentBpm = Math.max(currentBpm, CONSTRAINTS.BPM.min);  // Assicura che non scenda sotto il minimo BPM
        }
        isIncreasing = !isIncreasing;  // Alterna tra aumento e diminuzione

        // Aggiorna l'intervallo con il nuovo BPM
        clearInterval(interval);
        interval = setInterval(metronomeTick, (60 / currentBpm) * 1000);
    }
}

function metronomeTick() {
    beatCount++;
    if (beatCount > 4) {
        beatCount = 1;
        barNumber++;
        updateBpm();
    }

    // Update circles
    const circles = document.querySelectorAll('.circle');
    circles.forEach(circle => circle.style.background = '#ccc');
    document.getElementById('circle' + beatCount).style.background = '#4caf50';
    
    // Update bar counter and BPM display
    document.getElementById('barCount').textContent = `Bar: ${barNumber}`;
    document.getElementById('currentBpmDisplay').textContent = `BPM: ${currentBpm}`;

    // Play audio only on first beat of the bar
    if (beatCount === 1) {
        trackAudio.volume = volumeSlider.value / 100;
        trackAudio.currentTime = 0;
        trackAudio.playbackRate = currentBpm / 100;  // Usa il BPM corrente invece di quello iniziale
        trackAudio.play();
    }
}

document.getElementById('start').addEventListener('click', function() {
    const startingBpm = validateInput(bpmInput, 30, 300);
    status.textContent = '';
    
    // Reset state
    if (interval) clearInterval(interval);
    beatCount = 0;
    barNumber = 1;  // Inizia da 1
    currentBpm = startingBpm;
    isIncreasing = true;
    barsInCurrentPhase = 0;
    document.getElementById('barCount').textContent = 'Bar: 1';
    document.getElementById('currentBpmDisplay').textContent = `BPM: ${currentBpm}`;
    
    // Update button styles
    this.style.background = '#4caf50';
    this.style.color = '#fff';
    this.disabled = true;
    const stopBtn = document.getElementById('stop');
    stopBtn.disabled = false;
    stopBtn.style.color = '#000';
    
    // Start metronome
    metronomeTick();
    interval = setInterval(metronomeTick, (60 / currentBpm) * 1000);
    status.textContent = '';
});

document.getElementById('stop').addEventListener('click', function() {
    // Clear interval and reset audio
    clearInterval(interval);
    interval = null;
    trackAudio.pause();
    trackAudio.currentTime = 0;

    // Reset UI state
    document.getElementById('start').disabled = false;
    this.disabled = true;
    const circles = document.querySelectorAll('.circle');
    circles.forEach(circle => circle.style.background = '#ccc');
    
    // Reset counters
    beatCount = 0;
    barNumber = 0;
    currentBpm = parseInt(bpmInput.value);
    document.getElementById('barCount').textContent = 'Bar: 0';  // Reset to 0 when si preme stop
    document.getElementById('currentBpmDisplay').textContent = `BPM: ${currentBpm}`;
    
    // Reset button styles
    document.getElementById('start').style.background = '#eee';
    document.getElementById('start').style.color = '#000';
    
    // Flash stop button
    this.style.background = '#4caf50';
    this.style.color = '#fff';
    setTimeout(() => {
        this.style.background = '#eee';
        this.style.color = '#888';
    }, 50);
});
