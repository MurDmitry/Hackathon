class IdeasManager {
    constructor(user) {
        this.user = user;
        this.isFormBound = false;
        setTimeout(() => this.bindEvents(), 200);
    }

    bindEvents() {
        if (this.isFormBound) {
            return;
        }

        const ideaForm = document.getElementById('idea-form');
        if (ideaForm) {
            ideaForm.removeEventListener('submit', this.handleIdeaSubmit.bind(this));
            
            ideaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleIdeaSubmit(e);
            });
            
            this.isFormBound = true;
        } else {
            setTimeout(() => this.bindEvents(), 500);
        }
    }

    async handleIdeaSubmit(e) {
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';
        }

        const formData = new FormData(e.target);
        const ideaData = {
            description: formData.get('description'),
            justification: formData.get('justification'),
            evidence_link: formData.get('evidence_link'),
            is_anonymous: formData.get('is_anonymous') === 'on',
            user_id: this.user.id
        };

        if (!ideaData.description || ideaData.description.trim().length < 10) {
            alert('Пожалуйста, опишите идею более подробно (минимум 10 символов)');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Отправить на рассмотрение';
            }
            return;
        }

        try {
            const response = await this.submitIdeaToAPI(ideaData);
            
            if (response && response.id) {
                e.target.reset();
                
                this.loadMyIdeas();
                
                if (window.app) {
                    setTimeout(() => {
                        window.app.switchTab('ideas');
                    }, 500);
                }
            } else {
                throw new Error('Не удалось сохранить идею');
            }
            
        } catch (error) {
            console.error('Ошибка отправки идеи:', error);
            alert('Ошибка при отправке идеи: ' + error.message);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Отправить на рассмотрение';
            }
        }
    }

    async submitIdeaToAPI(ideaData) {
        try {
            const API_BASE = window.location.origin;
            const response = await fetch(`${API_BASE}/api/ideas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ideaData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('API Error:', error);
            return this.saveIdeaToLocalStorage(ideaData);
        }
    }

    saveIdeaToLocalStorage(ideaData) {
        try {
            const ideas = JSON.parse(localStorage.getItem('user_ideas') || '[]');
            const newIdea = {
                id: Date.now(),
                ...ideaData,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            
            ideas.unshift(newIdea);
            localStorage.setItem('user_ideas', JSON.stringify(ideas));
            
            return newIdea;
            
        } catch (error) {
            throw new Error('Не удалось сохранить идею');
        }
    }

    async loadMyIdeas() {
        const container = document.getElementById('my-ideas-list');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Загрузка идей...</div>';
        }

        try {
            const API_BASE = window.location.origin;
            const response = await fetch(`${API_BASE}/api/users/${this.user.id}/ideas`);
            
            if (response.ok) {
                const ideas = await response.json();
                this.renderMyIdeas(ideas);
            } else {
                throw new Error('API недоступен');
            }
            
        } catch (error) {
            console.error('Ошибка загрузки из API:', error);
            this.loadIdeasFromLocalStorage();
        }
    }

    loadIdeasFromLocalStorage() {
        try {
            const ideas = JSON.parse(localStorage.getItem('user_ideas') || '[]');

            const userIdeas = ideas.filter(idea => idea.user_id === this.user.id);
            
            if (userIdeas.length === 0) {
                const testIdeas = [
                    {
                        id: 1,
                        description: "Оптимизация маршрутов доставки в северном регионе",
                        justification: "Снижение пробега на 15% и времени доставки на 20%",
                        status: "approved",
                        created_at: "2024-01-15",
                        is_anonymous: false,
                        user_id: this.user.id
                    }
                ];
                this.renderMyIdeas(testIdeas);
            } else {
                this.renderMyIdeas(userIdeas);
            }
            
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            this.renderMyIdeas([]);
        }
    }

    renderMyIdeas(ideas) {
        const container = document.getElementById('my-ideas-list');
        if (!container) {
            console.warn("Контейнер для идей не найден");
            return;
        }
        
        const sortedIdeas = ideas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        if (sortedIdeas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #6c757d;">
                    <div style="font-size: 48px; margin-bottom: 10px;">💡</div>
                    <h3>У вас пока нет идей</h3>
                    <p>Предложите первую идею для улучшения нашей компании!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sortedIdeas.map(idea => `
            <div class="idea-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h3 style="flex: 1; margin: 0; color: #2c3e50; font-size: 16px; line-height: 1.4;">${idea.description}</h3>
                    <span class="idea-status status-${idea.status}">
                        ${this.getStatusText(idea.status)}
                    </span>
                </div>
                ${idea.justification ? `
                    <div style="color: #495057; font-size: 14px; margin-bottom: 8px; font-style: italic;">
                        "${idea.justification}"
                    </div>
                ` : ''}
                ${idea.evidence_link ? `
                    <div style="margin-bottom: 8px;">
                        <a href="${idea.evidence_link}" target="_blank" style="color: #1e3c72; font-size: 14px;">
                            🔗 Ссылка на доказательства
                        </a>
                    </div>
                ` : ''}
                <div style="color: #6c757d; font-size: 12px; display: flex; justify-content: space-between;">
                    <span>${idea.is_anonymous ? '👤 Анонимно' : '👤 От вашего имени'}</span>
                    <span>📅 ${new Date(idea.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'На рассмотрении',
            'approved': 'Одобрена', 
            'rejected': 'Отклонена'
        };
        return statusMap[status] || status;
    }
}