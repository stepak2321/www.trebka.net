const themeToggleButton = document.getElementById('theme-toggle');
document.body.classList.add('no-transition');

const savedTheme = localStorage.getItem('theme');
const icon = themeToggleButton.querySelector('div');

if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    icon.classList.replace('fa-sun', 'fa-moon');
} else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    icon.classList.replace('fa-sun', 'fa-moon');
    document.body.classList.add('dark-mode');
}

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    }
});


const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = 130;

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

function saveCircles() {
    localStorage.setItem('circlesData', JSON.stringify(circles));
}

function loadCircles() {
    const savedCircles = localStorage.getItem('circlesData');
    if (savedCircles) {
        circles = JSON.parse(savedCircles);
    } else {
        let size = window.innerWidth / 38.4;
        for (let i = 0; i < size; i++) {
            createCircle();
        }
    }
}

function updateCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;

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

loadCircles();

updateCircles();

window.addEventListener('beforeunload', saveCircles);
