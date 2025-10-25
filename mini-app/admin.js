// class AdminPanel {
//     constructor(user) {
//         this.user = user;
//     }

//     async init() {
//         await this.loadPendingIdeas();
//     }

//     async loadPendingIdeas() { 
//         const container = document.getElementById('pending-ideas-list');
//         if (container) {
//             container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Загрузка идей на модерацию</div>';
//         }

//         try {
//             const API_BASE = window.location.origin;
//             const response = await fetch(`${API_BASE}/api/admin/pending-ideas`);
            
//             if (!response.ok) {
//                 throw new Error(`Ошибка сервера: ${response.status}`);
//             }
            
//             const ideas = await response.json();
//             this.renderPendingIdeas(ideas);
            
//         } catch (error) {
//             console.error('Ошибка загрузки идей на модерацию:', error);
//             // Резервные тестовые данные
//             this.renderPendingIdeas(this.getTestPendingIdeas());
//         }
//     }

//     renderPendingIdeas(ideas) {
//         const container = document.getElementById('pending-ideas-list');
//         if (!container) {
//             console.error("Контейнер pending-ideas-list не найден");
//             return;
//         }
        
//         if (ideas.length === 0) {
//             container.innerHTML = `
//                 <div style="text-align: center; padding: 40px; color: #6c757d;">
//                     <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
//                     <h3>Нет идей на модерации</h3>
//                     <p>Все идеи уже обработаны!</p>
//                 </div>
//             `;
//             return;
//         }
        
//         container.innerHTML = ideas.map(idea => `
//             <div class="idea-card">
//                 <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${idea.description}</h3>
                
//                 ${idea.justification ? `
//                     <div style="color: #495057; margin-bottom: 10px; font-style: italic;">
//                         "<strong>Обоснование:</strong> ${idea.justification}"
//                     </div>
//                 ` : ''}
                
//                 ${idea.evidence_link ? `
//                     <div style="margin-bottom: 10px;">
//                         <strong>Доказательства:</strong> 
//                         <a href="${idea.evidence_link}" target="_blank" style="color: #1e3c72;">
//                             ${idea.evidence_link}
//                         </a>
//                     </div>
//                 ` : ''}
                
//                 <div style="color: #6c757d; font-size: 14px; margin-bottom: 15px;">
//                     <div><strong>Автор:</strong> ${idea.author_name} (${idea.author_username})</div>
//                     <div><strong>Дата:</strong> ${new Date(idea.created_at).toLocaleDateString('ru-RU')}</div>
//                     <div><strong>Анонимность:</strong> ${idea.is_anonymous ? 'Да' : 'Нет'}</div>
//                 </div>
                
//                 <div class="admin-actions">
//                     <button class="btn-approve" onclick="adminApproveIdea(${idea.id})">Одобрить</button>
//                     <button class="btn-reject" onclick="adminRejectIdea(${idea.id})">Отклонить</button>
//                 </div>
//             </div>
//         `).join('');
//     }

//     // Тестовые данные для демонстрации
//     getTestPendingIdeas() {
//         return [
//             {
//                 id: 1,
//                 description: "Внедрение системы автоматического учета топлива",
//                 justification: "Снижение расхода топлива на 8% и исключение человеческого фактора",
//                 evidence_link: "",
//                 author_name: "Арсений Моисеев",
//                 author_username: "arseny_m",
//                 created_at: "2025-18-10",
//                 is_anonymous: true
//             },
//             {
//                 id: 2,
//                 description: "Система мотивации для водителей",
//                 justification: "Повышение лояльности и снижение текучки кадров",
//                 evidence_link: "https://docs.google.com/document/example",
//                 author_name: "Поликарпова Таисия", 
//                 author_username: "taisiya_p",
//                 created_at: "2025-18-10",
//                 is_anonymous: false
//             },
//             {
//                 id: 3,
//                 description: "Внедрение чат-бота для ответов на частые вопросы",
//                 justification: "Снизит нагрузку на поддержку и ускорит ответы клиентам",
//                 evidence_link: "",
//                 author_name: "Дмитрий Мурзаев",
//                 author_username: "dmitry_m",
//                 created_at: "2025-18-10",
//                 is_anonymous: false
//             }
//         ];
//     }
// }

// // Глобальные функции для кнопок
// async function adminApproveIdea(ideaId) {
//     if (!confirm('Одобрить эту идею?')) return;

//     try {
//         const savedAmount = prompt('Укажите оценку экономии (в рублях):', '10000');
//         if (savedAmount === null) return;
        
//         const comment = prompt('Комментарий модератора (опционально):', 'Идея одобрена!');

//         const API_BASE = window.location.origin;
//         const response = await fetch(`${API_BASE}/api/admin/approve-idea`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 idea_id: ideaId,
//                 saved_amount: parseInt(savedAmount) || 0,
//                 moderator_comment: comment || '',
//                 moderator_id: window.app?.currentUser?.id || 111111111
//             })
//         });

//         if (response.ok) {
//             alert('Идея одобрена!');
//             // Перезагружаем список
//             if (window.adminPanel) {
//                 window.adminPanel.loadPendingIdeas();
//             }
//         } else {
//             throw new Error('Ошибка при одобрении идеи');
//         }
//     } catch (error) {
//         console.error('Ошибка:', error);
//         alert('Не удалось одобрить идею: ' + error.message);
//     }
// }

// async function adminRejectIdea(ideaId) {
//     const comment = prompt('Укажите причину отклонения:');
//     if (comment === null) return;

//     try {
//         const API_BASE = window.location.origin;
//         const response = await fetch(`${API_BASE}/api/admin/reject-idea`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 idea_id: ideaId,
//                 comment: comment,
//                 moderator_id: window.app?.currentUser?.id || 111111111
//             })
//         });

//         if (response.ok) {
//             alert('Идея отклонена!');
//             // Перезагружаем список
//             if (window.adminPanel) {
//                 window.adminPanel.loadPendingIdeas();
//             }
//         } else {
//             throw new Error('Ошибка при отклонении идеи');
//         }
//     } catch (error) {
//         console.error('Ошибка:', error);
//         alert('Не удалось отклонить идею: ' + error.message);
//     }
// }