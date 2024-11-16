const themeToggleButton = document.getElementById('theme-toggle');

// Temporarily disable transitions
document.body.classList.add('no-transition');

// Check and apply the saved theme or system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
} else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

// Remove the no-transition class after the theme is applied
window.addEventListener('load', () => {
    document.body.classList.remove('no-transition');
});

// Toggle dark mode and save the user's choice
themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});


// Canvas pro pohybující se kolečka
const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let circles = [];

// Generování náhodných koleček s různými rychlostmi a velikostmi
function createCircle() {
    let radius = Math.random() * 3 + 3;  // Menší kolečka (radius 3-6 px)
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;
    let speedX = (Math.random() * 2 - 1) * 0.2;  // Zpomalíme pohyb
    let speedY = (Math.random() * 2 - 1) * 0.2;  // Zpomalíme pohyb

    // Náhodné zvýšení rychlosti pro některá kolečka (rychlá kolečka)
    if (Math.random() > 0.8) {  // 20% šance na rychlé pohybující se kolečko
        speedX *= 1.5;
        speedY *= 1.5;
    }

    circles.push({ x, y, radius, speedX, speedY });
}

// Aktualizace a vykreslení koleček
function updateCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vykreslení koleček
    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];

        // Pohyb kolečka
        circle.x += circle.speedX;
        circle.y += circle.speedY;

        // Odražení od stěn
        if (circle.x + circle.radius > canvas.width || circle.x - circle.radius < 0) {
            circle.speedX = -circle.speedX;
        }
        if (circle.y + circle.radius > canvas.height || circle.y - circle.radius < 0) {
            circle.speedY = -circle.speedY;
        }

        // Vykreslení kolečka
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);  // Používáme arc pro kulatý tvar
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';  // Bílé kolečko
        ctx.fill();
        ctx.closePath();
    }

    // Vykreslení čar mezi blízkými kolečky
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let circle1 = circles[i];
            let circle2 = circles[j];
            let dist = Math.hypot(circle2.x - circle1.x, circle2.y - circle1.y);

            // Zajistíme, že se čáry budou kreslit mezi kolečky, která jsou dostatečně blízko
            if (dist < 150) {
                // Vypočítání šířky čáry na základě vzdálenosti mezi kolečky
                let lineWidth = Math.max(1, 5 - dist / 30); // čára bude širší, když jsou kolečka blízko

                // Nastavení čáry
                ctx.beginPath();
                ctx.moveTo(circle1.x, circle1.y);
                ctx.lineTo(circle2.x, circle2.y);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';  // Poloprůhledné čáry
                ctx.lineWidth = lineWidth;  // Nastavení šířky čáry
                ctx.lineCap = 'round';  // Zaoblené okraje čáry
                ctx.setLineDash([]);  // Souvislá čára (bez přerušení)
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    requestAnimationFrame(updateCircles);
}

// Spuštění animace
for (let i = 0; i < 50; i++) {  // Můžeš upravit počet koleček
    createCircle();
}

updateCircles();


