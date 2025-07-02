// Загрузка гайдов с сервера
window.guides = [];
async function loadGuides() {
    try {
        const res = await fetch('https://catnip-sulfuric-price.glitch.me/guides');
        window.guides = await res.json();
        if (typeof renderGuides === "function") renderGuides();
        if (typeof renderGuidePage === "function") renderGuidePage();
    } catch (e) {
        console.error("Ошибка загрузки гайдов:", e);
    }
}
loadGuides();

function renderGuides() {
    const addonFilter = document.getElementById('addonFilter');
    const searchInput = document.getElementById('searchInput');
    const guidesList = document.getElementById('guidesList');
    if (!window.guides || !guidesList) return;

    // Заполним фильтр только если он пустой
    if (addonFilter && addonFilter.options.length < 2) {
        const addons = Array.from(new Set(window.guides.map(g => g.addon).filter(Boolean)));
        addons.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a;
            opt.textContent = a;
            addonFilter.append(opt);
        });
    }

    const addon = addonFilter ? addonFilter.value : '';
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    guidesList.innerHTML = "";
    window.guides
        .filter(g => (!addon || g.addon === addon))
        .filter(g => g.title.toLowerCase().includes(search) || (g.summary && g.summary.toLowerCase().includes(search)))
        .forEach(g => {
            const card = document.createElement('div');
            card.className = "guide-card";
            card.innerHTML = `
                <img src="${g.mapImage || ''}" alt="${g.title}">
                <div class="guide-card-content">
                    <h2>${g.title}</h2>
                    <div class="guide-meta">${g.type || ''} | ${g.difficulty || ''} | ${g.addon || ''}</div>
                    <div class="guide-summary">${g.summary || ''}</div>
                    <a href="guide.html?id=${g.id}">Читать &rarr;</a>
                </div>
            `;
            guidesList.append(card);
        });
}
function renderGuidePage() {
    const guideContainer = document.getElementById('guideContainer');
    if (!guideContainer) return;
    const params = new URLSearchParams(location.search);
    const guideId = Number(params.get("id"));
    const guide = window.guides.find(g => g.id === guideId);

    if (!guide) {
        guideContainer.textContent = "Гайд не найден.";
    } else {
        let html = `
            <div class="guide-section">
                <span class="guide-title">${guide.title}</span>
                <img src="${guide.mapImage || ''}" class="guide-map" alt="Карта">
                <div class="guide-info-row">
                    <b>${guide.type || ''}</b> (${guide.difficulty || ''}) | <b>Дополнение:</b> ${guide.addon || ''}
                </div>
                <div class="guide-summary">${guide.summary || ''}</div>
                <div style="clear:both"></div>
            </div>
            <div class="guide-section">
                <h2 style="margin-top:0;font-size:1.13em;color:#a78742;font-family:'UnifrakturCook',serif;">Боссы</h2>
        `;
        (guide.bosses || []).forEach(boss => {
            html += `
            <div class="guide-boss">
                <div class="boss-header">
                    <img src="${boss.image || ''}" class="boss-img" alt="Босс">
                    <div>
                        <div class="boss-title">
                            <a href="${boss.wowhead || '#'}" rel="noopener" class="boss-link" data-wowhead="${boss.wowhead || ''}" target="_blank">${boss.name || ''}</a>
                        </div>
                    </div>
                </div>
                <div class="boss-stages">
            `;
            (boss.stages || []).forEach(stage => {
                html += `
                    <div class="boss-stage">
                        <div class="stage-title">${stage.name || ''}</div>
                        <div class="role-row">
                            <span class="role-label role-tank">Танк:</span>
                            <span>${stage.tactics?.tank || ''}</span>
                        </div>
                        <div class="role-row">
                            <span class="role-label role-heal">Хил:</span>
                            <span>${stage.tactics?.heal || ''}</span>
                        </div>
                        <div class="role-row">
                            <span class="role-label role-dps">ДПС:</span>
                            <span>${stage.tactics?.dps || ''}</span>
                        </div>
                        <div class="dangers-section">
                            <span class="danger-label">Опасности:</span>
                            <ul style="margin:2px 0 0 0;padding-left:18px;">
                                ${(stage.dangers || []).map(d => `<li class="danger-item">${d.danger} <span style="color:#b89d54;">— ${d.solution}</span></li>`).join("")}
                            </ul>
                        </div>
                        <div class="tips-section">
                            <span class="tip-label">Советы:</span>
                            <ul style="margin:2px 0 0 0;padding-left:18px;">
                                ${(stage.tips || []).map(t => `<li class="tip-item">${t}</li>`).join("")}
                            </ul>
                        </div>
                    </div>
                `;
            });
            html += "</div></div>";
        });
        html += `</div>`;
        guideContainer.innerHTML = html;
    }
}

// Вешаем обработчики только если элементы есть
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('addonFilter')) {
        document.getElementById('addonFilter').onchange = renderGuides;
    }
    if (document.getElementById('searchInput')) {
        document.getElementById('searchInput').oninput = renderGuides;
    }
});