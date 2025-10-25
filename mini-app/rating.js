if (typeof RatingSystem === 'undefined') {
    class RatingSystem {
        constructor() {
        }

        async loadTopUsers() {
            const container = document.getElementById('top-users-list');
            if (container) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Загрузка рейтинга...</div>';
            }

            // Тестовые данные
            setTimeout(() => {
                const testUsers = [
                    { first_name: "Арсений Моисеев", approved_ideas: 15 },
                    { first_name: "Дмитрий Мурзаев", approved_ideas: 12 },
                    { first_name: "Владимир Мирошник", approved_ideas: 10 },
                    { first_name: "Поликарпова Таисия", approved_ideas: 8 },
                    { first_name: "Сергей Быстров", approved_ideas: 5 }
                ];
                this.renderTopUsers(testUsers);
            }, 500);
        }

        renderTopUsers(users) {
            const container = document.getElementById('top-users-list');
            if (!container) return;
            
            container.innerHTML = users.map((user, index) => `
                <div class="user-card">
                    <div class="user-avatar">
                        ${user.first_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="user-info">
                        <div class="user-name">${user.first_name}</div>
                        <div class="user-stats">Одобренных идей: ${user.approved_ideas}</div>
                    </div>
                    <div style="font-weight: bold; color: #1e3c72; font-size: 18px;">
                        #${index + 1}
                    </div>
                </div>
            `).join('');
        }
    }

    window.RatingSystem = RatingSystem;
}