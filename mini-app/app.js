class IdeaPlatform {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'ideas';
    }

    init(user) {
        this.currentUser = user;
        this.setupNavigation();
        this.loadCurrentTab();
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
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const targetTab = document.getElementById(`${tabName}-tab`);
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
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
        this.loadTabData(this.currentTab);
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
        }
    }
}

// Создаем глобальный экземпляр приложения
console.log("🔄 Создание глобального app...");
window.app = new IdeaPlatform();