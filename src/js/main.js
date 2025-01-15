function copyEmail() {
    navigator.clipboard.writeText('g.tigelaar@student.alfa-college.nl');

    setTimeout(() => {
        alert('Email copied to clipboard!');
    }, 100);
}

function applyTransition(element, action, duration = 200) {
    if (action === 'show') {
        element.style.transition = 'none';
        element.style.display = 'block';
        element.style.opacity = '0';
        element.style.filter = 'blur(5px)';

        setTimeout(() => {
            element.style.transition = `opacity ${duration}ms, filter ${duration}ms`;
            element.style.opacity = '1';
            element.style.filter = '';
        }, 20);
    } else if (action === 'hide') {
        element.style.transition = `opacity ${duration}ms, filter ${duration}ms`;
        element.style.opacity = '0';
        element.style.filter = 'blur(5px)';

        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
}

function addYear() {
    const year = document.getElementById('copyrightYear');
    year.innerText = parseInt(year.innerText) + 1;
}