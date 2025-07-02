const ADDONS = [
    { name: "Classic", icon: "🗡️", color: "#bbaa7c" },
    { name: "The Burning Crusade", icon: "🔥", color: "#c18c2b" },
    { name: "Wrath of the Lich King", icon: "❄️", color: "#6ca3c7" },
    { name: "Cataclysm", icon: "🌋", color: "#c76d1e" },
    { name: "Mists of Pandaria", icon: "🐼", color: "#7ab97f" },
    { name: "Warlords of Draenor", icon: "⚒️", color: "#a08dda" },
    { name: "Legion", icon: "💚", color: "#70a856" },
    { name: "Battle for Azeroth", icon: "⚔️", color: "#bda59c" },
    { name: "Shadowlands", icon: "👻", color: "#888abf" },
    { name: "Dragonflight", icon: "🐲", color: "#d9c35b" },
    { name: "Другое", icon: "✨", color: "#ada266" }
];

function getAddonMeta(addon) {
    return ADDONS.find(a => a.name === addon) || { icon: "✨", color: "#ada266", name: addon || "?" };
}

// Рендер фильтра
function renderAddonFilter() {
    const select = document.getElementById('addonFilter');
    select.innerHTML = `<option value="">Все дополнения</option>` +
        ADDONS.map(a => `<option value="${a.name}">${a.icon} ${a.name}</option>`).join('');
}

// Рендер легенды
function renderLegend() {
    const el = document.getElementById('addonsLegend');
    el.innerHTML = ADDONS.map(a =>
        `<span class="legend-addon" style="background:${a.color}20;border:1.5px solid ${a.color}77">
      <span class="legend-icon" style="color:${a.color}">${a.icon}</span>
      <span class="legend-name">${a.name}</span>
    </span>`
    ).join('');
}

async function loadGuides() {
    const res = await fetch('https://catnip-sulfuric-price.glitch.me/guides');
    let guides = await res.json();
    // Новые гайды сверху:
    guides.sort((a, b) => {
        if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
        if (a.id && b.id) return b.id - a.id;
        return 0;
    });
    renderGuides(guides);
}

function renderGuides(guides) {
    const list = document.getElementById('guidesList');
    list.innerHTML = '';
    if (guides.length === 0) {
        list.innerHTML = '<div style="color:#ffe56b;font-size:1.2em;text-align:center">Гайды не найдены.</div>';
        return;
    }
    for (const g of guides) {
        const addonMeta = getAddonMeta(g.addon || '');
        const addonBadge = `<span class="guide-card-addon" data-addon="${g.addon || ''}" style="background:${addonMeta.color};color:#232529">
      <span class="addon-icon">${addonMeta.icon}</span>
      <span class="addon-name">${addonMeta.name}</span>
    </span>`;
        let imgBlock = '';
        if (g.mapImage && g.mapImage.trim()) {
            imgBlock = `<div class="guide-card-imgwrap"><img class="guide-card-img" src="${g.mapImage}" alt="map"></div>`;
        } else {
            imgBlock = `<div class="guide-card-imgwrap"><div class="guide-card-placeholder">Нет карты</div></div>`;
        }
        const content = `
      ${addonBadge}
      ${imgBlock}
      <div class="guide-card-content">
        <div class="guide-card-title">${g.title}</div>
        <div class="guide-meta-row">
          <span class="guide-meta-type">${g.type || ''}</span>
          <span class="guide-meta-diff">${g.difficulty || ''}</span>
        </div>
        <div class="guide-card-summary">${g.summary || ''}</div>
        <a class="guide-card-link" href="guide.html?id=${g.id}">Подробнее &rarr;</a>
      </div>
    `;
        const card = document.createElement('div');
        card.className = 'guide-card';
        card.innerHTML = content;
        list.appendChild(card);
    }
}

// Фильтр и поиск (примерная реализация)
document.addEventListener('DOMContentLoaded', function () {
    renderAddonFilter();
    renderLegend();
    loadGuides();
    document.getElementById('searchInput').oninput = filterGuides;
    document.getElementById('addonFilter').onchange = filterGuides;
});
let cachedGuides = [];
async function filterGuides() {
    if (!cachedGuides.length) {
        const res = await fetch('https://catnip-sulfuric-price.glitch.me/guides');
        cachedGuides = await res.json();
    }
    const q = document.getElementById('searchInput').value.toLowerCase();
    const addon = document.getElementById('addonFilter').value;
    let guides = cachedGuides.filter(g => {
        let ok = true;
        if (q) ok = (g.title || '').toLowerCase().includes(q) || (g.summary || '').toLowerCase().includes(q);
        if (addon) ok = ok && g.addon === addon;
        return ok;
    });
    // Новые гайды сверху:
    guides.sort((a, b) => {
        if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
        if (a.id && b.id) return b.id - a.id;
        return 0;
    });
    renderGuides(guides);
}