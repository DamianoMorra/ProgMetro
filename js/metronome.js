let interval = null;
const status = document.getElementById('status');
const volumeSlider = document.getElementById('volume');
const volumeValue = document.getElementById('volumeValue');
const trackAudio = document.getElementById('track');
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
    const repeatingBars = parseInt(repeatingBarsInput.value);
    barsInCurrentPhase++;

    if (barsInCurrentPhase >= repeatingBars) {
        barsInCurrentPhase = 0;
        if (isIncreasing) {
            currentBpm += parseInt(bpmIncreaseInput.value);
        } else {
            currentBpm -= parseInt(bpmDecreaseInput.value);
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
    
    // Update bar counter and BPM
    document.getElementById('barCount').textContent = `Bar: ${barNumber} (${currentBpm} BPM)`;

    // Play audio only on first beat of the bar
    if (beatCount === 1) {
        trackAudio.volume = volumeSlider.value / 100;
        trackAudio.currentTime = 0;
        trackAudio.playbackRate = currentBpm / 100;  // Usa il BPM corrente invece di quello iniziale
        trackAudio.play();
    }
}

document.getElementById('start').addEventListener('click', function() {
    const startingBpm = parseInt(bpmInput.value);
    if (startingBpm < 30 || startingBpm > 300) {
        status.textContent = 'BPM must be between 30 and 300';
        return;
    }
    
    // Reset state
    if (interval) clearInterval(interval);
    beatCount = 0;
    barNumber = 1;  // Inizia da 1
    currentBpm = startingBpm;
    isIncreasing = true;
    barsInCurrentPhase = 0;
    document.getElementById('barCount').textContent = 'Bar: 1';
    
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
    document.getElementById('barCount').textContent = 'Bar: 0';  // Reset to 0 when si preme stop
    
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
