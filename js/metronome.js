let interval = null;
const status = document.getElementById('status');
const volumeSlider = document.getElementById('volume');
const volumeValue = document.getElementById('volumeValue');
const trackAudio = document.getElementById('track');
let beatCount = 0;
let barNumber = 0;

volumeSlider.oninput = function() {
    volumeValue.textContent = volumeSlider.value;
};

function metronomeTick() {
    beatCount++;
    if (beatCount > 4) {
        beatCount = 1;
        barNumber++;
    }

    // Update circles
    const circles = document.querySelectorAll('.circle');
    circles.forEach(circle => circle.style.background = '#ccc');
    document.getElementById('circle' + beatCount).style.background = '#4caf50';
    
    // Update bar counter
    document.getElementById('barCount').textContent = 'Bar: ' + barNumber;

    // Play audio only on first beat of the bar
    if (beatCount === 1) {
        trackAudio.volume = volumeSlider.value / 100;
        trackAudio.currentTime = 0;
        const bpm = parseInt(document.getElementById('bpm').value);
        trackAudio.playbackRate = bpm / 100;
        trackAudio.play();
    }
}

document.getElementById('start').addEventListener('click', function() {
    const bpm = parseInt(document.getElementById('bpm').value);
    if (bpm < 30 || bpm > 300) {
        status.textContent = 'BPM must be between 30 and 300';
        return;
    }
    
    // Reset state
    if (interval) clearInterval(interval);
    beatCount = 0;
    barNumber = 1;  // Inizia da 1
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
    interval = setInterval(metronomeTick, (60 / bpm) * 1000);
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
