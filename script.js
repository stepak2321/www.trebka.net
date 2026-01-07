/* ===================== THEME ===================== */
const themeToggleButton = document.getElementById('theme-toggle');
const icon = themeToggleButton.querySelector('div');

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');

    // Save theme preference
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

/* ===================== STATUS ===================== */
const statusText = document.getElementById('statusText');
const states = ['idle','observing','analyzing','listening','scanning','processing','connecting','disconnecting','alert','warning','critical','standby','active','monitoring','tracking'];
setInterval(()=>{statusText.textContent='status: '+states[Math.floor(Math.random()*states.length)];},2500);

// Add clock display
const clockElement = document.createElement('p');
clockElement.id = 'clockText';
clockElement.style.opacity = '0.65';
clockElement.style.fontSize = '0.75rem';
clockElement.style.margin = '4px 0 0 0';
clockElement.style.fontFamily = 'monospace';
document.querySelector('.header-content').appendChild(clockElement);

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

/* ===================== AUDIO ===================== */
const hoverSound = document.getElementById('hoverSound');
const secretSound = document.getElementById('secretSound');
const ambientSound = document.getElementById('ambientSound');

// Audio error handling
[hoverSound, secretSound, ambientSound].forEach(audio => {
    audio.addEventListener('error', () => {
        console.warn('Audio failed to load:', audio.src);
    });
});

ambientSound.volume = 0.15;
document.addEventListener('click', () => {
    if (ambientSound.paused) {
        ambientSound.play().catch(e => console.warn('Ambient sound failed to play:', e));
    }
}, { once: true });

document.querySelectorAll('button, .image-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (hoverSound.readyState >= 2) { // HAVE_CURRENT_DATA or better
            hoverSound.currentTime = 0;
            hoverSound.play().catch(e => console.warn('Hover sound failed to play:', e));
        }
    });
});

/* ===================== TERMINAL ===================== */
const terminal = document.getElementById('terminal');
let terminalLines = [
    '> system boot',
    '> integrity check ok',
    '> monitoring enabled'
];
terminal.textContent = terminalLines.join('\n');

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
    }, 50);
}

function log(msg, useTyping = false) {
    if (useTyping) {
        terminal.textContent += '\n';
        typeWriter(`> ${msg}`);
    } else {
        terminal.textContent += `\n> ${msg}`;
    }
    terminal.scrollTop = terminal.scrollHeight;
}

/* ===================== IMAGE SECRET ===================== */
let imageClicks = 0;
let adminMode = false;
let secretCode = '';
let konamiCode = '38384040373937396665'; // up up down down left right left right b a

document.getElementById('imageSecret').addEventListener('click', () => {
    imageClicks++;
    log(`image ping ${imageClicks}`);
    if (imageClicks === 6 && !adminMode) enableAdminMode();
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
    // Add rainbow animation to CSS
    if (!document.getElementById('konami-style')) {
        const style = document.createElement('style');
        style.id = 'konami-style';
        style.textContent = '@keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }';
        document.head.appendChild(style);
    }
}

/* ===================== KEYBOARD SHORTCUTS ===================== */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Clear terminal
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        terminal.textContent = '> terminal cleared\n> ready for input';
        log('terminal reset');
    }

    // Ctrl/Cmd + M: Toggle HUD
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        const hud = document.getElementById('hudOverlay');
        hud.style.display = hud.style.display === 'none' ? 'block' : 'none';
        log('HUD toggled');
    }

    // Ctrl/Cmd + R: Toggle Matrix Rain
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        circles = [];
        matrixRain = [];
        loadCircles();
        log('canvas reset');
    }

    // Ctrl/Cmd + P: Toggle particles
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        particlesEnabled = !particlesEnabled;
        if (!particlesEnabled) {
            particles = [];
        }
        log(`particles ${particlesEnabled ? 'enabled' : 'disabled'}`);
    }

    // F11: Toggle fullscreen (handled by browser)
    // Space: Random status
    if (e.key === ' ') {
        e.preventDefault();
        statusText.textContent = 'status: ' + states[Math.floor(Math.random() * states.length)];
        log('status randomized');
    }

    // Enter: Process terminal command
    if (e.key === 'Enter' && document.activeElement === document.body) {
        e.preventDefault();
        processTerminalCommand();
    }
});

/* ===================== TERMINAL COMMANDS ===================== */
let terminalInput = '';
let commandHistory = [];
let historyIndex = -1;

function processTerminalCommand() {
    if (terminalInput.trim() === '') return;

    const command = terminalInput.trim().toLowerCase();
    commandHistory.push(command);
    historyIndex = commandHistory.length;

    log(`> ${terminalInput}`, true);

    setTimeout(() => {
        switch (command) {
            case 'help':
                log('available commands: help, status, time, clear, matrix, particles, hud, admin, ping, whoami, ls, cat, echo');
                break;
            case 'status':
                log(`current status: ${statusText.textContent.replace('status: ', '')}`);
                break;
            case 'time':
                log(new Date().toLocaleString());
                break;
            case 'clear':
                terminal.textContent = '> terminal cleared\n> ready for input';
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
                if (!particlesEnabled) {
                    particles = [];
                }
                log(`particles ${particlesEnabled ? 'enabled' : 'disabled'}`);
                break;
            case 'hud':
                const hud = document.getElementById('hudOverlay');
                hud.style.display = hud.style.display === 'none' ? 'block' : 'none';
                log('HUD toggled');
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
                log('files: index.html, script.js, style.css');
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
                    } else if (filename === 'style.css') {
                        log('file contents: CSS styles');
                    } else {
                        log(`file not found: ${filename}`);
                    }
                } else {
                    log(`command not found: ${command}`);
                }
                break;
        }
    }, 500);

    terminalInput = '';
    updateTerminalPrompt();
}

function updateTerminalPrompt() {
    const lines = terminal.textContent.split('\n');
    if (lines[lines.length - 1].startsWith('> ')) {
        lines[lines.length - 1] = '> ' + terminalInput;
    } else {
        lines.push('> ' + terminalInput);
    }
    terminal.textContent = lines.join('\n');
    terminal.scrollTop = terminal.scrollHeight;
}

// Handle terminal input
document.addEventListener('keydown', (e) => {
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

/* ===================== ADMIN ===================== */
function enableAdminMode(){
    if(adminMode) return;
    adminMode=true;
    log('ADMIN MODE ENABLED');
    document.getElementById('secretOverlay').style.display='flex';
    secretSound.play();
    // Start fake ARG / profiling
    startARG();
}
document.getElementById('secretOverlay').addEventListener('click',()=>{document.getElementById('secretOverlay').style.display='none';});

/* ===================== HUD ===================== */
const hud = document.getElementById('hudOverlay');
let enemies = Math.floor(Math.random() * 12);
let alerts = 0;
let connections = Math.floor(Math.random() * 50) + 10;
let memoryUsage = Math.floor(Math.random() * 40) + 30;
let networkTraffic = Math.floor(Math.random() * 100) + 50;
let systemTemp = Math.floor(Math.random() * 20) + 40;

function updateHUD() {
    enemies = Math.max(0, enemies + Math.floor(Math.random() * 3) - 1);
    alerts = Math.max(0, alerts + Math.floor(Math.random() * 2) - 1);
    connections = Math.max(0, connections + Math.floor(Math.random() * 10) - 5);
    memoryUsage = Math.max(20, Math.min(90, memoryUsage + Math.floor(Math.random() * 6) - 3));
    networkTraffic = Math.max(10, Math.min(200, networkTraffic + Math.floor(Math.random() * 20) - 10));
    systemTemp = Math.max(35, Math.min(75, systemTemp + Math.floor(Math.random() * 4) - 2));

    const cpuUsage = Math.floor(Math.random() * 30) + 20;

    hud.innerHTML = `
        <div>Enemies detected: ${enemies}</div>
        <div>Active connections: ${connections}</div>
        <div>System alerts: ${alerts}</div>
        <div>CPU: ${cpuUsage}%</div>
        <div>Memory: ${memoryUsage}%</div>
        <div>Network: ${networkTraffic} Mbps</div>
        <div>Temperature: ${systemTemp}°C</div>
    `;

    // Color code alerts and warnings
    if (alerts > 3 || cpuUsage > 80 || memoryUsage > 85 || systemTemp > 70) {
        hud.style.color = '#ff4444';
    } else if (alerts > 1 || cpuUsage > 60 || memoryUsage > 70 || systemTemp > 60) {
        hud.style.color = '#ffaa44';
    } else if (alerts > 0 || cpuUsage > 40 || memoryUsage > 50) {
        hud.style.color = '#ffdd44';
    } else {
        hud.style.color = '#7dff9b';
    }
}

updateHUD();
setInterval(updateHUD, 2000);

/* ===================== CANVAS ===================== */
const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = 130;
let circles = [];
let hue = 0;
let matrixRain = [];
let particles = [];
let matrixEnabled = false;
let particlesEnabled = true;

// Matrix rain characters
const matrixChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createCircle() {
    let radius = Math.random() * 3 + 3;
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;
    let speedX = (Math.random() * 2 - 1) * 0.15;
    let speedY = (Math.random() * 2 - 1) * 0.15;
    if (Math.random() > 0.8) { speedX *= 1.5; speedY *= 1.5; }
    circles.push({ x, y, radius, speedX, speedY });
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
    // Add new particles occasionally
    if (Math.random() < 0.1 && particles.length < 50) {
        particles.push(createParticle());
    }

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Remove dead particles
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let p of particles) {
        let alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function loadCircles() {
    let size = window.innerWidth / 38.4;
    for (let i = 0; i < size; i++) createCircle();
}

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;

    // Performance optimization: limit FPS
    if (performance.now() - (updateCanvas.lastTime || 0) < 16) { // ~60 FPS
        requestAnimationFrame(updateCanvas);
        return;
    }
    updateCanvas.lastTime = performance.now();

    if (particlesEnabled && !matrixEnabled) {
        updateParticles();
        drawParticles();
    }

    if (!matrixEnabled) {
        // Original circle animation
        hue = (hue + 0.3) % 360;
        const color = `hsl(${hue},30%,75%)`;

        for (let c of circles) {
            c.x += c.speedX;
            c.y += c.speedY;
            if (c.x + c.radius > canvas.width || c.x - c.radius < 0) c.speedX *= -1;
            if (c.y + c.radius > canvas.height || c.y - c.radius < 0) c.speedY *= -1;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                let a = circles[i], b = circles[j];
                let d = Math.hypot(b.x - a.x, b.y - a.y);
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
            let drop = matrixRain[i];
            for (let j = 0; j < drop.chars.length; j++) {
                let char = drop.chars[j];
                let y = drop.y - j * 14;
                if (y > 0 && y < canvas.height) {
                    ctx.fillText(char, drop.x, y);
                }
            }
            drop.y += drop.speed;

            if (drop.y - drop.chars.length * 14 > canvas.height) {
                matrixRain.splice(i, 1);
            }
        }

        // Add new drops occasionally
        if (Math.random() < 0.1) {
            matrixRain.push(createMatrixDrop());
        }
    }

    requestAnimationFrame(updateCanvas);
}

loadCircles();
updateCanvas();

/* ===================== FOOTER SECRET ===================== */
const footer = document.querySelector('footer');
let footerHoverCount = 0;

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

/* ===================== MOUSE TRACKING ===================== */
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Occasionally log mouse position as "tracking"
setInterval(() => {
    if (Math.random() < 0.1) {
        log(`tracking: ${mouseX}, ${mouseY}`);
    }
}, 5000);

/* ===================== SYSTEM INFO ===================== */
function detectOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
}

function detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
}

function updateSystemInfo() {
    document.getElementById('os-info').textContent = detectOS();
    document.getElementById('browser-info').textContent = detectBrowser();
    document.getElementById('resolution-info').textContent = `${window.innerWidth}x${window.innerHeight}`;
}

updateSystemInfo();
window.addEventListener('resize', updateSystemInfo);

// Uptime counter
let startTime = Date.now();
setInterval(() => {
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('uptime-info').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}, 1000);

/* ===================== COMMANDS ===================== */
document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        executeCommand(cmd);
    });
});

function executeCommand(cmd) {
    log(`executing: ${cmd}`, true);

    setTimeout(() => {
        switch(cmd) {
            case 'help':
                log('available commands: help, status, clear, scan, ping');
                break;
            case 'status':
                const currentStatus = statusText.textContent;
                log(`current ${currentStatus}`);
                break;
            case 'clear':
                terminal.textContent = '> terminal cleared\n> ready for input';
                break;
            case 'scan':
                log('scanning network...');
                setTimeout(() => log('scan complete - no threats detected'), 2000);
                break;
            case 'ping':
                log('pinging server...');
                setTimeout(() => log('pong - latency: ' + Math.floor(Math.random() * 50 + 10) + 'ms'), 1000);
                break;
        }
    }, 500);
}

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

/* ===================== ARG / SECRET LOG ===================== */
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
            // Start periodic status updates
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
