/* ===================== THEME ===================== */
const themeToggleButton = document.getElementById('theme-toggle');
const icon = themeToggleButton.querySelector('div');

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
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

/* ===================== STATUS ===================== */
const statusText = document.getElementById('statusText');
const states = ['idle','observing','analyzing','listening','scanning','processing','connecting','disconnecting','alert','warning','critical','standby','active','monitoring','tracking'];
setInterval(()=>{statusText.textContent='status: '+states[Math.floor(Math.random()*states.length)];},2500);

/* ===================== CLOCK ===================== */
const clockElement = document.createElement('p');
clockElement.id = 'clockText';
clockElement.style.opacity = '0.65';
clockElement.style.fontSize = '0.75rem';
clockElement.style.margin = '4px 0 0 0';
clockElement.style.fontFamily = 'monospace';
document.querySelector('.header-content').appendChild(clockElement);

function updateClock() {
    const now = new Date();
    clockElement.textContent = now.toLocaleString();
}
updateClock();
setInterval(updateClock, 1000);

/* ===================== AUDIO ===================== */
const hoverSound = document.getElementById('hoverSound');
const secretSound = document.getElementById('secretSound');
const ambientSound = document.getElementById('ambientSound');
ambientSound.volume = 0.15;
document.addEventListener('click', ()=>{ambientSound.play().catch(()=>{});},{once:true});
document.querySelectorAll('button, .image-card').forEach(el=>el.addEventListener('mouseenter',()=>{hoverSound.currentTime=0;hoverSound.play().catch(()=>{});}));

/* ===================== SYSTEM INFO ===================== */
function detectOS(){
    const ua = navigator.userAgent;
    if(ua.includes('Windows')) return 'Windows';
    if(ua.includes('Mac')) return 'macOS';
    if(ua.includes('Linux')) return 'Linux';
    if(ua.includes('Android')) return 'Android';
    if(/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    return 'Unknown';
}

function detectBrowser(){
    const ua = navigator.userAgent;
    if(ua.includes('Edg')) return 'Edge';
    if(ua.includes('OPR')||ua.includes('Opera')) return 'Opera';
    if(ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if(ua.includes('Firefox')) return 'Firefox';
    if(ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    return 'Unknown';
}

function updateSystemInfo(){
    document.getElementById('os-info').textContent = detectOS();
    document.getElementById('browser-info').textContent = detectBrowser();
    document.getElementById('resolution-info').textContent = `${window.innerWidth}x${window.innerHeight}`;
}
updateSystemInfo();
window.addEventListener('resize', updateSystemInfo);

let startTime=Date.now();
setInterval(()=>{
    const elapsed=Date.now()-startTime;
    const h=Math.floor(elapsed/3600000);
    const m=Math.floor((elapsed%3600000)/60000);
    const s=Math.floor((elapsed%60000)/1000);
    document.getElementById('uptime-info').textContent=`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
},1000);

/* ===================== TERMINAL & COMMANDS ===================== */
const terminal=document.getElementById('terminal');
let terminalLines=['> system boot','> integrity check ok','> monitoring enabled'];
terminal.textContent=terminalLines.join('\n');
let terminalInput='';
let commandHistory=[];
let historyIndex=-1;

function log(msg,useTyping=false){
    if(useTyping){terminal.textContent+='\n';typeWriter('> '+msg);} 
    else {terminal.textContent+='\n> '+msg;}
    terminal.scrollTop=terminal.scrollHeight;
}

function typeWriter(text,callback){
    let i=0;
    const interval=setInterval(()=>{
        if(i<text.length){terminal.textContent+=text.charAt(i);i++;} 
        else{clearInterval(interval);if(callback)callback();}
    },50);
}

function processTerminalCommand(){
    if(!terminalInput.trim()) return;
    const command=terminalInput.trim().toLowerCase();
    commandHistory.push(command);
    historyIndex=commandHistory.length;
    log(`> ${terminalInput}`,true);

    setTimeout(()=>{
        switch(command){
            case 'help': log('commands: help, status, time, clear, matrix, particles, admin, ping, whoami, ls, cat, echo'); break;
            case 'status': log(`current status: ${statusText.textContent.replace('status: ','')}`); break;
            case 'time': log(new Date().toLocaleString()); break;
            case 'clear': terminal.textContent='> terminal cleared\n> ready for input'; break;
            case 'matrix': matrixEnabled=!matrixEnabled; log(matrixEnabled?'matrix rain activated':'matrix rain deactivated'); break;
            case 'particles': particlesEnabled=!particlesEnabled; log(`particles ${particlesEnabled?'enabled':'disabled'}`); break;
            case 'admin': if(!adminMode) enableAdminMode(); else log('admin mode already active'); break;
            case 'ping': log('pong'); break;
            case 'whoami': log('user: anonymous'); log('level: observer'); break;
            case 'ls': log('files: index.html, script.js, style.css'); log('directories: none'); break;
            case 'cat': log('usage: cat <filename>'); break;
            default:
                if(command.startsWith('echo ')) log(command.substring(5));
                else if(command.startsWith('cat ')){
                    const f=command.substring(4);
                    log(f==='index.html'?'file contents: HTML document':
                        f==='script.js'?'file contents: JavaScript code':
                        f==='style.css'?'file contents: CSS styles':'file not found: '+f);
                }
                else log(`command not found: ${command}`);
                break;
        }
    },500);

    terminalInput='';
    updateTerminalPrompt();
}

function updateTerminalPrompt(){
    const lines=terminal.textContent.split('\n');
    if(lines[lines.length-1].startsWith('> ')) lines[lines.length-1]='> '+terminalInput;
    else lines.push('> '+terminalInput);
    terminal.textContent=lines.join('\n');
    terminal.scrollTop=terminal.scrollHeight;
}

document.addEventListener('keydown',e=>{
    if(document.activeElement===document.body){
        if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){terminalInput+=e.key;updateTerminalPrompt();}
        else if(e.key==='Backspace'){terminalInput=terminalInput.slice(0,-1);updateTerminalPrompt();}
        else if(e.key==='Enter'){processTerminalCommand();}
        else if(e.key==='ArrowUp'){if(historyIndex>0){historyIndex--;terminalInput=commandHistory[historyIndex];updateTerminalPrompt();}}
        else if(e.key==='ArrowDown'){if(historyIndex<commandHistory.length-1){historyIndex++;terminalInput=commandHistory[historyIndex];updateTerminalPrompt();} else {historyIndex=commandHistory.length; terminalInput=''; updateTerminalPrompt();}}
    }
});

document.querySelectorAll('.cmd-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{terminalInput=btn.dataset.cmd; processTerminalCommand();});
});

/* ===================== SECRET ADMIN ===================== */
let adminMode=false;
function enableAdminMode(){
    adminMode=true;
    document.getElementById('secretOverlay').style.display='flex';
    secretSound.play().catch(()=>{});
}

/* ===================== MATRIX CANVAS ===================== */
const canvas=document.getElementById('animationCanvas');
const ctx=canvas.getContext('2d');
let w=canvas.width=window.innerWidth;
let h=canvas.height=window.innerHeight;
window.addEventListener('resize',()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;});

let matrixEnabled=false;
let particlesEnabled=false;

const columns=Math.floor(w/20);
const drops=Array(columns).fill(1);

function drawMatrix(){
    ctx.fillStyle='rgba(0,0,0,0.05)';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#0f0';
    ctx.font='15px monospace';
    for(let i=0;i<drops.length;i++){
        const text=String.fromCharCode(33+Math.random()*94);
        ctx.fillText(text,i*20,drops[i]*20);
        if(drops[i]*20>h && Math.random()>0.975) drops[i]=0;
        drops[i]++;
    }
}

function animate(){
    requestAnimationFrame(animate);
    if(matrixEnabled) drawMatrix();
}
animate();
