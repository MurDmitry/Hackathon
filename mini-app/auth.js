class Auth {
    constructor() {
        this.user = null;
        setTimeout(() => this.init(), 100);
    }

    init() {
        // Автоматически использую тестового пользователя
        this.user = {
            id: 111111111,
            first_name: "Арсений Моисеев",
            username: "arseny_m",
            is_moderator: true
        };
        
        // Сохраняем пользователя для глобального доступа
        window.currentAuthUser = this.user;
        
        this.initManagers();
        this.startApp();
    }

    initManagers() {
        if (typeof IdeasManager !== 'undefined') {
            window.ideasManager = new IdeasManager(this.user);
        }
        
        if (typeof RatingSystem !== 'undefined') {
            window.ratingSystem = new RatingSystem();
        }

        // Инициализируем ProfileManager
        if (window.profileManager) {
            window.profileManager.init(this.user);
        }
    }

    startApp() {
        const checkApp = () => {
            if (window.app && typeof window.app.init === 'function') {
                window.app.init(this.user);
            } else {
                setTimeout(checkApp, 50);
            }
        };
        checkApp();
    }
}

// Запускаем авторизацию когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Auth());
} else {
    new Auth();
}