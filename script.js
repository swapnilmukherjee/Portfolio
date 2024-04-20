function toggleMenu() {
    const menuLinks = document.querySelector('.menu-links');
    if (menuLinks.style.display === 'block') {
        menuLinks.style.display = 'none';
        menuLinks.style.animation = 'slideOut 0.5s forwards';
    } else {
        menuLinks.style.display = 'block';
        menuLinks.style.animation = 'slideIn 0.5s forwards';
    }
}

@keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
}

@keyframes slideOut {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
}
