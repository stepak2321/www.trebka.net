/* ===================== THEME ===================== */
const themeToggleButton = document.getElementById('theme-toggle');
const icon = themeToggleButton.querySelector('div');

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

/* ===================== STATUS ===================== */
const statusText = document.getElementById('statusText');
const states = ['idle','observing','analyzing','listening','scanning'];
setInterval(()=>{statusText.textContent='status: '+states[Math.floor(Math.random()*states.length)];},2500);

/* ===================== AUDIO ===================== */
const hoverSound = document.getElementById('hoverSound');
const secretSound = document.getElementById('secretSound');
const ambientSound = document.getElementById('ambientSound');
ambientSound.volume=0.15;
document.addEventListener('click',()=>{if(ambientSound.paused) ambientSound.play();},{once:true});

document.querySelectorAll('button, .image-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{hoverSound.currentTime=0; hoverSound.play();});
});

/* ===================== TERMINAL ===================== */
const terminal = document.getElementById('terminal');
function log(msg){terminal.textContent+=`\n> ${msg}`;}

/* ===================== IMAGE SECRET ===================== */
let imageClicks=0;
let adminMode=false;

document.getElementById('imageSecret').addEventListener('click',()=>{
    imageClicks++;
    log(`image ping ${imageClicks}`);
    if(imageClicks===6 && !adminMode) enableAdminMode();
});

/* ===================== KEY SECRET ===================== */
let buffer='';
document.addEventListener('keydown',e=>{
    buffer+=e.key.toLowerCase(); buffer=buffer.slice(-12);
    if(buffer.includes('admin')) enableAdminMode();
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
const hud=document.getElementById('hudOverlay');
let enemies=Math.floor(Math.random()*12);
setInterval(()=>{enemies=Math.floor(Math.random()*12); hud.textContent=`Enemies detected: ${enemies}`;},2000);

/* ===================== CANVAS ===================== */
const canvas=document.getElementById('animationCanvas');
const ctx=canvas.getContext('2d');
canvas.width=window.innerWidth;
canvas.height=130;
let circles=[];
let hue=0;

function createCircle(){
    let radius=Math.random()*3+3;
    let x=Math.random()*(canvas.width-radius*2)+radius;
    let y=Math.random()*(canvas.height-radius*2)+radius;
    let speedX=(Math.random()*2-1)*0.15;
    let speedY=(Math.random()*2-1)*0.15;
    if(Math.random()>0.8){speedX*=1.5; speedY*=1.5;}
    circles.push({x,y,radius,speedX,speedY});
}

function loadCircles(){
    let size=window.innerWidth/38.4;
    for(let i=0;i<size;i++) createCircle();
}

function updateCircles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.width=window.innerWidth;
    hue=(hue+0.3)%360;
    const color=`hsl(${hue},30%,75%)`;
    for(let c of circles){
        c.x+=c.speedX;
        c.y+=c.speedY;
        if(c.x+c.radius>canvas.width||c.x-c.radius<0) c.speedX*=-1;
        if(c.y+c.radius>canvas.height||c.y-c.radius<0) c.speedY*=-1;
        ctx.beginPath();
        ctx.arc(c.x,c.y,c.radius,0,Math.PI*2);
        ctx.fillStyle=color;
        ctx.fill();
    }
    for(let i=0;i<circles.length;i++){
        for(let j=i+1;j<circles.length;j++){
            let a=circles[i],b=circles[j]; let d=Math.hypot(b.x-a.x,b.y-a.y);
            if(d<150){ctx.strokeStyle=color; ctx.lineWidth=Math.max(1,5-d/30); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();}
        }
    }
    requestAnimationFrame(updateCircles);
}
loadCircles();
updateCircles();

/* ===================== ARG / SECRET LOG ===================== */
function startARG(){
    const messages=[
        "user detected",
        "session initialized",
        "rot13: gnpxvat guvf zrffntr",
        "base64: dHJlYmthLnNpdGVuYyBleHBlcmllbmNl",
        "scan complete",
        "alert: unknown process"
    ];
    let idx=0;
    setInterval(()=>{
        if(idx<messages.length) log(messages[idx++]);
    },1800);
}
