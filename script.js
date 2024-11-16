const themeToggleButton = document.getElementById('theme-toggle');
document.body.classList.add('no-transition');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
} else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

window.addEventListener('load', () => {
    document.body.classList.remove('no-transition');
});

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});


const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = 150;

let circles = [];

function createCircle() {
    let radius = Math.random() * 3 + 3;
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;
    let speedX = (Math.random() * 2 - 1) * 0.15;
    let speedY = (Math.random() * 2 - 1) * 0.15;

    if (Math.random() > 0.8) {
        speedX *= 1.5;
        speedY *= 1.5;
    }

    circles.push({ x, y, radius, speedX, speedY });
}


function updateCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];

        circle.x += circle.speedX;
        circle.y += circle.speedY;

        if (circle.x + circle.radius > canvas.width || circle.x - circle.radius < 0) {
            circle.speedX = -circle.speedX;
        }
        if (circle.y + circle.radius > canvas.height || circle.y - circle.radius < 0) {
            circle.speedY = -circle.speedY;
        }

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(198, 198, 198, 1)';
        ctx.fill();
        ctx.closePath();
    }

    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let circle1 = circles[i];
            let circle2 = circles[j];
            let dist = Math.hypot(circle2.x - circle1.x, circle2.y - circle1.y);

            if (dist < 150) {
                let lineWidth = Math.max(1, 5 - dist / 30);

                ctx.beginPath();
                ctx.moveTo(circle1.x, circle1.y);
                ctx.lineTo(circle2.x, circle2.y);
                ctx.strokeStyle = 'rgba(198, 198, 198, 0.8)';
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';
                ctx.setLineDash([]);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    requestAnimationFrame(updateCircles);
}

for (let i = 0; i < 50; i++) {
    createCircle();
}

updateCircles();


