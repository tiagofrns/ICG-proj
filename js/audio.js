// audio.js
const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx;
const soundBuffers = {};

// Caminhos locais apontando para a tua pasta "audios/"
const SOUND_URLS = {
    pickup:   './audios/item_pickup.mp3',   
    knead:    './audios/squish.mp3',
    ovenIn:   './audios/oven-door.mp3',
    ovenDing: './audios/oven-timer-complete.mp3',
    coin:     './audios/cash.mp3',
    angry:    './audios/angry.mp3',
    bgm:      './audios/cafe-ambience-sound.mp3'
};

async function loadSound(name, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Ficheiro não encontrado: ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        soundBuffers[name] = await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error(`❌ Erro crítico ao carregar som local [${name}] em ${url}:`, e);
    }
}

export async function initAudio() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    // Carrega todos os ficheiros locais em paralelo e aguarda a conclusão
    const promises = Object.entries(SOUND_URLS).map(([name, url]) => loadSound(name, url));
    await Promise.all(promises);
    
    startBGM();
}

function playBuffer(name, vol = 0.4, speed = 1.0) {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    if (soundBuffers[name]) {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = soundBuffers[name];
        source.playbackRate.value = speed;
        gain.gain.value = vol;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
    } else {
        console.warn(`⚠️ Tentativa de tocar som "${name}" mas o buffer está vazio.`);
    }
}

export const sfx = {
    pickup:   () => playBuffer('pickup', 0.35),
    knead:    () => playBuffer('knead', 0.45),
    ovenIn:   () => playBuffer('ovenIn', 0.4, 3.0),
    ovenDing: () => playBuffer('ovenDing', 0.55),
    coin:     () => playBuffer('coin', 0.5),
    angry:    () => playBuffer('angry', 0.4)
};

function startBGM() {
    if (!soundBuffers['bgm'] || !ctx) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = soundBuffers['bgm'];
    source.loop = true;
    gain.gain.value = 0.15; // Volume de fundo suave
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
}