class LoginComponent {
	constructor() {
		this.isVisible = true;
		this.init();
	}

	init() {
		this.createLoginHTML();
		this.bindEvents();
	}

	createLoginHTML() {
		const loginHTML = `
            <div class="login-overlay" id="loginOverlay">
                <div class="login-container">
                    <div class="login-logo">
                        <img src="../src/assets/images/logo.webp" alt="NextBank Logo" draggable="false">
                        <span>NextBank</span>
                    </div>

                    <form class="login-form" id="loginForm">
                        <div class="form-group">
                            <label for="username">Your email address</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value="elizabeth@mail.com"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value="xK9mP2$vL8nQ4@jR7"
                                required
                            >
                        </div>

                        <div class="error-message" id="errorMessage">
                            Email or password incorrect
                        </div>

                        <button type="submit" class="login-button" id="loginButton">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;

		//Insertar el HTML al final del body
		document.body.insertAdjacentHTML('beforeend', loginHTML);
	}

	bindEvents() {
		const form = document.getElementById('loginForm');
		const usernameInput = document.getElementById('username');
		const passwordInput = document.getElementById('password');
		const errorMessage = document.getElementById('errorMessage');

		//Manejar envío del formulario
		form.addEventListener('submit', e => {
			e.preventDefault();
			this.handleLogin();
		});

		//Limpiar error cuando el usuario empiece a escribir
		[usernameInput, passwordInput].forEach(input => {
			input.addEventListener('input', () => {
				this.hideError();
			});
		});

		//Permitir login con Enter
		[usernameInput, passwordInput].forEach(input => {
			input.addEventListener('keypress', e => {
				if (e.key === 'Enter') {
					this.handleLogin();
				}
			});
		});
	}

	handleLogin() {
		const username = document.getElementById('username').value.trim();
		const password = document.getElementById('password').value.trim();
		const loginButton = document.getElementById('loginButton');

		//Validación básica
		if (!username || !password) {
			this.showError('Por favor, completa todos los campos');
			return;
		}

		//Simular proceso de login
		this.setLoadingState(true);

		//Simular delay de autenticación
		setTimeout(() => {
			//Aquí puedes agregar tu lógica de autenticación real
			if (this.validateCredentials(username, password)) {
				this.loginSuccess();
			} else {
				this.showError('Usuario o contraseña incorrectos');
				this.setLoadingState(false);
			}
		}, 1000);
	}

	validateCredentials(username, password) {
		//Credenciales de ejemplo para testing
		//En producción, esto debería conectarse a tu backend
		const validCredentials = [
			{username: 'elizabeth@mail.com', password: 'xK9mP2$vL8nQ4@jR7'}
		];

		return validCredentials.some(cred =>
			cred.username === username && cred.password === password);
	}

	setLoadingState(isLoading) {
		const loginButton = document.getElementById('loginButton');
		if (!loginButton) {return}

		if (isLoading) {
			//Desa el contingut original si no està desat
			if (!loginButton.dataset.originalContent) {
				loginButton.dataset.originalContent = loginButton.innerHTML;
			}
			loginButton.disabled = true;
			loginButton.classList.add('loading-spinner');
			loginButton.innerHTML = '<span class="spinner"></span>';
		} else {
			loginButton.disabled = false;
			loginButton.classList.remove('loading-spinner');
			if (loginButton.dataset.originalContent) {
				loginButton.innerHTML = loginButton.dataset.originalContent;
				delete loginButton.dataset.originalContent;
			}
		}
	}

	showError(message) {
		const errorMessage = document.getElementById('errorMessage');
		errorMessage.textContent = message;
		errorMessage.classList.add('show');
	}

	hideError() {
		const errorMessage = document.getElementById('errorMessage');
		errorMessage.classList.remove('show');
	}

	loginSuccess() {
		//Ocultar el overlay de login con animación
		const overlay = document.getElementById('loginOverlay');
		const usernameValue = document.getElementById('username').value;
		overlay.classList.add('hidden');

		//Después de la animación, eliminar completamente el componente
		setTimeout(() => {
			overlay.remove();
			this.isVisible = false;

			//Emitir evento de login exitoso
			this.dispatchLoginEvent(usernameValue);
		}, 300);
	}

	dispatchLoginEvent(username) {
		//Emitir evento personalizado para que otros componentes sepan que el login fue exitoso
		const loginEvent = new CustomEvent('loginSuccess', {
			detail: {
				timestamp: new Date(),
				user: username
			}
		});
		document.dispatchEvent(loginEvent);
	}

	//Método público para mostrar el login desde fuera
	show() {
		if (!this.isVisible) {
			this.init();
		}
	}

	//Método público para ocultar el login desde fuera
	hide() {
		if (this.isVisible) {
			const overlay = document.getElementById('loginOverlay');
			if (overlay) {
				overlay.classList.add('hidden');
				setTimeout(() => {
					overlay.remove();
					this.isVisible = false;
				}, 300);
			}
		}
	}
}

//Exportar la clase para uso en otros módulos
export default LoginComponent;