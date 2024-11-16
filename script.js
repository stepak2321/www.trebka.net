// Funkce pro přepínání mezi tmavým a světlým režimem
const themeToggleButton = document.getElementById('theme-toggle');

// Funkce, která přepne třídu 'dark-mode' na těle stránky
themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});
