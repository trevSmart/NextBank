'use strict';

import AfClient from './components/agentforceClient/agentforceClient.js';
import './components/calendar/calendar.js';

let afClient = new AfClient();
let resizeCleanupFunctions = [];
let navigationCleanupFunctions = [];
let dragState = {xOffset: 0, yOffset: 0};

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
		//doesn’t recalculate it when the drag starts.
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

function dragEnd(event) {
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
			document.querySelector('.assistant-container').classList.toggle('visible');
			assistantDetached.classList.toggle('visible');
		});
	});

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

	//this.initializeCalendar();

	initializeResizeHandling();

	window.addEventListener('beforeunload', cleanup);
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