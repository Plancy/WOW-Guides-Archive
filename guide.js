document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('guideContainer');
    if (!id) {
        container.innerHTML = '<div style="color:#ff7878">Некорректный адрес гайда.</div>';
        return;
    }
    try {
        const res = await fetch(`https://catnip-sulfuric-price.glitch.me/guides/${id}`);
        if (!res.ok) throw new Error("Гайд не найден");
        const guide = await res.json();
        if (!guide || !guide.title) throw new Error("Гайд не найден");
        container.innerHTML = renderGuide(guide);
    } catch (e) {
        container.innerHTML = `<div style="color:#ff7878">${e.message}</div>`;
    }
});

function renderGuide(guide) {
    return `
        <div class="guide-title">${guide.title}</div>
        <div class="guide-section">
            <div class="guide-info-row"><b>Тип:</b> ${guide.type || ''} | <b>Сложность:</b> ${guide.difficulty || ''} | <b>Дополнение:</b> ${guide.addon || ''}</div>
            <div class="guide-summary">${guide.summary || ''}</div>
            ${guide.mapImage ? `<img class="guide-map" src="${guide.mapImage}" alt="map">` : ''}
        </div>
        ${(guide.bosses || []).map(renderBoss).join('')}
    `;
}
function renderBoss(boss) {
    // Если есть wowhead, обернём имя в ссылку с data-wowhead
    let bossNameHtml = boss.name || '';
    if (boss.wowhead) {
        // Попробуем определить тип wowhead-ссылки (npc, spell, итд)
        // Пример: https://www.wowhead.com/ru/npc=33288/yogg-saron
        let m = boss.wowhead.match(/wowhead\.com\/(?:ru\/)?(\w+)=([\d]+)/);
        if (m) {
            bossNameHtml = `<a href="${boss.wowhead}" class="boss-wowhead" data-wowhead="${m[1]}=${m[2]}" target="_blank">${boss.name}</a>`;
        } else {
            bossNameHtml = `<a href="${boss.wowhead}" class="boss-wowhead" target="_blank">${boss.name}</a>`;
        }
    }
    return `
        <div class="guide-boss">
            <div class="boss-header">
                ${boss.image ? `<img class="boss-img" src="${boss.image}" alt="">` : ""}
                <span class="boss-title">${bossNameHtml}</span>
            </div>
            <div class="boss-stages">
                ${(boss.stages || []).map(renderStage).join('')}
            </div>
        </div>
    `;
}
function renderStage(stage) {
    return `
        <div class="boss-stage">
            <div class="stage-title">${stage.name || ''}</div>
            <div class="role-row">
                <span class="role-label role-tank">Танк:</span> ${stage.tactics?.tank || ''}
            </div>
            <div class="role-row">
                <span class="role-label role-heal">Хил:</span> ${stage.tactics?.heal || ''}
            </div>
            <div class="role-row">
                <span class="role-label role-dps">ДПС:</span> ${stage.tactics?.dps || ''}
            </div>
            ${stage.dangers?.length ? `<div class="dangers-section"><span class="danger-label">Опасности:</span><ul>${stage.dangers.map(d => `<li class="danger-item">${d.danger} <b>→</b> ${d.solution}</li>`).join('')}</ul></div>` : ''}
            ${stage.tips?.length ? `<div class="tips-section"><span class="tip-label">Советы:</span><ul>${stage.tips.map(t => `<li class="tip-item">${t}</li>`).join('')}</ul></div>` : ''}
        </div>
    `;
}