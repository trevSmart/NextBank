// Chat Widget Controller
const ChatWidget = {
    elements: {
        widget: null,
        messages: null,
        input: null,
        chatButton: null,
        chatContainer: null,
        dragState: {
            isDragging: false,
            currentX: 0,
            currentY: 0,
            initialX: 0,
            initialY: 0,
            xOffset: 0,
            yOffset: 0,
            initialRect: null,
            animationFrameId: null,
            lastFrameTime: 0,
            widgetLastX: 0,
            widgetLastY: 0,
            limits: null
        },
        isOpen: false,
        isLoaded: false
    },

    init() {
        this.elements.chatContainer = document.getElementById('chatContainer');
        if (!this.elements.chatContainer) {
            console.error('No s\'ha trobat el contenidor del xat');
            return;
        }

        this.elements.chatButton = document.querySelector('.support-button');
        if (this.elements.chatButton) {
            this.elements.chatButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.elements.isLoaded) {
                    this.loadAndShowChat();
                } else if (!this.elements.isOpen) {
                    this.toggle();
                }
            });
        } else {
            console.error('No s\'ha trobat el botó de xat');
        }
    },

    loadAndShowChat() {
        if (this.elements.isLoaded) return;

        fetch('components/chat/chat.html')
            .then(response => {
                if (!response.ok) throw new Error('No s\'ha pogut carregar el xat');
                return response.text();
            })
            .then(html => {
                this.elements.chatContainer.innerHTML = html;
                this.elements.isLoaded = true;
                this.cacheElements();
                this.setupEventListeners();
            })
            .catch(error => {
                console.error('Error carregant el xat:', error);
                this.elements.isLoaded = false;
            });
    },

    cacheElements() {
        this.elements.widget = document.getElementById('chatWidget');
        this.elements.messages = document.querySelector('.chat-messages');
        this.elements.input = document.getElementById('chatInput');
    },

    setupEventListeners() {
        this.elements.isOpen = false;

        if (this.elements.messages) {
            this.elements.messages.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 100));
        }

        if (this.elements.input) {
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (this.elements.widget) {
            const closeButton = this.elements.widget.querySelector('.chat-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.toggle());
            }

            const sendButton = this.elements.widget.querySelector('.send-button');
            if (sendButton) {
                sendButton.addEventListener('click', () => this.sendMessage());
            }

            const chatHeader = this.elements.widget.querySelector('.chat-header');
            if (chatHeader) {
                chatHeader.addEventListener('selectstart', (e) => e.preventDefault());
            }
        }

        this.initDragListeners();
    },

    initDragListeners() {
        if (this._dragListenersInitialized) return;
        this._dragListenersInitialized = true;

        const chatHeader = this.elements.widget.querySelector('.chat-header');
        if (!chatHeader) return;

        this._dragMouseMove = this.drag.bind(this);
        this._dragMouseUp = this.dragEnd.bind(this);

        chatHeader.addEventListener('mousedown', this.dragStart.bind(this), false);
    },

    toggle() {
        if (!this.elements.widget || !this.elements.isLoaded) return;

        const isOpen = this.elements.widget.classList.contains('chat-widget-open');

        if (isOpen) {
            this.elements.isOpen = false;
            requestAnimationFrame(() => {
                this.elements.widget.classList.add('chat-widget-closing');

                const handleTransitionEnd = () => {
                    this.elements.widget.classList.remove('chat-widget-open');
                    this.elements.widget.classList.remove('chat-widget-closing');
                    this.elements.widget.removeEventListener('transitionend', handleTransitionEnd);
                };

                this.elements.widget.addEventListener('transitionend', handleTransitionEnd, { once: true });
            });
        } else if (!this.elements.isOpen) {
            this.elements.isOpen = true;
            requestAnimationFrame(() => {
                this.elements.widget.classList.add('chat-widget-open');
            });
        }
    },

    sendMessage() {
        const input = this.elements.input;
        if (!input) return;

        const message = input.value.trim();
        if (message) {
            this.addUserMessage(message);
            input.value = '';

            setTimeout(() => {
                this.addAgentMessage("Thank you for your message. I'll help you with that.");
            }, 1000);
        }
    },

    addUserMessage(text) {
        if (!this.elements.messages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.style.alignSelf = 'flex-end';
        messageDiv.style.background = 'var(--primary-gradient)';
        messageDiv.style.color = 'white';

        const fragment = document.createDocumentFragment();
        messageDiv.textContent = text;
        fragment.appendChild(messageDiv);

        requestAnimationFrame(() => {
            this.elements.messages.appendChild(fragment);
            this.scrollToBottom();
        });
    },

    addAgentMessage(text) {
        if (!this.elements.messages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message agent';

        const fragment = document.createDocumentFragment();
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-headset"></i>
            </div>
            <div class="message-content">
                <div class="message-name">Sarah</div>
                <div class="message-text">${text}</div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;
        fragment.appendChild(messageDiv);

        requestAnimationFrame(() => {
            this.elements.messages.appendChild(fragment);
            this.scrollToBottom();
        });
    },

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
    },

    scrollToBottom() {
        if (!this.elements.messages) return;
        requestAnimationFrame(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        });
    },

    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    handleScroll() {
        // Espai per carregar més missatges antics, si cal
    },

    dragStart(e) {
        const { dragState } = this.elements;

        dragState.limits = {
            minX: - (this.elements.widget.offsetLeft) + 20,
            maxX: window.innerWidth - (this.elements.widget.offsetLeft + this.elements.widget.offsetWidth) - 20,
            minY: - (this.elements.widget.offsetTop) + 20,
            maxY: window.innerHeight - (this.elements.widget.offsetTop + this.elements.widget.offsetHeight) - 20
        };

        dragState.initialX = e.clientX - dragState.xOffset;
        dragState.initialY = e.clientY - dragState.yOffset;

        if (e.target.closest('.chat-header')) {
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', this._dragMouseMove, false);
            document.addEventListener('mouseup', this._dragMouseUp, false);
            dragState.isDragging = true;
            this.elements.widget.style.transition = 'none';
            this.elements.widget.style.willChange = 'transform';
        }
    },

    dragEnd() {
        const { dragState } = this.elements;
        dragState.isDragging = false;

        if (dragState.animationFrameId) {
            cancelAnimationFrame(dragState.animationFrameId);
            dragState.animationFrameId = null;
        }

        this.elements.widget.style.transition = '';
        this.elements.widget.style.willChange = 'auto';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', this._dragMouseMove, false);
        document.removeEventListener('mouseup', this._dragMouseUp, false);
    },

    drag(e) {
        const { dragState } = this.elements;
        if (!dragState.isDragging) return;
        e.preventDefault();

        dragState.currentX = e.clientX - dragState.initialX;
        dragState.currentY = e.clientY - dragState.initialY;

        if (!dragState.animationFrameId) {
            dragState.animationFrameId = requestAnimationFrame(() => this.updatePosition());
        }
    },

    updatePosition() {
        const { dragState } = this.elements;
        dragState.animationFrameId = null;

        dragState.xOffset = dragState.currentX;
        dragState.yOffset = dragState.currentY;

        const { minX, maxX, minY, maxY } = dragState.limits;

        dragState.xOffset = Math.min(Math.max(minX, dragState.xOffset), maxX);
        dragState.yOffset = Math.min(Math.max(minY, dragState.yOffset), maxY);

        if (dragState.widgetLastX === dragState.xOffset && dragState.widgetLastY === dragState.yOffset) {
            return;
        }

        dragState.widgetLastX = dragState.xOffset;
        dragState.widgetLastY = dragState.yOffset;

        this.elements.widget.style.transform = `translate3d(${dragState.xOffset}px, ${dragState.yOffset}px, 0)`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ChatWidget.init();
});