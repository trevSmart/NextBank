'use strict';

import AfClient from './components/agentforceClient/agentforceClient.js';
import './components/calendar/calendar.js';
import LoginComponent from './components/login/login.js';

let afClient = new AfClient({streaming: true, initialMessages: true, devMode: true});
let resizeCleanupFunctions = [];
let navigationCleanupFunctions = [];
let dragState = {xOffset: 0, yOffset: 0};

//DEMO: Si vols saltar-te el login, posa LOGIN_DISABLED a true
const LOGIN_DISABLED = true;

function initializeResizeHandling() {
	const assistantContainer = document.querySelector('.assistant-container');
	const resizeHandle = document.querySelector('.resize-handle');
	let isResizing = false;
	let startX;
	let startWidth;

	function resize(event) {
		if (!isResizing) {
			return;
		}

		const width = startWidth + (startX - event.pageX);
		const minWidth = 300;                       //safety lower‑bound
		const maxWidth = window.innerWidth - 100;   //keep some space on the page
		const clampedWidth = Math.min(Math.max(minWidth, width), maxWidth);
		assistantContainer.style.width = `${clampedWidth}px`;
		assistantContainer.style.flex = `0 0 ${clampedWidth}px`;
	}

	function stopResize(event) {
		if (!isResizing) {
			return;
		}

		//Apply the very last cursor position so we don't lose the final few pixels
		resize(event);

		isResizing = false;
		resizeHandle.classList.remove('active');
		document.removeEventListener('mousemove', resize);
		document.removeEventListener('mouseup', stopResize);
		//Lock the final width so the element doesn't contract after releasing the mouse.
		assistantContainer.style.flex = `0 0 ${assistantContainer.getBoundingClientRect().width}px`;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	}

	function startResize(e) {
		isResizing = true;
		startX = e.pageX;
		startWidth = assistantContainer.offsetWidth;
		//Ensure the current precise width is frozen so the flex/grid layout
		//doesn't recalculate it when the drag starts.
		startWidth = assistantContainer.getBoundingClientRect().width;
		assistantContainer.style.width = `${startWidth}px`;
		//Also lock the flex-basis so nothing else overrides the width mid‑drag.
		assistantContainer.style.flex = `0 0 ${startWidth}px`;
		resizeHandle.classList.add('active');
		document.addEventListener('mousemove', resize);
		document.addEventListener('mouseup', stopResize);
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	}

	if (resizeHandle) {
		resizeHandle.addEventListener('mousedown', startResize);
		resizeCleanupFunctions.push(() => {
			resizeHandle.removeEventListener('mousedown', startResize);
			document.removeEventListener('mousemove', resize);
			document.removeEventListener('mouseup', stopResize);
		});
	}
}

function drag(event) {
	if (!dragState.isDragging) {
		return;
	}

	const newX = event.clientX - dragState.initialX;
	const newY = event.clientY - dragState.initialY;

	//Si el ratolí no s'ha mogut, no cal demanar un nou frame
	if (newX === dragState.widgetLastX && newY === dragState.widgetLastY) {
		return;
	}

	dragState.currentX = newX;
	dragState.currentY = newY;

	if (!dragState.animationFrameId) {
		dragState.animationFrameId = requestAnimationFrame(() => {
			dragState.animationFrameId = null;

			dragState.xOffset = dragState.currentX;
			dragState.yOffset = dragState.currentY;

			const {minX, maxX, minY, maxY} = dragState.limits;

			dragState.xOffset = Math.min(Math.max(minX, dragState.xOffset), maxX);
			dragState.yOffset = Math.min(Math.max(minY, dragState.yOffset), maxY);

			dragState.widgetLastX = dragState.xOffset;
			dragState.widgetLastY = dragState.yOffset;

			const chatDetached = document.querySelector('.assistant-detached');
			chatDetached.style.transform = `translate3d(${dragState.xOffset}px, ${dragState.yOffset}px, 0)`;
		});
	}
}

function dragEnd() {
	dragState.isDragging = false;
	if (dragState.animationFrameId) {
		cancelAnimationFrame(dragState.animationFrameId);
		dragState.animationFrameId = null;
	}

	const assistantDetached = document.querySelector('.assistant-detached');
	assistantDetached.classList.remove('dragging');
	document.removeEventListener('mousemove', drag, false);
	document.removeEventListener('mouseup', dragEnd, false);
	document.removeEventListener('mousedown', dragStart, false);
}

function dragStart(event) {
	console.log('e.button:', event.button, 'e.type:', event.type);
	if (typeof event.button !== 'undefined' && event.button !== 0
	|| event.target.closest('.popoutChat')) {
		return;
	}

	const assistantDetached = document.querySelector('.assistant-detached');
	dragState.limits = {
		minX: -assistantDetached.offsetLeft + 20,
		maxX: window.innerWidth - (assistantDetached.offsetLeft + assistantDetached.offsetWidth) - 40,
		minY: -assistantDetached.offsetTop + 20,
		maxY: window.innerHeight - (assistantDetached.offsetTop + assistantDetached.offsetHeight) - 20
	};

	dragState.initialX = event.clientX - dragState.xOffset;
	dragState.initialY = event.clientY - dragState.yOffset;

	const assistantDetachedHeader = assistantDetached.querySelector('.assistant-detached-header');
	if (assistantDetachedHeader) {
		requestAnimationFrame(() => {
			document.body.style.userSelect = 'none';
			document.addEventListener('mousemove', drag, false);
			document.addEventListener('mouseup', dragEnd, false);
			assistantDetached.classList.add('dragging');
			dragState.isDragging = true;
			requestAnimationFrame(() => {
				document.addEventListener('mousedown', dragEnd, false);
			});
		});
	}
}

function cleanup() {
	if (localStorage.getItem('nextBankSalesforceAccessToken')) {
		afClient.endSession();
		localStorage.removeItem('nextBankSalesforceAccessToken');
	}

	//Netejar tots els event listeners
	resizeCleanupFunctions.forEach(fn => fn());
	navigationCleanupFunctions.forEach(fn => fn());


	//Buidar els arrays de cleanup
	resizeCleanupFunctions = [];
	navigationCleanupFunctions = [];
}

//Event listeners principals
window.addEventListener('load', () => {
	document.body.classList.remove('preload');
});

document.addEventListener('DOMContentLoaded', () => {
	//Inicialització de calendaris, listeners de navegació, etc. (sense assistants)

	const links = document.querySelectorAll('nav a');

	function handleClick(e) {
		e.preventDefault();
		links.forEach(l => l.classList.remove('active'));
		this.classList.add('active');
	}

	links.forEach(link => {
		link.addEventListener('click', handleClick);
		navigationCleanupFunctions.push(() => {
			link.removeEventListener('click', handleClick);
		});
	});

	const supportButton = document.querySelector('.support-button');
	const supportPopover = document.querySelector('.support-popover');

	if (supportButton && supportPopover) {
		const handleMouseEnter = () => supportPopover.classList.add('visible');
		const handleMouseLeave = () => supportPopover.classList.remove('visible');

		supportButton.addEventListener('mouseenter', handleMouseEnter);
		supportButton.addEventListener('mouseleave', handleMouseLeave);

		navigationCleanupFunctions.push(() => {
			supportButton.removeEventListener('mouseenter', handleMouseEnter);
			supportButton.removeEventListener('mouseleave', handleMouseLeave);
		});
	}

	const stockView = document.querySelector('.dashboard-card.stocks h2');
	if (stockView) {
		stockView.addEventListener('click', () => {
			document.querySelector('stock-chart').update();
		});
	}

	//Update random balance
	const balanceElement = document.querySelector('.saldo-amount');
	const changeElement = document.querySelector('.saldo-change');

	if (balanceElement && changeElement) {
		const percentageChange = (Math.random() - 0.5) * 1;
		const isPositive = percentageChange > 0;

		changeElement.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            ${percentageChange.toFixed(2)}% this month
        `;

		changeElement.className = `saldo-change ${isPositive ? 'positive' : 'negative'}`;
	}

	//Agentforce logo click handler
	const chatPoweredBy = document.querySelector('.chat-powered-by');
	if (chatPoweredBy) {
		chatPoweredBy.style.cursor = 'pointer';
		chatPoweredBy.addEventListener('click', () => {
			window.open('https://www.salesforce.com/eu/agentforce/', '_blank');
		});
		navigationCleanupFunctions.push(() => {
			chatPoweredBy.removeEventListener('click', () => {
				window.open('https://www.salesforce.com/eu/agentforce/', '_blank');
			});
		});
	}

	//this.initializeCalendar();

	initializeResizeHandling();

	window.addEventListener('beforeunload', cleanup);

	if (LOGIN_DISABLED) {
		//Inicialitza directament els assistants sense login
		document.dispatchEvent(new CustomEvent('loginSuccess', {
			detail: {
				timestamp: new Date(),
				user: 'demo-user'
			}
		}));
	} else {
		//Inicialitza el login només si LOGIN_DISABLED és false
		new LoginComponent();
	}
});

//Handler global per a l'event de loginSuccess

document.addEventListener('loginSuccess', event => {
	console.log('Login exitoso:', event.detail);
	//Inicialització dels assistants després del login
	afClient.newUiInstance(document.getElementById('assistant'));
	afClient.startSession();

	const assistantDetached = document.getElementById('assistant-detached');
	const assistantDetachedHeader = assistantDetached.querySelector('.assistant-detached-header');
	assistantDetachedHeader.addEventListener('mousedown', dragStart, false);

	const buttonPopoutChat = document.querySelectorAll('button.popoutChat');
	buttonPopoutChat.forEach(button => {
		button.addEventListener('click', () => {
			if (!afClient.getUiInstance('assistant-detached')) {
				afClient.newUiInstance(assistantDetached);
			}
			//Scroll to bottom abans de mostrar la versió flotant o tornar al xat fixat
			const willShowDetached = !assistantDetached.classList.contains('visible');
			const assistantContainer = document.querySelector('.assistant-container');
			const willShowFixed = assistantDetached.classList.contains('visible') && !assistantContainer.classList.contains('visible');

			if (willShowDetached) {
				const ui = afClient.getUiInstance('assistant-detached');
				if (ui) {ui.scrollToBottom(false)}
			}
			if (willShowFixed) {
				const ui = afClient.getUiInstance('assistant');
				if (ui) {ui.scrollToBottom(false)}
			}
			document.querySelector('.assistant-container').classList.toggle('visible');
			assistantDetached.classList.toggle('visible');
		});
	});

	const maximizeButton = assistantDetached.querySelector('.maximizeChat');
	if (maximizeButton) {
		maximizeButton.addEventListener('click', () => {
			//Paràmetres d'animació
			const duration = 800; //ms
			const ease = t => 1 - Math.pow(1 - t, 3); //cubic ease-out

			const el = assistantDetached;
			const isMaximizing = !el.classList.contains('maximized');

			//Estat inicial
			const rect = el.getBoundingClientRect();
			const initial = {
				width: rect.width,
				height: rect.height,
				top: rect.top,
				left: rect.left,
				transform: window.getComputedStyle(el).transform
			};

			//Estat final
			el.classList.toggle('maximized'); //aplica la classe per obtenir l'estat final
			const finalRect = el.getBoundingClientRect();
			const final = {
				width: finalRect.width,
				height: finalRect.height,
				top: finalRect.top,
				left: finalRect.left,
				transform: window.getComputedStyle(el).transform
			};
			el.classList.toggle('maximized'); //torna a l'estat original

			//Desactiva la transició CSS
			el.style.transition = 'none';
			el.classList.add('animating');

			//Posa l'estat inicial manualment
			el.style.width = initial.width + 'px';
			el.style.height = initial.height + 'px';
			el.style.top = initial.top + 'px';
			el.style.left = initial.left + 'px';
			el.style.transform = initial.transform;
			el.style.position = 'fixed';

			//Força reflow
			void el.offsetWidth;

			//Aplica la classe final (maximitzat o no)
			el.classList.toggle('maximized');

			const start = performance.now();
			function animate(now) {
				const t = Math.min((now - start) / duration, 1);
				const p = ease(t);
				el.style.width = initial.width + (final.width - initial.width) * p + 'px';
				el.style.height = initial.height + (final.height - initial.height) * p + 'px';
				el.style.top = initial.top + (final.top - initial.top) * p + 'px';
				el.style.left = initial.left + (final.left - initial.left) * p + 'px';
				//Si vols animar transform, descomenta:
				//el.style.transform = ...
				if (t < 1) {
					requestAnimationFrame(animate);
				} else {
					//Neteja: deixa l'estat final i reactiva la transició CSS
					el.style.transition = '';
					el.style.width = '';
					el.style.height = '';
					el.style.top = '';
					el.style.left = '';
					el.style.position = '';
					el.classList.remove('animating');
					//Ajusta drag/cursor com abans
					if (el.classList.contains('maximized')) {
						el.style.zIndex = 9999;
						el.style.resize = 'none';
						assistantDetachedHeader.style.cursor = 'default';
						assistantDetachedHeader.removeEventListener('mousedown', dragStart, false);
					} else {
						el.style.zIndex = '';
						el.style.resize = '';
						assistantDetachedHeader.style.cursor = 'move';
						assistantDetachedHeader.addEventListener('mousedown', dragStart, false);
						setTimeout(() => {
							const rect2 = el.getBoundingClientRect();
							let left = rect2.left, top = rect2.top;
							let width = rect2.width, height = rect2.height;
							const margin = 20;
							const maxLeft = window.innerWidth - width - margin;
							const maxTop = window.innerHeight - height - margin;
							let changed = false;
							if (left < margin) {left = margin; changed = true}
							if (top < margin) {top = margin; changed = true}
							if (left > maxLeft) {left = maxLeft; changed = true}
							if (top > maxTop) {top = maxTop; changed = true}
							if (width > window.innerWidth - margin * 2) {
								width = window.innerWidth - margin * 2; changed = true;
							}
							if (height > window.innerHeight - margin * 2) {
								height = window.innerHeight - margin * 2; changed = true;
							}
							if (changed) {
								el.style.left = left + 'px';
								el.style.top = top + 'px';
								el.style.width = width + 'px';
								el.style.height = height + 'px';
								el.style.transform = '';
							}
						}, 260);
					}
				}
			}
			requestAnimationFrame(animate);
		});
		assistantDetachedHeader.style.cursor = assistantDetached.classList.contains('maximized') ? 'default' : 'move';
	}

	//Aquí pots afegir lògica addicional després del login

	//Afegeix la classe .userLoginSuccess al body
	document.body.classList.add('userLoginSuccess');
});

const throttle = (fn, ms) => {
	let t = false;
	return (...a) => {if (!t) {fn(...a); t = setTimeout(() => t = false, ms)}};
};

const stockCard = document.querySelector('.dashboard-card.stocks');
if (stockCard) {
	const stockCardObserver = new ResizeObserver(throttle(() => {
		document.querySelector('stock-chart').update('none');
	}, 500));
	stockCardObserver.observe(stockCard);
}


//Funcions de navegació del calendari
function loadDaySchedule() {
	const calDevice = document.querySelector('calendar-component').shadowRoot.querySelector('.cal-device');
	if (calDevice) {
		//Afegim la classe que mostra la vista d'agenda
		calDevice.querySelector('.cal-bar .-schedule').style.opacity = '1';
		calDevice.querySelector('.cal-bar .-calendar').style.opacity = '0';
		calDevice.querySelector('.cal-scene.-schedule').style.opacity = '1';
		calDevice.querySelector('.cal-scene.-schedule').style.zIndex = '2';
	}
}

function showMainView() {
	const calDevice = document.querySelector('calendar-component').shadowRoot.querySelector('.cal-device');
	if (calDevice) {
		//Tornem a la vista principal
		calDevice.querySelector('.cal-scene.-calendar').style.opacity = '1';
		calDevice.querySelector('.cal-scene.-calendar').style.zIndex = '1';
		calDevice.querySelector('.cal-bar .-schedule').style.opacity = '0';
		calDevice.querySelector('.cal-bar .-calendar').style.opacity = '1';
		calDevice.querySelector('.cal-scene.-schedule').style.opacity = '0';
		calDevice.querySelector('.cal-scene.-schedule').style.zIndex = '-1';

		//Resetegem la posició dels mesos
		const months = calDevice.querySelectorAll('.cal-month');
		months.forEach(month => {
			month.style.transform = '';
			month.querySelectorAll('.cal-header').forEach(header => {
				header.style.transform = '';
				header.style.opacity = '';
			});
		});
	}
}

function loadWeekSchedule(weekId) {
	const calDevice = document.querySelector('calendar-component').shadowRoot.querySelector('.cal-device');
	if (!calDevice) {return}

	const [month, week] = weekId.split('-');
	const monthElement = calDevice.querySelector(`.cal-month.-${month}`);
	if (!monthElement) {return}

	//Resetegem primer tot
	showMainView();

	//Preparem variables que podrem necessitar
	const octHeader = calDevice.querySelector('.cal-month.-october .cal-header');

	//Apliquem les transformacions segons la setmana
	switch (weekId) {
		case 'oct-week-3':
			calDevice.querySelector('.cal-app').style.background = 'linear-gradient(shadows(1, true))';
			break;

		case 'oct-week-4':
			monthElement.style.transform = 'translateY(-' + monthElement.offsetHeight + 'px)';
			monthElement.querySelector('.cal-header').style.transform =
				'translateY(' + monthElement.offsetHeight + 'px) translateX(' + monthElement.offsetWidth * 4 / 7 + 'px)';
			calDevice.querySelector('.cal-scene.-calendar').style.boxShadow = 'shadows(2)';
			calDevice.querySelector('.cal-app').style.background = 'linear-gradient(shadows(2, true))';
			break;

		case 'nov-week-1':
			monthElement.style.transform = 'translateY(-' + monthElement.offsetHeight * 2 + 'px)';
			if (octHeader) {
				octHeader.style.transform = 'translateY(' + monthElement.offsetHeight + 'px) translateX(' + monthElement.offsetWidth * 4 / 7 + 'px)';
				octHeader.style.opacity = '0';
			}

			//Activem desembre i desactivem novembre
			calDevice.querySelector('.cal-month.-december').classList.add('active-month');
			calDevice.querySelector('.cal-month.-november').classList.remove('active-month');

			calDevice.querySelector('.cal-app').style.background = 'linear-gradient(shadows(3, true))';
			calDevice.querySelector('.cal-scene.-calendar').style.boxShadow = 'shadows(3)';
			break;

		default:
			calDevice.querySelector('.cal-app').style.background = 'linear-gradient(shadows(1, true))';
			calDevice.querySelector('.cal-scene.-calendar').style.boxShadow = 'shadows(1)';
			break;
	}
}