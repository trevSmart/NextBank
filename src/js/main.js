'use strict';

// Funció que s'executa quan el DOM està completament carregat
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

function initializeDashboard() {
    // Initialize components
    initializeNavigation();
    initializeCards();
    initializeSupportPopover();

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

function initializeSupportPopover() {
    const supportButton = document.querySelector('.support-button');
    const popover = document.querySelector('.support-popover');
    let isPopoverVisible = false;
    let timeoutId = null;

    // Movem el popover fora del header
    document.body.appendChild(popover);

    function updatePopoverPosition() {
        const buttonRect = supportButton.getBoundingClientRect();

        // Calculem la posició
        const top = buttonRect.bottom + window.scrollY + 12; // 12px de marge
        const left = buttonRect.left + (buttonRect.width / 2);

        // Apliquem la posició
        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
        popover.style.transform = 'translateX(-50%)';
    }

    function showPopover() {
        if (timeoutId) clearTimeout(timeoutId);
        updatePopoverPosition();
        isPopoverVisible = true;
        popover.classList.add('visible');
    }

    function hidePopover() {
        timeoutId = setTimeout(() => {
            isPopoverVisible = false;
            popover.classList.remove('visible');
        }, 100); // Petit delay per permetre que el ratolí arribi al popover
    }

    // Gestionar la visibilitat i posició
    supportButton.addEventListener('mouseenter', showPopover);
    supportButton.addEventListener('mouseleave', hidePopover);

    popover.addEventListener('mouseenter', () => {
        if (timeoutId) clearTimeout(timeoutId);
        isPopoverVisible = true;
    });

    popover.addEventListener('mouseleave', () => {
        hidePopover();
    });

    // Actualitzar posició en scroll i resize només si el popover és visible
    window.addEventListener('scroll', () => {
        if (isPopoverVisible) updatePopoverPosition();
    });
    window.addEventListener('resize', () => {
        if (isPopoverVisible) updatePopoverPosition();
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