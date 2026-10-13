// --- KONFIGURASI DATA ---
const spotifyList = [
    { title: "", link:"https://open.spotify.com/embed/playlist/7djnrHl8QnKaKmNH76TdQm?utm_source=generator"}, 
  
    { title: "", link: "https://open.spotify.com/embed/artist/5vjmcREJLxyDVkcb0KjNz9?si=UfRduBjiT8qm_DW6T-RTAg&utm_source=copy-link" }, 
    { title: "", link: "https://open.spotify.com/embed/artist/51kyrUsAVqUBcoDEMFkX12?si=nEiMt23ASfyGlCd85hr_9w" }

  
];

const photos = [
    { src: "1.jpeg", caption: "" },
    { src: "2.jpeg", caption: "" },
    { src: "3.jpeg", caption: "" },
    { src: "4.jpeg", caption: "" },
];

// Surat untuk fitur Typing Effect (Versi Ucapan Sidang Munaqosah)
const letterText = `Ciee S E! \nIndri Febriani 👋✨\n\nSelamat atas  keberhasilannya dalam melewati sidang munaqosah! 🎓🎉\n\nSemoga ilmu yang didapatkan berkah, bermanfaat bagi banyak orang, dan menjadi awal dari kesuksesan di masa depan.\n\nDattebayo\n`;

// --- SOUND EFFECT ENGINE (Tanpa File MP3) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq = 440, type = 'square', duration = 0.1) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime); 
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function sfxSelect() { playTone(660, 'sine', 0.1); } 
function sfxConfirm() { playTone(880, 'square', 0.15); } 
function sfxBack() { playTone(330, 'square', 0.15); } 

// --- SYSTEM VARIABLES ---
let state = "BOOT"; 
let menuIdx = 0;
let photoIdx = 0;
let musicIdx = 0;
let gameInterval; 
let blinkInterval = null;
let currentConsoleMood = "default";
const moods = ['default', 'love', 'happy', 'shocked', 'sleepy'];

// --- DOM ELEMENTS ---
const bmoScreen = document.getElementById('bmo-screen');
const menuScreen = document.getElementById('menu-screen');
const appScreen = document.getElementById('app-screen');
const menuItems = document.querySelectorAll('.menu-item');

// --- BOOT SEQUENCE ---
window.onload = function() {
    playTone(1200, 'sine', 0.1); 
    setTimeout(() => {
        playTone(2000, 'square', 0.5); 
        document.getElementById('boot-screen').style.display = 'none';
        
        // Langsung masuk ke Layar Utama BMO
        state = "BMO";
        initBmoBlink();

        // Menyapa otomatis lewat suara TTS saat pertama masuk
        setTimeout(() => {
            speakText("Selamat atas sidang munaqosahnya Indri Febriani!");
        }, 300);
    }, 2500); 
};

// --- INPUT CONTROLLER ---
function input(key) {
    if (state === "BOOT") return; 
    if (navigator.vibrate) navigator.vibrate(10); 

    if (key === "A") sfxConfirm();
    else if (key === "B") sfxBack();
    else sfxSelect();

    if (state === "BMO") handleBmoInput(key);
    else if (state === "MENU") handleMenu(key);
    else if (state === "LETTER") handleLetter(key);
    else if (state === "GALLERY") handleGallery(key);
    else if (state === "MUSIC") handleMusic(key);
    else if (state === "GAME") handleGame(key);
}

// --- 1. KONTROL BMO EKSPRESI (LAYAR UTAMA) ---
function handleBmoInput(key) {
    if (key === "LEFT") {
        let prevIndex = (moods.indexOf(currentConsoleMood) - 1 + moods.length) % moods.length;
        setConsoleMood(moods[prevIndex]);
    }
    if (key === "RIGHT") {
        let nextIndex = (moods.indexOf(currentConsoleMood) + 1) % moods.length;
        setConsoleMood(moods[nextIndex]);
    }
    if (key === "A") {
        // Pindah dari BMO ke Menu Utama
        bmoScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
        state = "MENU";
        updateMenuUI();
    }
}

function handleFaceClick() {
    let nextIndex = (moods.indexOf(currentConsoleMood) + 1) % moods.length;
    setConsoleMood(moods[nextIndex]);
}

function setConsoleMood(mood) {
    currentConsoleMood = mood;
    const screen = document.getElementById('console-screen');
    if (!screen) return;
    
    moods.forEach(m => screen.classList.remove(`exp-${m}`));
    
    if (mood !== 'default') {
        screen.classList.add(`exp-${mood}`);
    }

    // Suara ucapan otomatis tiap ganti mood ekspresi
    if (mood === 'default') {
        speakText("Selamat atas sidang munaqosahnya Indri Febriani!");
    } else if (mood === 'love') {
        speakText("Proud of you, Indri Kamu luar biasa!");
    } else if (mood === 'happy') {
        speakText("Indri Febriani hebat banget, akhirnya resmi lulus!");
    } else if (mood === 'shocked') {
        speakText("Selamat dan sukses untuk gelar barunya, Indri Febriani!");
    } else if (mood === 'sleepy') {
        speakText("Akhirnya selesai sidang! Login efef indri!");
    }
}

function initBmoBlink() {
    if (blinkInterval) clearInterval(blinkInterval);
    blinkInterval = setInterval(() => {
        if (state === "BMO" && currentConsoleMood === "default") {
            const eyeL = document.getElementById('eye-left');
            const eyeR = document.getElementById('eye-right');
            if (eyeL && eyeR) {
                eyeL.classList.add('blink');
                eyeR.classList.add('blink');
                setTimeout(() => {
                    eyeL.classList.remove('blink');
                    eyeR.classList.remove('blink');
                }, 200);
            }
        }
    }, 3800);
}

// Speech Synthesis (Suara BMO)
function speakText(text) {
    if (!text) return;
    startTalking();

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.pitch = 1.3;
        utterance.rate = 1.0;
        
        utterance.onend = () => stopTalking();
        utterance.onerror = () => stopTalking();
        
        window.speechSynthesis.speak(utterance);
    } else {
        setTimeout(stopTalking, 1500);
    }
}

function startTalking() {
    const mouth = document.getElementById('bmo-mouth');
    if (mouth) mouth.classList.add('talking');
}

function stopTalking() {
    const mouth = document.getElementById('bmo-mouth');
    if (mouth) mouth.classList.remove('talking');
}

// --- 2. MENU LOGIC ---
function handleMenu(key) {
    const totalMenu = menuItems.length;
    if (key === "DOWN") { menuIdx = (menuIdx + 1) % totalMenu; updateMenuUI(); }
    if (key === "UP") { menuIdx = (menuIdx - 1 + totalMenu) % totalMenu; updateMenuUI(); }
    if (key === "A") openApp(menuIdx);
    if (key === "B") backToBmo();
}

function updateMenuUI() {
    menuItems.forEach((item, index) => {
        if (index === menuIdx) {
            item.classList.add('selected');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

function openApp(index) {
    menuScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    appScreen.classList.remove('gallery-mode');
    appScreen.scrollTop = 0;

    if (index === 0) loadLetter();
    if (index === 1) loadGallery();
    if (index === 2) loadMusic();
    if (index === 3) initGame();
}

function backToMenu() {
    if (state === "GAME") clearInterval(gameInterval);
    state = "MENU";
    appScreen.innerHTML = "";
    appScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

function backToBmo() {
    menuScreen.classList.add('hidden');
    bmoScreen.classList.remove('hidden');
    state = "BMO";
}

// --- 3. SURAT ---
function loadLetter() {
    state = "LETTER";
    appScreen.innerHTML = `<div class="scroll-text"><span id="typing-content"></span><span class="cursor"></span></div>`;
    typeWriter(letterText, "typing-content");
}

function typeWriter(text, elementId, i = 0) {
    if (state !== "LETTER") return; 
    if (i < text.length) {
        document.getElementById(elementId).textContent += text.charAt(i);
        document.getElementById('app-screen').scrollTop = document.getElementById('app-screen').scrollHeight;
        setTimeout(() => typeWriter(text, elementId, i + 1), 35 ); 
    } else {
        document.querySelector('.cursor').style.display = 'none'; 
    }
}

function handleLetter(key) {
    const screen = document.getElementById('app-screen');
    if (key === "DOWN") screen.scrollBy({ top: 50, behavior: 'smooth' });
    if (key === "UP") screen.scrollBy({ top: -50, behavior: 'smooth' });
    if (key === "B") backToMenu();
}

// --- 4. GALERI ---
function loadGallery() {
    state = "GALLERY";
    photoIdx = 0;
    appScreen.classList.add('gallery-mode');
    renderPhoto();
}

function renderPhoto() {
    const p = photos[photoIdx];
    appScreen.innerHTML = `
        <img src="${p.src}" class="gallery-full-img">
        <div class="gallery-caption-overlay">${p.caption} <br> <small style="font-size:10px">(Kiri/Kanan)</small></div>
    `;
}

function handleGallery(key) {
    if (key === "RIGHT") { photoIdx = (photoIdx + 1) % photos.length; renderPhoto(); }
    if (key === "LEFT") { photoIdx = (photoIdx - 1 + photos.length) % photos.length; renderPhoto(); }
    if (key === "B") backToMenu();
}

// --- 5. MUSIK ---
function loadMusic() {
    state = "MUSIC";
    renderMusicUI();
}

function renderMusicUI() {
    const song = spotifyList[musicIdx];
    appScreen.innerHTML = `
        <div class="music-container" style="padding: 10px; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <h3 style="font-size:12px; margin-bottom:10px; color:#555; text-align:center;">${song.title}</h3>
            
            <iframe style="border-radius:12px" 
                src="${song.link}" 
                width="100%" 
                height="152" 
                frameBorder="0" 
                allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
            </iframe>

            <p style="font-size:9px; margin-top:10px; color:#aaa; text-align:center;">
                (Ganti Lagu: Atas/Bawah)
            </p>
        </div>
    `;
}

function handleMusic(key) {
    if (key === "RIGHT" || key === "UP") { 
        musicIdx = (musicIdx + 1) % spotifyList.length; 
        renderMusicUI(); 
    }
    if (key === "LEFT" || key === "DOWN") { 
        musicIdx = (musicIdx - 1 + spotifyList.length) % spotifyList.length; 
        renderMusicUI(); 
    }
    if (key === "B") backToMenu();
}

// --- 6. GAME TETRIS ---
let board, score, currentPiece;
const ROWS = 15, COLS = 10;
const COLORS = [null, '#0984e3', '#fdcb6e', '#00b894', '#6c5ce7', '#d63031', '#e17055', '#636e72'];

function initGame() {
    state = "GAME";
    score = 0;
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    appScreen.innerHTML = `
        <div style="position:relative; width:100%; height:100%; background:#2d3436; display:flex; justify-content:center; align-items:center;">
            <canvas id="tetris" width="150" height="225" style="background:#000; display:block;"></canvas>
            <div style="position:absolute; top:5px; left:10px; color:white; font-size:10px;">Score: <span id="score">0</span></div>
        </div>
    `;
    currentPiece = newPiece();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 800);
    drawGame();
}

function newPiece() {
    const pieces = 'ILJOTSZ';
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    let shape = [[1,1,1,1]]; 
    if(type==='L') shape=[[0,0,1],[1,1,1]];
    else if(type==='J') shape=[[1,0,0],[1,1,1]];
    else if(type==='O') shape=[[1,1],[1,1]];
    else if(type==='Z') shape=[[1,1,0],[0,1,1]];
    else if(type==='S') shape=[[0,1,1],[1,1,0]];
    else if(type==='T') shape=[[0,1,0],[1,1,1]];
    const color = Math.floor(Math.random() * 7) + 1;
    return { shape, color, x: Math.floor(COLS/2) - Math.floor(shape[0].length/2), y: 0 };
}

function drawGame() {
    const canvas = document.getElementById('tetris');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const BLOCK_SIZE = canvas.width / COLS;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val > 0) {
                ctx.fillStyle = COLORS[val];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
            }
        });
    });

    if(currentPiece) {
        ctx.fillStyle = COLORS[currentPiece.color];
        currentPiece.shape.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) ctx.fillRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
            });
        });
    }
}

function gameLoop() {
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        merge();
        clearLines();
        currentPiece = newPiece();
        if (collision()) {
            clearInterval(gameInterval);

            const gameOverMessages = [
                "Nyusun balok Tetris aja keteteran, tapi sidang munaqosah Indri Febriani tetep sukses besar! 🎓🎉",
                "Game Over dulu ya, yang penting Indri Febriani udah resmi lulus sidang munaqosah! ✨🙌",
                "Skor rendah gak masalah, yang penting revisian skripsi Indri Febriani udah tuntas tas tas! 📝💯",
                "Otak udah lumayan pegel, waktunya Indri Febriani sejenak pamer selempang kelulusan! 🎓✨",
                "Tetrisnya kalah, Login efef"
            ];

            const randomMsg = gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];

            appScreen.innerHTML = `
                <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:15px; color:#2d3436;">
                    <h3 style="color:#d63031; font-weight:800; margin-bottom:5px;">GAME OVER</h3>
                    <p style="font-size:12px;">Skor: ${score}</p>
                    <p style="font-size:11px; margin-top:12px; line-height:1.4;">${randomMsg}</p>
                    <p style="font-size:10px; margin-top:15px; color:#888;">Tekan A (Main Lagi) / B (Keluar)</p>
                </div>
            `;
            state = "GAMEOVER";
        }
    }
    drawGame();
}

function collision() {
    for(let y = 0; y < currentPiece.shape.length; y++) {
        for(let x = 0; x < currentPiece.shape[y].length; x++) {
            if(currentPiece.shape[y][x] !== 0) {
                let boardY = y + currentPiece.y;
                let boardX = x + currentPiece.x;
                if(boardY >= ROWS || boardX < 0 || boardX >= COLS || board[boardY][boardX] !== 0) return true;
            }
        }
    }
    return false;
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) board[y + currentPiece.y][x + currentPiece.x] = currentPiece.color;
        });
    });
}

function clearLines() {
    for(let y = ROWS - 1; y >= 0; y--) {
        if(board[y].every(val => val !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            document.getElementById('score').innerText = score;
            y++;
        }
    }
}

function handleGame(key) {
    if (key === "LEFT") { currentPiece.x--; if(collision()) currentPiece.x++; }
    if (key === "RIGHT") { currentPiece.x++; if(collision()) currentPiece.x--; }
    if (key === "DOWN") { currentPiece.y++; if(collision()) { currentPiece.y--; merge(); clearLines(); currentPiece = newPiece(); } }
    if (key === "A") { 
        const prev = currentPiece.shape;
        currentPiece.shape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
        if (collision()) currentPiece.shape = prev;
    }
    if (key === "B") backToMenu();
    drawGame();
}

// OVERRIDE INPUT UNTUK GAME OVER
const originalInput = input;
input = function(key) {
    if(state === "GAMEOVER") {
        if(key === "A") initGame();
        if(key === "B") backToMenu();
        return;
    }
    originalInput(key);
};
