/* =====================================================
   trebka.net - Cyberpunk Interactive Experience
   Organized JavaScript
   ===================================================== */

/* ===================== UTILITY HELPERS ===================== */
function $(sel) { return document.querySelector(sel); }
function $id(id) { return document.getElementById(id); }

/* ===================== GLOBAL STATE ===================== */
let adminMode = false;
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

// User customization
let userName = 'anonymous';
let terminalColor = '#d4d4d4';
let commandCount = 0;
let secretsFound = 0;

// Canvas state
let circles = [];
let particles = [];
let hue = 0;

// Constants
const konamiCode = '38384040373937396665'; // up up down down left right left right b a
const states = ['monitoring', 'scanning', 'analyzing', 'observing', 'processing'];

// Load saved data
if (localStorage.getItem('userName')) userName = localStorage.getItem('userName');
if (localStorage.getItem('commandCount')) commandCount = parseInt(localStorage.getItem('commandCount'));
if (localStorage.getItem('secretsFound')) secretsFound = parseInt(localStorage.getItem('secretsFound'));

/* ===================== DOM ELEMENTS ===================== */
const terminal = $id('terminalOutput');
const terminalInputField = $id('terminalInput');
const clearTerminalBtn = $id('clearTerminal');
const minimizeTerminalBtn = $id('minimizeTerminal');
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
let terminalLines = ['Last login: Fri Jan 17 2026 on tty1', '> system boot', '> integrity check ok', '> monitoring enabled'];
if (terminal) terminal.textContent = terminalLines.join('\n');

// Terminal input field event handlers
if (terminalInputField) {
    // Handle Enter key to submit command
    terminalInputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = terminalInputField.value.trim();
            if (command) {
                // Add to terminal display
                terminal.textContent += `\n> ${command}`;
                terminal.scrollTop = terminal.scrollHeight;
                
                // Add to history
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                commandCount++;
                localStorage.setItem('commandCount', commandCount);
                
                // Clear input
                terminalInputField.value = '';
                
                // Execute command
                setTimeout(() => {
                    executeTerminalCommand(command.toLowerCase());
                }, 100);
            }
        }
        // Arrow up - previous command
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0 && historyIndex > 0) {
                historyIndex--;
                terminalInputField.value = commandHistory[historyIndex];
            }
        }
        // Arrow down - next command
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInputField.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInputField.value = '';
            }
        }
        // Tab - autocomplete
        else if (e.key === 'Tab') {
            e.preventDefault();
            const input = terminalInputField.value.toLowerCase();
            const commands = ['help', 'status', 'time', 'date', 'clear', 'ping', 'whoami', 'history', 
                            'weather', 'stats', 'particles', 'admin', 'scan', 'trace', 
                            'broadcast', 'glitch', 'joke', 'fortune', 'hack', 'uname', 'tree', 
                            'calc', 'echo', 'rot13', 'base64', 'name', 'color', 'secret'];
            const matches = commands.filter(cmd => cmd.startsWith(input));
            if (matches.length === 1) {
                terminalInputField.value = matches[0];
            } else if (matches.length > 1) {
                log(`suggestions: ${matches.join(', ')}`);
            }
        }
    });
    
    // Focus input on page load
    terminalInputField.focus();
    
    // Refocus input when clicking terminal output
    if (terminal) {
        terminal.addEventListener('click', () => {
            terminalInputField.focus();
        });
    }
}

// Terminal control buttons
if (clearTerminalBtn) {
    clearTerminalBtn.addEventListener('click', () => {
        if (terminal) {
            terminal.textContent = '> terminal cleared';
        }
        if (terminalInputField) {
            terminalInputField.focus();
        }
    });
}

if (minimizeTerminalBtn) {
    minimizeTerminalBtn.addEventListener('click', () => {
        const terminalOutput = $id('terminalOutput');
        const inputLine = $('.terminal-input-line');
        if (terminalOutput && inputLine) {
            terminalOutput.classList.toggle('minimized');
            inputLine.classList.toggle('minimized');
            minimizeTerminalBtn.textContent = terminalOutput.classList.contains('minimized') ? '+' : '─';
        }
    });
}

function typeWriter(text, callback) {
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) { 
            terminal.textContent += text.charAt(i); 
            i++;
            // Auto-scroll while typing
            terminal.scrollTop = terminal.scrollHeight;
        } else { 
            clearInterval(interval); 
            // Final scroll after typing completes
            terminal.scrollTop = terminal.scrollHeight;
            if (callback) callback(); 
        }
    }, 30);
}

function log(msg, useTyping = false) {
    if (!terminal) return;
    
    if (useTyping) { 
        terminal.textContent += '\n'; 
        typeWriter(msg, () => {
            terminal.scrollTop = terminal.scrollHeight;
        }); 
    } else { 
        terminal.textContent += `\n${msg}`; 
        terminal.scrollTop = terminal.scrollHeight;
    }
}

function executeTerminalCommand(command) {
    switch (command) {
            case 'help':
                log('Available commands:');
                log('Basic: help, status, time, date, clear, ping, whoami, ls, cat, echo, history');
                log('Math: calc <expression> - e.g., calc 5+5');
                log('Encode: rot13 <text>, base64 <text>');
                log('System: particles, admin, scan, trace, broadcast, uname, tree');
                log('User: name <username>, color <green|amber|blue|red>, stats');
                log('Info: weather');
                log('Fun: joke, fortune, hack, coffee, dance, 42, glitch');
                log('Secret: try exploring... type "secret" for hints');
                break;
            case 'status':
                log(`current status: ${statusText ? statusText.textContent.replace('status: ', '') : 'monitoring'}`);
                break;
            case 'time':
                log(new Date().toLocaleString());
                break;
            case 'clear':
                if (terminal) {
                    terminal.textContent = '> terminal cleared';
                }
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
                log(`user: ${userName}`);
                log('level: observer');
                break;
            case 'history':
                if (commandHistory.length === 0) {
                    log('no command history');
                } else {
                    log('command history:');
                    commandHistory.slice(-10).forEach((cmd, i) => {
                        log(`${i + 1}. ${cmd}`);
                    });
                }
                break;
            case 'date':
                const now = new Date();
                log(now.toDateString());
                log(now.toTimeString());
                break;
            case 'weather':
                log('accessing weather satellite...');
                setTimeout(() => {
                    const conditions = ['acid rain', 'smog alert', 'electromagnetic storm', 'clear skies', 'neon fog'];
                    const temp = Math.floor(Math.random() * 30 + 10);
                    log(`condition: ${conditions[Math.floor(Math.random() * conditions.length)]}`);
                    log(`temperature: ${temp}°C`);
                    log(`radiation: nominal`);
                }, 800);
                break;
            case 'uname':
                log('trebka.net OS v2.077');
                log('kernel: cyberpunk-5.19.0');
                log('architecture: neural-x64');
                break;
            case 'tree':
                log('.');
                log('├── index.html');
                log('├── script.js');
                log('├── styles.css');
                log('├── secrets/');
                log('│   ├── classified.dat');
                log('│   └── override.key');
                log('└── system/');
                log('    ├── core.bin');
                log('    └── matrix.dll');
                break;
            case 'stats':
                log('--- user statistics ---');
                log(`username: ${userName}`);
                log(`commands entered: ${commandCount}`);
                log(`secrets found: ${secretsFound}/10`);
                log(`session time: ${Math.floor((Date.now() - startTime) / 1000)}s`);
                log(`admin mode: ${adminMode ? 'active' : 'inactive'}`);
                break;
            case 'trace':
                log('initiating trace route...');
                setTimeout(() => log('hop 1: 192.168.1.1 - 2ms'), 300);
                setTimeout(() => log('hop 2: 10.0.0.1 - 15ms'), 600);
                setTimeout(() => log('hop 3: 203.0.113.0 - 45ms'), 900);
                setTimeout(() => log('hop 4: ??? - connection encrypted'), 1200);
                setTimeout(() => log('trace complete - target masked'), 1500);
                break;
            case 'broadcast':
                const broadcasts = [
                    'ALERT: unauthorized access detected on node 7',
                    'NOTICE: system maintenance in 3 hours',
                    'WARNING: anomalous activity in sector 12',
                    'INFO: neural link stability at 98%',
                    'CRITICAL: firewall breach attempt blocked'
                ];
                log(broadcasts[Math.floor(Math.random() * broadcasts.length)]);
                break;
            case 'glitch':
                triggerGlitch();
                log('gl1tch_3ff3ct_@ct1v@t3d');
                break;
            case 'ls':
                log('files: index.html, script.js, styles.css');
                log('directories: none');
                break;
            case 'cat':
                log('usage: cat <filename>');
                break;
            case 'joke':
                const jokes = [
                    'Why do programmers prefer dark mode? Because light attracts bugs!',
                    'How many programmers does it take to change a light bulb? None, that\'s a hardware problem.',
                    'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
                    'Why do Java developers wear glasses? Because they don\'t C#!',
                    'There are only 10 types of people: those who understand binary and those who don\'t.',
                    'I would tell you a UDP joke, but you might not get it.',
                    '"Knock knock." "Who\'s there?" ...very long pause... "Java."',
                    'To understand what recursion is, you must first understand recursion.',
                    'A programmer puts two glasses on the bedside table: one full of water for if they get thirsty, and one empty for if they don\'t.'
                ];
                log(jokes[Math.floor(Math.random() * jokes.length)]);
                break;
            case 'fortune':
                const fortunes = [
                    'Your code will compile on the first try... eventually.',
                    'A bug in production is worth two in development.',
                    'Today is a good day to refactor legacy code.',
                    'You will find the solution in Stack Overflow.',
                    'The next commit will be the one that works.',
                    'Beware of infinite loops in unexpected places.',
                    'Your algorithm has O(1) efficiency... in your dreams.',
                    'The bug you\'re looking for is in the code you wrote yesterday.',
                    'In production, no one can hear you scream.',
                    'May your deployments be smooth and your rollbacks unnecessary.'
                ];
                log(fortunes[Math.floor(Math.random() * fortunes.length)]);
                break;
            case 'hack':
                log('initializing hack sequence...');
                setTimeout(() => log('accessing mainframe...'), 600);
                setTimeout(() => log('bypassing firewall...'), 1200);
                setTimeout(() => log('cracking encryption...'), 1800);
                setTimeout(() => log('ERROR: Nice try, script kiddie!'), 2400);
                break;
            case 'sudo':
                log('sudo: command not found (you\'re not root)');
                break;
            case 'rm -rf /':
            case 'rm -rf':
                log('permission denied: cannot delete the universe');
                log('also, please don\'t do that');
                break;
            case 'exit':
                log('you cannot leave. you are being observed.');
                break;
            case 'reboot':
                log('rebooting system...');
                setTimeout(() => location.reload(), 2000);
                break;
            case 'secret':
                log('try: "unlock", "access", or "override"');
                break;
            case 'unlock':
                log('access denied: insufficient privileges');
                log('hint: click the image 6 times');
                break;
            case 'access':
                log('authorization required');
                log('hint: try the konami code');
                break;
            case 'override':
                log('manual override initiated...');
                if (!adminMode) {
                    enableAdminMode();
                    secretsFound = Math.max(secretsFound, 7);
                    localStorage.setItem('secretsFound', secretsFound);
                } else {
                    log('admin mode already active');
                }
                break;
            case 'coffee':
                log('brewing coffee...');
                setTimeout(() => log('☕ Error 418: I\'m a teapot'), 1000);
                break;
            case 'illuminati':
                log('▲');
                setTimeout(() => log('▲ ▲'), 300);
                setTimeout(() => log('confirmed'), 600);
                break;
            case '42':
                log('The Answer to the Ultimate Question of Life, the Universe, and Everything');
                break;
            case 'dance':
                log('♪┏(°.°)┛┗(°.°)┓┗(°.°)┛┏(°.°)┓ ♪');
                break;
            case 'virus':
                log('downloading virus.exe...');
                setTimeout(() => log('just kidding! stay safe online :)'), 800);
                break;
            case 'noclip':
                log('reality boundaries disabled');
                document.body.style.transform = 'rotateZ(0.5deg)';
                setTimeout(() => { document.body.style.transform = ''; }, 3000);
                secretsFound = Math.max(secretsFound, 2);
                localStorage.setItem('secretsFound', secretsFound);
                break;
            case 'ghost':
                log('entering stealth mode...');
                document.body.style.opacity = '0.3';
                setTimeout(() => { document.body.style.opacity = '1'; }, 2000);
                secretsFound = Math.max(secretsFound, 3);
                localStorage.setItem('secretsFound', secretsFound);
                break;
            default:
                if (command.startsWith('echo ')) { 
                    log(command.substring(5)); 
                } else if (command.startsWith('calc ')) {
                    const expr = command.substring(5).trim();
                    try {
                        // Safe eval alternative - only allow numbers and basic operators
                        const allowed = /^[0-9+\-*/().\s]+$/;
                        if (allowed.test(expr)) {
                            const result = Function('"use strict"; return (' + expr + ')')();
                            log(`result: ${result}`);
                        } else {
                            log('error: invalid expression');
                        }
                    } catch (e) {
                        log('error: calculation failed');
                    }
                } else if (command.startsWith('rot13 ')) {
                    const text = command.substring(6);
                    const result = text.replace(/[a-zA-Z]/g, c => 
                        String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)
                    );
                    log(`rot13: ${result}`);
                } else if (command.startsWith('base64 ')) {
                    const text = command.substring(7);
                    try {
                        const result = btoa(text);
                        log(`base64: ${result}`);
                    } catch (e) {
                        log('error: encoding failed');
                    }
                } else if (command.startsWith('name ')) {
                    const newName = command.substring(5).trim();
                    if (newName.length > 0 && newName.length < 20) {
                        userName = newName;
                        localStorage.setItem('userName', userName);
                        log(`username set to: ${userName}`);
                    } else {
                        log('error: invalid username');
                    }
                } else if (command.startsWith('color ')) {
                    const color = command.substring(6).trim();
                    const colors = {
                        green: '#7dff9b',
                        amber: '#ffb86c',
                        blue: '#8be9fd',
                        red: '#ff5555',
                        purple: '#bd93f9'
                    };
                    if (colors[color]) {
                        terminalColor = colors[color];
                        if (terminal) terminal.style.color = terminalColor;
                        log(`terminal color set to: ${color}`);
                    } else {
                        log('available colors: green, amber, blue, red, purple');
                    }
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
                } else if (command.startsWith('sudo ')) {
                    log('sudo: you are not in the sudoers file. This incident will be reported.');
                } else { 
                    log(`command not found: ${command}`); 
                    log('type "help" for available commands');
                }
                break;
        }
}

/* ===================== VISUAL EFFECTS ===================== */
function triggerGlitch() {
    const glitchElement = document.body;
    glitchElement.classList.add('glitch-effect');
    setTimeout(() => glitchElement.classList.remove('glitch-effect'), 500);
}

function screenShake() {
    const shakeElement = document.body;
    shakeElement.style.animation = 'shake 0.5s';
    setTimeout(() => { shakeElement.style.animation = ''; }, 500);
}

// Random system messages
setInterval(() => {
    if (Math.random() < 0.15) {
        const messages = [
            'background scan initiated...',
            'packet inspection complete',
            'neural sync: 99.8%',
            'firewall status: active',
            'intrusion detection: nominal',
            'memory optimization complete'
        ];
        log(messages[Math.floor(Math.random() * messages.length)]);
    }
}, 15000);

// Time-based easter eggs
setInterval(() => {
    const hour = new Date().getHours();
    if (hour === 3 && Math.random() < 0.1) {
        log('[SYSTEM] 3 AM - the witching hour...');
    }
}, 60000);

/* ===================== EASTER EGGS ===================== */
// Image secret
$id('imageSecret')?.addEventListener('click', () => { 
    imageClicks++; 
    log(`image ping ${imageClicks}`); 
    if (imageClicks === 6 && !adminMode) {
        enableAdminMode();
        secretsFound = Math.max(secretsFound, 4);
        localStorage.setItem('secretsFound', secretsFound);
    }
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
        secretsFound = Math.max(secretsFound, 5);
        localStorage.setItem('secretsFound', secretsFound);
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
    
    secretsFound = Math.max(secretsFound, 6);
    localStorage.setItem('secretsFound', secretsFound);
    
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
            terminal.textContent = 'Terminal cleared.'; 
        }
    }
    
    // Ctrl/Cmd + C: Clear canvas
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        circles = [];
        loadCircles();
        log('Canvas reset.');
    }
    
    // Ctrl/Cmd + P: Toggle particles
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        particlesEnabled = !particlesEnabled;
        if (!particlesEnabled) particles = [];
        log(`particles ${particlesEnabled ? 'enabled' : 'disabled'}`);
    }
    
    // Ctrl/Cmd + G: Trigger glitch
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        triggerGlitch();
        log('glitch effect triggered');
    }
    
    // Ctrl/Cmd + B: Random broadcast
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        const broadcasts = [
            'ALERT: unauthorized access detected',
            'NOTICE: system maintenance required',
            'WARNING: anomalous activity detected',
            'INFO: neural link stable'
        ];
        log(broadcasts[Math.floor(Math.random() * broadcasts.length)]);
    }
    
    // Space: Random status (only when not typing in terminal)
    if (e.key === ' ' && document.activeElement !== terminalInputField && terminalInput === '') {
        e.preventDefault();
        if (statusText) {
            statusText.textContent = 'status: ' + states[Math.floor(Math.random() * states.length)];
        }
        log('status randomized');
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
    
    // Limit FPS
    if (performance.now() - (updateCanvas.lastTime || 0) < 16) {
        requestAnimationFrame(updateCanvas);
        return;
    }
    updateCanvas.lastTime = performance.now();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (particlesEnabled) {
        updateParticles();
        drawParticles();
    }
    
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
    terminalInput = cmd;
    const displayCmd = terminalInput;
    terminalInput = '';
    
    // Add to terminal display
    const lines = terminal.textContent.split('\n');
    const lastLine = lines[lines.length - 1];
    if (lastLine.startsWith('> ') && lastLine.length === 2) {
        lines[lines.length - 1] = '> ' + displayCmd;
    } else {
        lines.push('> ' + displayCmd);
    }
    terminal.textContent = lines.join('\n');
    terminal.scrollTop = terminal.scrollHeight;
    
    // Execute after a short delay
    setTimeout(() => {
        executeTerminalCommand(cmd);
    }, 100);
}

// Footer secret
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
            secretsFound = Math.max(secretsFound, 8);
            localStorage.setItem('secretsFound', secretsFound);
        }
    });
}

// Achievement unlocks
setInterval(() => {
    if (commandCount === 50 && secretsFound < 9) {
        log('🏆 ACHIEVEMENT UNLOCKED: Command Master');
        secretsFound = Math.max(secretsFound, 9);
        localStorage.setItem('secretsFound', secretsFound);
    }
    if (commandCount === 100 && secretsFound < 10) {
        log('🏆 ACHIEVEMENT UNLOCKED: Terminal Legend');
        log('You have unlocked all secrets!');
        secretsFound = 10;
        localStorage.setItem('secretsFound', secretsFound);
        triggerGlitch();
    }
}, 1000);

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
