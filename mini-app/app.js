class IdeaPlatform {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'ideas';
        this.isInitialized = false;
    }

    init(user) {
        this.currentUser = user;
        
        // Инициализация при первом запуске
        if (!this.isInitialized) {
            this.setupNavigation();
            this.loadCurrentTab();
            this.isInitialized = true;
        } else {
            // При повторной инициализации (например, после авторизации) перезагружаем текущую вкладку
            this.loadTabData(this.currentTab);
        }
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Устанавливаем активную вкладку по умолчанию
        const defaultTab = document.querySelector('.nav-btn[data-tab="ideas"]');
        if (defaultTab) {
            defaultTab.classList.add('active');
        }
    }

    switchTab(tabName) {
        // Скрываем все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const targetTab = document.getElementById(`${tabName}-tab`);
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        // Показываем/скрываем общий заголовок в зависимости от вкладки
        const header = document.querySelector('.header');
        if (header) {
            if (tabName === 'profile') {
                header.style.display = 'none';
            } else {
                header.style.display = 'block';
            }
        }
        
        if (targetTab && targetBtn) {
            targetTab.style.display = 'block';
            targetBtn.classList.add('active');
            this.currentTab = tabName;
            
            this.loadTabData(tabName);
        } else {
            console.error("Не найдена вкладка или кнопка:", tabName);
        }
    }

    loadCurrentTab() {
        const visibleTab = document.querySelector('.tab-content[style*="display: block"]');
        if (visibleTab) {
            const tabId = visibleTab.id.replace('-tab', '');
            this.loadTabData(tabId);
        } else {
            // Если нет видимой вкладки, загружаем вкладку по умолчанию
            this.loadTabData(this.currentTab);
        }
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'ideas':
                if (window.ideasManager) {
                    window.ideasManager.loadMyIdeas();
                }
                break;
            case 'rating':
                if (window.ratingSystem) {
                    window.ratingSystem.loadTopUsers();
                }
                break;
            case 'submit':
                if (window.ideasManager) {
                    window.ideasManager.bindEvents();
                }
                break;
            case 'profile':
                // Передаем текущего пользователя в профиль
                if (window.profileManager && window.auth && window.auth.user) {
                    window.profileManager.init(window.auth.user);
                } else if (window.currentAuthUser) {
                    // Используем глобального пользователя как fallback
                    window.profileManager.init(window.currentAuthUser);
                }
                break;
        }
    }
}

window.app = new IdeaPlatform();

if (window.currentAuthUser) {
    window.app.init(window.currentAuthUser);
}

// Простой менеджер вкладок который гарантированно работает
class TabManager {
    constructor() {
        this.setupTabs();
    }
    
    setupTabs() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-btn') || e.target.closest('.nav-btn')) {
                const button = e.target.classList.contains('nav-btn') ? e.target : e.target.closest('.nav-btn');
                const tabName = button.getAttribute('data-tab');
                
                // Убираем active у всех кнопок и вкладок
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Добавляем active к текущим
                button.classList.add('active');
                const tabElement = document.getElementById(`${tabName}-tab`);
                if (tabElement) {
                    tabElement.classList.add('active');
                    console.log(`Активирована вкладка: ${tabName}`);
                    
                    // Если это профиль - обновляем его
                    if (tabName === 'profile' && window.profileManager) {
                        setTimeout(() => window.profileManager.loadProfile(), 100);
                    }
                }
            }
        });
    }
}

// Инициализация менеджера вкладок
document.addEventListener('DOMContentLoaded', function() {
    window.tabManager = new TabManager();
});