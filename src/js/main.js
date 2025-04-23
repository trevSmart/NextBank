'use strict';

// Function that executes when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    const assistantCard = document.querySelector('.dashboard-card.assistant');
    const resizeHandle = document.querySelector('.resize-handle');
    let isResizing = false;
    let startX;
    let startWidth;

    function startResize(e) {
        isResizing = true;
        startX = e.pageX;
        startWidth = assistantCard.offsetWidth;
        resizeHandle.classList.add('active');
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }

    function resize(e) {
        if (!isResizing) return;

        const width = startWidth - (e.pageX - startX);
        if (width >= 300 && width <= 800) {
            assistantCard.style.width = `${width}px`;
        }
    }

    function stopResize() {
        isResizing = false;
        resizeHandle.classList.remove('active');
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }

    resizeHandle.addEventListener('mousedown', startResize);
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

    // Move popover outside header
    document.body.appendChild(popover);

    function updatePopoverPosition() {
        const styleTransition = popover.style.transition;
        popover.style.transition = 'none';

        const buttonRect = supportButton.getBoundingClientRect();

        // Calculate position
        const top = buttonRect.bottom + window.scrollY + 12; // 12px margin
        const left = buttonRect.left + (buttonRect.width / 2);

        // Apply position
        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
        popover.style.transform = 'translateX(-50%)';

        popover.style.transition = styleTransition;
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
        }, 100); // Small delay to allow mouse to reach popover
    }

    // Handle visibility and position
    supportButton.addEventListener('mouseenter', showPopover);
    supportButton.addEventListener('mouseleave', hidePopover);

    popover.addEventListener('mouseenter', () => {
        if (timeoutId) clearTimeout(timeoutId);
        isPopoverVisible = true;
    });

    popover.addEventListener('mouseleave', () => {
        hidePopover();
    });

    // Update position on scroll and resize only if popover is visible
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