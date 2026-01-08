/* =====================================================
   trebka.net - Cyberpunk Interactive Experience
   Organized JavaScript
   ===================================================== */

/* ===================== UTILITY HELPERS ===================== */
function $(sel) { return document.querySelector(sel); }
function $id(id) { return document.getElementById(id); }

/* ===================== GLOBAL STATE ===================== */
let adminMode = false;
let matrixEnabled = false;
let particlesEnabled = true;
let terminalInput = '';
let commandHistory = [];
let historyIndex = -1;
let imageClicks = 0;
let titleClicks = 0;
let secretCode = '';
let idleTimer = 0;
let mouseX = 0, mouseY = 0;
let startTime = Date.now();

// Canvas state
let circles = [];
let matrixRain = [];
let particles = [];
let hue = 0;

// Constants
const konamiCode = '38384040373937396665'; // up up down down left right left right b a
const matrixChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const states = ['monitoring', 'scanning', 'analyzing', 'observing', 'processing'];

/* ===================== DOM ELEMENTS ===================== */
const terminal = $id('terminal');
const canvas = $id('animationCanvas');
const ctx = canvas?.getContext ? canvas.getContext('2d') : null;
const headerContent = $('.header-content');
const statusText = $id('statusText');
const hoverSound = $id('hoverSound');
const secretSound = $id('secretSound');
const ambientSound = $id('ambientSound');

/* ===================== CLOCK ===================== */
if (headerContent) {
    const clockElement = document.createElement('p');
    clockElement.id = 'clockText';
    headerContent.appendChild(clockElement);

    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        const dateString = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        clockElement.textContent = `${dateString} ${timeString}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

/* ===================== AUDIO MANAGEMENT ===================== */
[hoverSound, secretSound, ambientSound].forEach(audio => {
    if (!audio) return;
    audio.addEventListener('error', () => { 
        console.warn('Audio failed to load:', audio.src); 
    });
});

// Play ambient after first user gesture (required by many browsers)
document.addEventListener('pointerdown', function startAmbient() {
    if (ambientSound && ambientSound.paused) {
        ambientSound.play().catch(() => {});
    }
    document.removeEventListener('pointerdown', startAmbient);
});

// Hover sounds
document.querySelectorAll('button, .image-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (hoverSound && hoverSound.readyState >= 2) { 
            hoverSound.currentTime = 0; 
            hoverSound.play().catch(() => {}); 
        }
    });
});

/* ===================== TERMINAL ===================== */
let terminalLines = ['> system boot', '> integrity check ok', '> monitoring enabled'];
if (terminal) terminal.textContent = terminalLines.join('\n');

function typeWriter(text, callback) {
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) { 
            terminal.textContent += text.charAt(i); 
            i++; 
        } else { 
            clearInterval(interval); 
            if (callback) callback(); 
        }
    }, 30);
}

function log(msg, useTyping = false) {
    if (!terminal) return;
    if (useTyping) { 
        terminal.textContent += '\n'; 
        typeWriter(`> ${msg}`); 
    } else { 
        terminal.textContent += `\n> ${msg}`; 
    }
    terminal.scrollTop = terminal.scrollHeight;
}

function updateTerminalPrompt() {
    if (!terminal) return;
    const lines = terminal.textContent.split('\n');
    if (lines[lines.length - 1].startsWith('> ')) {
        lines[lines.length - 1] = '> ' + terminalInput;
    } else {
        lines.push('> ' + terminalInput);
    }
    terminal.textContent = lines.join('\n');
    terminal.scrollTop = terminal.scrollHeight;
}

function processTerminalCommand() {
    if (!terminalInput || terminalInput.trim() === '') return;
    
    const command = terminalInput.trim().toLowerCase();
    commandHistory.push(command);
    historyIndex = commandHistory.length;
    log(`> ${terminalInput}`, true);
    
    setTimeout(() => {
        switch (command) {
            case 'help':
                log('available commands: help, status, time, clear, matrix, particles, admin, ping, whoami, ls, cat, echo');
                break;
            case 'status':
                log(`current status: ${statusText ? statusText.textContent.replace('status: ', '') : 'monitoring'}`);
                break;
            case 'time':
                log(new Date().toLocaleString());
                break;
            case 'clear':
                if (terminal) terminal.textContent = '> terminal cleared\n> ready for input';
                break;
            case 'matrix':
                matrixEnabled = !matrixEnabled;
                if (matrixEnabled) { 
                    matrixRain = []; 
                    log('matrix rain activated'); 
                } else { 
                    log('matrix rain deactivated'); 
                }
                break;
            case 'particles':
                particlesEnabled = !particlesEnabled;
                if (!particlesEnabled) particles = [];
                log(`particles ${particlesEnabled ? 'enabled' : 'disabled'}`);
                break;
            case 'admin':
                if (!adminMode) { 
                    enableAdminMode(); 
                } else { 
                    log('admin mode already active'); 
                }
                break;
            case 'ping':
                log('pong');
                break;
            case 'whoami':
                log('user: anonymous');
                log('level: observer');
                break;
            case 'ls':
                log('files: index.html, script.js, styles.css');
                log('directories: none');
                break;
            case 'cat':
                log('usage: cat <filename>');
                break;
            default:
                if (command.startsWith('echo ')) { 
                    log(command.substring(5)); 
                } else if (command.startsWith('cat ')) {
                    const filename = command.substring(4);
                    if (filename === 'index.html') { 
                        log('file contents: HTML document'); 
                    } else if (filename === 'script.js') { 
                        log('file contents: JavaScript code'); 
                    } else if (filename === 'styles.css') { 
                        log('file contents: CSS styles'); 
                    } else { 
                        log(`file not found: ${filename}`); 
                    }
                } else { 
                    log(`command not found: ${command}`); 
                }
                break;
        }
    }, 400);
    
    terminalInput = '';
    updateTerminalPrompt();
}

/* ===================== EASTER EGGS ===================== */
// Image secret
$id('imageSecret')?.addEventListener('click', () => { 
    imageClicks++; 
    log(`image ping ${imageClicks}`); 
    if (imageClicks === 6 && !adminMode) enableAdminMode(); 
});

// Title easter egg
$id('titleEgg')?.addEventListener('click', () => {
    titleClicks++;
    log(`title pulse ${titleClicks}`);
    if (titleClicks === 5) {
        log('title override unlocked');
        document.title = 'ACCESS GRANTED';
        document.body.style.boxShadow = 'inset 0 0 120px rgba(0,255,150,0.15)';
        setTimeout(() => { 
            document.body.style.boxShadow = ''; 
        }, 4000);
    }
});

// Konami code detector
document.addEventListener('keydown', (e) => {
    secretCode += e.keyCode;
    if (secretCode.length > konamiCode.length) {
        secretCode = secretCode.slice(-konamiCode.length);
    }
    if (secretCode === konamiCode) { 
        activateEasterEgg(); 
        secretCode = ''; 
    }
});

function activateEasterEgg() {
    log('KONAMI CODE ACTIVATED');
    document.body.style.animation = 'rainbow 2s infinite';
    setTimeout(() => { 
        document.body.style.animation = ''; 
    }, 10000);
    
    if (!document.getElementById('konami-style')) { 
        const style = document.createElement('style'); 
        style.id = 'konami-style'; 
        style.textContent = '@keyframes rainbow{0%{filter:hue-rotate(0deg);}100%{filter:hue-rotate(360deg);}}'; 
        document.head.appendChild(style); 
    }
}

/* ===================== KEYBOARD SHORTCUTS ===================== */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Clear terminal
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (terminal) { 
            terminal.textContent = '> terminal cleared\n> ready for input'; 
            log('terminal reset'); 
        }
    }
    
    // Ctrl/Cmd + R: Toggle Matrix Rain
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        matrixEnabled = !matrixEnabled;
        if (matrixEnabled) { 
            matrixRain = []; 
            log('matrix rain activated'); 
        } else { 
            log('matrix rain deactivated'); 
        }
    }
    
    // Ctrl/Cmd + C: Clear canvas
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        circles = [];
        matrixRain = [];
        loadCircles();
        log('canvas reset');
    }
    
    // Ctrl/Cmd + P: Toggle particles
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        particlesEnabled = !particlesEnabled;
        if (!particlesEnabled) particles = [];
        log(`particles ${particlesEnabled ? 'enabled' : 'disabled'}`);
    }
    
    // Space: Random status
    if (e.key === ' ' && document.activeElement === document.body) {
        e.preventDefault();
        if (statusText) {
            statusText.textContent = 'status: ' + states[Math.floor(Math.random() * states.length)];
        }
        log('status randomized');
    }
    
    // Enter: Process terminal command
    if (e.key === 'Enter' && document.activeElement === document.body) {
        e.preventDefault();
        processTerminalCommand();
    }

    // Terminal input capturing when body is focused
    if (document.activeElement === document.body) {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { 
            terminalInput += e.key; 
            updateTerminalPrompt(); 
        } else if (e.key === 'Backspace') { 
            terminalInput = terminalInput.slice(0, -1); 
            updateTerminalPrompt(); 
        } else if (e.key === 'ArrowUp') { 
            if (historyIndex > 0) { 
                historyIndex--; 
                terminalInput = commandHistory[historyIndex]; 
                updateTerminalPrompt(); 
            } 
        } else if (e.key === 'ArrowDown') { 
            if (historyIndex < commandHistory.length - 1) { 
                historyIndex++; 
                terminalInput = commandHistory[historyIndex]; 
                updateTerminalPrompt(); 
            } else { 
                historyIndex = commandHistory.length; 
                terminalInput = ''; 
                updateTerminalPrompt(); 
            } 
        }
    }
});

/* ===================== ADMIN MODE ===================== */
function enableAdminMode() {
    if (adminMode) return;
    adminMode = true;
    log('ADMIN MODE ENABLED');
    $id('secretOverlay').style.display = 'flex';
    secretSound?.play().catch(() => {});
    startARG();
}

$id('secretOverlay')?.addEventListener('click', () => {
    $id('secretOverlay').style.display = 'none';
});

/* ===================== CANVAS ANIMATION ===================== */
if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = 130;
}

function createCircle() {
    const radius = Math.random() * 3 + 3;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    let speedX = (Math.random() * 2 - 1) * 0.15;
    let speedY = (Math.random() * 2 - 1) * 0.15;
    if (Math.random() > 0.8) { 
        speedX *= 1.5; 
        speedY *= 1.5; 
    }
    circles.push({ x, y, radius, speedX, speedY });
}

function createMatrixDrop() {
    return {
        x: Math.random() * canvas.width,
        y: -Math.random() * 200,
        speed: Math.random() * 2 + 1,
        chars: Array.from(
            { length: Math.floor(Math.random() * 20 + 5) },
            () => matrixChars.charAt(Math.floor(Math.random() * matrixChars.length))
        )
    };
}

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 100 + 50,
        maxLife: Math.random() * 100 + 50,
        size: Math.random() * 2 + 1
    };
}

function updateParticles() {
    if (Math.random() < 0.1 && particles.length < 50) {
        particles.push(createParticle());
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function loadCircles() {
    const size = Math.max(8, Math.floor(window.innerWidth / 38.4));
    for (let i = 0; i < size; i++) createCircle();
}

function updateCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Limit FPS
    if (performance.now() - (updateCanvas.lastTime || 0) < 16) {
        requestAnimationFrame(updateCanvas);
        return;
    }
    updateCanvas.lastTime = performance.now();
    
    if (particlesEnabled && !matrixEnabled) {
        updateParticles();
        drawParticles();
    }
    
    if (!matrixEnabled) {
        // Draw circles and connections
        hue = (hue + 0.3) % 360;
        const color = "#ffffffff";
        
        for (const c of circles) {
            c.x += c.speedX;
            c.y += c.speedY;
            if (c.x + c.radius > canvas.width || c.x - c.radius < 0) c.speedX *= -1;
            if (c.y + c.radius > canvas.height || c.y - c.radius < 0) c.speedY *= -1;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
        
        // Draw connections
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                const a = circles[i], b = circles[j];
                const d = Math.hypot(b.x - a.x, b.y - a.y);
                if (d < 150) {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = Math.max(1, 5 - d / 30);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    } else {
        // Matrix rain effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f0';
        ctx.font = '14px monospace';
        
        for (let i = matrixRain.length - 1; i >= 0; i--) {
            const drop = matrixRain[i];
            for (let j = 0; j < drop.chars.length; j++) {
                const char = drop.chars[j];
                const y = drop.y - j * 14;
                if (y > 0 && y < canvas.height) {
                    ctx.fillText(char, drop.x, y);
                }
            }
            drop.y += drop.speed;
            if (drop.y - drop.chars.length * 14 > canvas.height) {
                matrixRain.splice(i, 1);
            }
        }
        if (Math.random() < 0.1) matrixRain.push(createMatrixDrop());
    }
    
    requestAnimationFrame(updateCanvas);
}

loadCircles();
updateCanvas();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    circles = [];
    loadCircles();
    if (typeof updateSystemInfo === 'function') updateSystemInfo();
});

/* ===================== SYSTEM INFO ===================== */
function detectOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
    return 'Unknown';
}

function detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Unknown';
}

function updateSystemInfo() {
    const os = detectOS();
    const browser = detectBrowser();
    const resolution = `${window.innerWidth}x${window.innerHeight}`;
    $id('os-info').textContent = os;
    $id('browser-info').textContent = browser;
    $id('resolution-info').textContent = resolution;
}

// Initialize system info
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSystemInfo);
} else {
    updateSystemInfo();
}

// Uptime counter
setInterval(() => {
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    $id('uptime-info').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}, 1000);

/* ===================== COMMAND BUTTONS ===================== */
document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        executeCommand(cmd);
    });
});

function executeCommand(cmd) {
    log(`executing: ${cmd}`, true);
    setTimeout(() => {
        switch (cmd) {
            case 'help':
                log('available commands: help, status, clear, scan, ping');
                break;
            case 'status':
                log(`current ${statusText ? statusText.textContent : 'status: monitoring'}`);
                break;
            case 'clear':
                if (terminal) terminal.textContent = '> terminal cleared\n> ready for input';
                break;
            case 'scan':
                log('scanning network...');
                setTimeout(() => log('scan complete - no threats detected'), 1200);
                break;
            case 'ping':
                log('pinging server...');
                setTimeout(() => log('pong - latency: ' + Math.floor(Math.random() * 50 + 10) + 'ms'), 800);
                break;
        }
    }, 300);
}

/* ===================== FOOTER SECRET ===================== */
const footer = document.querySelector('footer');
let footerHoverCount = 0;

if (footer) {
    footer.addEventListener('mouseenter', () => {
        footerHoverCount++;
        if (footerHoverCount === 3) {
            log('footer anomaly detected');
            footer.style.color = '#ff6b6b';
            setTimeout(() => {
                footer.style.color = '';
                footerHoverCount = 0;
            }, 2000);
        }
    });
}

/* ===================== MOUSE TRACKING ===================== */
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

setInterval(() => {
    if (Math.random() < 0.1) {
        log(`tracking: ${mouseX}, ${mouseY}`);
    }
}, 5000);

/* ===================== IDLE DETECTION ===================== */
setInterval(() => {
    idleTimer++;
    if (idleTimer === 30) log('idle state detected');
    if (idleTimer === 60) log('observer still present');
}, 1000);

['mousemove', 'keydown', 'click'].forEach(e => {
    document.addEventListener(e, () => idleTimer = 0);
});

/* ===================== RANDOM SYSTEM MESSAGES ===================== */
setInterval(() => {
    const systemMessages = [
        'ping test successful',
        'memory scan complete',
        'network probe detected',
        'firewall check passed',
        'data integrity verified',
        'background process started',
        'cache cleared',
        'system optimization complete'
    ];
    if (Math.random() < 0.3) {
        log(systemMessages[Math.floor(Math.random() * systemMessages.length)]);
    }
}, 8000);

/* ===================== ARG (Alternate Reality Game) ===================== */
function startARG() {
    const messages = [
        "user detected",
        "session initialized",
        "rot13: gnpxvat guvf zrffntr",
        "base64: dHJlYmthLnNpdGVuYyBleHBlcmllbmNl",
        "scan complete",
        "alert: unknown process",
        "decrypting... 23%",
        "decrypting... 47%",
        "decrypting... 78%",
        "decrypting... 100%",
        "access granted: level 2",
        "loading neural interface...",
        "connection established",
        "monitoring active",
        "threat level: minimal",
        "system integrity: 98.7%",
        "backup protocols engaged",
        "data stream active"
    ];
    
    let idx = 0;
    const interval = setInterval(() => {
        if (idx < messages.length) {
            log(messages[idx++]);
        } else {
            clearInterval(interval);
            setInterval(() => {
                const statusMessages = [
                    "ping: 127.0.0.1 - success",
                    "firewall: active",
                    "antivirus: scanning...",
                    "memory: stable",
                    "network: secure",
                    "cpu: optimal",
                    "temperature: normal"
                ];
                log(statusMessages[Math.floor(Math.random() * statusMessages.length)]);
            }, 8000);
        }
    }, 1500);
}
