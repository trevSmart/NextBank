'use strict';

// Funció que s'executa quan el DOM està completament carregat
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

function initializeDashboard() {
    // Initialize components
    initializeNavigation();
    initializeCards();

    // Simulate real-time updates
    simulateDataUpdates();
}

function initializeNavigation() {
    const links = document.querySelectorAll('nav a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all links
            links.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Here we could add real navigation
            showDevelopmentMessage(link.textContent.trim());
        });
    });
}

function initializeCards() {
    const cards = document.querySelectorAll('.targeta-preview');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.02)';
            card.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });
}

function simulateDataUpdates() {
    // Simulate balance updates every 30 seconds
    setInterval(() => {
        updateRandomBalance();
    }, 30000);
}

function updateRandomBalance() {
    const balanceElement = document.querySelector('.saldo-amount');
    const changeElement = document.querySelector('.saldo-change');

    if (balanceElement && changeElement) {
        // Simulate a random change between -0.5% and +0.5%
        const percentageChange = (Math.random() - 0.5) * 1;
        const isPositive = percentageChange > 0;

        changeElement.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            ${percentageChange.toFixed(2)}% this month
        `;

        changeElement.className = `saldo-change ${isPositive ? 'positive' : 'negative'}`;
    }
}

function showDevelopmentMessage(section) {
    console.log(`Navigating to section: ${section}`);
    // Here we could implement a visual notification system
}