(function applyInitialTheme() {
    const currentTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (currentTheme === 'dark' || (!currentTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
})();

function setTheme(theme, init = false) {
    const html = document.documentElement;
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    const checks = {
        light: document.getElementById('themeCheck1'),
        dark: document.getElementById('themeCheck2'),
        system: document.getElementById('themeCheck3')
    };

    if (theme === 'light') {
        localStorage.setItem('theme', 'light');
        html.classList.remove('dark');
    } else if (theme === 'dark') {
        localStorage.setItem('theme', 'dark');
        html.classList.add('dark');
    } else {
        localStorage.removeItem('theme');
        updateSystemTheme();
    }

    moonIcon.classList.toggle('hidden', !html.classList.contains('dark'));
    sunIcon.classList.toggle('hidden', html.classList.contains('dark'));
    Object.keys(checks).forEach((key) => checks[key].classList.toggle('hidden', theme !== key));

    if (!init) {
        toggleThemePopup();
    }
}

function toggleThemePopup() {
    const themePopup = document.getElementById('themePopup');

    if (themePopup.classList.contains('hidden')) {
        themePopup.classList.remove('hidden');
        applyTransition(themePopup, 'show');
    } else {
        applyTransition(themePopup, 'hide');
        setTimeout(() => themePopup.classList.add('hidden'), 250);
    }
}

function updateSystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);

    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    const checks = {
        light: document.getElementById('themeCheck1'),
        dark: document.getElementById('themeCheck2'),
        system: document.getElementById('themeCheck3')
    };

    moonIcon.classList.toggle('hidden', !prefersDark);
    sunIcon.classList.toggle('hidden', prefersDark);
    Object.keys(checks).forEach((key) => checks[key].classList.toggle('hidden', key !== 'system'));
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('theme') || localStorage.getItem('theme') === 'system') {
        updateSystemTheme();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        setTheme(currentTheme, true);
    } else {
        updateSystemTheme();
    }
});