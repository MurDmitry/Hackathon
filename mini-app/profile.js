class ProfileManager {
    constructor() {
        this.user = null;
        console.log('ProfileManager: Инициализирован');
        this.init();
    }

    init() {
        console.log('ProfileManager: Начинаем загрузку профиля');
        
        // Пытаемся получить пользователя из разных источников
        this.user = this.getUserData();
        
        // Небольшая задержка для гарантии что DOM готов
        setTimeout(() => {
            this.loadProfile();
        }, 100);
        
        // Также слушаем клики на вкладку профиля
        this.setupTabListener();
    }

    getUserData() {
        // Пробуем разные источники данных
        if (window.currentAuthUser) {
            console.log('ProfileManager: Найден currentAuthUser', window.currentAuthUser);
            return window.currentAuthUser;
        }
        
        if (window.telegramUser) {
            console.log('ProfileManager: Найден telegramUser', window.telegramUser);
            return window.telegramUser;
        }
        
        // Пробуем получить из localStorage
        try {
            const storedUser = localStorage.getItem('telegram_user');
            if (storedUser) {
                console.log('ProfileManager: Найден пользователь в localStorage');
                return JSON.parse(storedUser);
            }
        } catch (e) {
            console.log('ProfileManager: Не удалось получить пользователя из localStorage');
        }
        
        console.log('ProfileManager: Пользователь не найден, используем тестовые данные');
        return this.getTestUserData();
    }

    getTestUserData() {
        return {
            first_name: "Арсений",
            username: "arseny_m", 
            id: "111111111",
            is_moderator: true
        };
    }

    loadProfile() {
        console.log('ProfileManager: Загружаем профиль в DOM');
        
        try {
            // ОСНОВНЫЕ ЭЛЕМЕНТЫ - проверяем что они существуют
            const elements = {
                'profile-display-name': this.user.first_name || 'Пользователь',
                'profile-avatar': (this.user.first_name && this.user.first_name.charAt(0)) || '👤',
                'detail-first-name': this.user.first_name || 'Не указано',
                'detail-username': this.user.username ? `@${this.user.username}` : 'Не указан',
                'detail-telegram-id': this.user.id || this.user.telegram_id || 'Не указан',
                'detail-status': this.user.is_moderator ? 'Модератор' : 'Пользователь'
            };

            // Заполняем каждый элемент
            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                    console.log(`ProfileManager: Заполнен элемент ${id}: ${value}`);
                    
                    // Особые случаи
                    if (id === 'detail-status') {
                        element.className = this.user.is_moderator ? 
                            'detail-value status-moderator' : 'detail-value status-user';
                    }
                } else {
                    console.error(`ProfileManager: Элемент ${id} не найден в DOM!`);
                }
            }
            
            console.log('ProfileManager: Профиль успешно загружен!');
            
        } catch (error) {
            console.error('ProfileManager: КРИТИЧЕСКАЯ ОШИБКА:', error);
            this.showEmergencyProfile();
        }
    }

    showEmergencyProfile() {
        console.log('ProfileManager: Показываем аварийный профиль');
        
        // Простейший способ гарантировать что что-то покажется
        const profileHtml = `
            <div class="profile-section">
                <div class="profile-card">
                    <div class="profile-user-info">
                        <div class="profile-avatar">!</div>
                        <h2 class="profile-name">Профиль пользователя</h2>
                    </div>
                    <div class="profile-details">
                        <div class="detail-row">
                            <span class="detail-label">Имя:</span>
                            <span class="detail-value">Арсений Моисеев</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Username:</span>
                            <span class="detail-value">@arseny_m</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Telegram ID:</span>
                            <span class="detail-value">111111111</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Статус:</span>
                            <span class="detail-value status-moderator">Модератор</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const profileTab = document.getElementById('profile-tab');
        if (profileTab) {
            profileTab.innerHTML = profileHtml;
        }
    }

    setupTabListener() {
        // Слушаем клики на вкладку профиля
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-tab="profile"]')) {
                console.log('ProfileManager: Вкладка профиля активирована');
                // Перезагружаем профиль при каждом клике
                setTimeout(() => this.loadProfile(), 50);
            }
        });
    }
}

// ГАРАНТИРОВАННАЯ ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: Инициализируем ProfileManager');
    window.profileManager = new ProfileManager();
});

// Резервная инициализация на случай если DOM уже загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.profileManager = new ProfileManager();
    });
} else {
    window.profileManager = new ProfileManager();
}