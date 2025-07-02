document.addEventListener('DOMContentLoaded', function () {
    // Показать/скрыть поле для "Другое"
    const addonSelect = document.getElementById('addonSelect');
    const addonOther = document.getElementById('addonOther');
    if (addonSelect) {
        addonSelect.onchange = function () {
            if (addonSelect.value === "Другое") {
                addonOther.style.display = '';
                addonOther.required = true;
            } else {
                addonOther.style.display = 'none';
                addonOther.required = false;
            }
        }
    }

    // Кнопка "Добавить босса"
    document.getElementById('addBossBtn').onclick = () => addBoss();

    // Сабмит формы: сбор данных и POST
    document.getElementById('guideForm').onsubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        // Сбор данных
        const bosses = [];
        const bossesDiv = document.getElementById('bosses');
        for (let i = 0; i < bossesDiv.children.length; i++) {
            const bossDiv = bossesDiv.children[i];
            const name = bossDiv.querySelector(`[name="bossName${i}"]`).value;
            const image = bossDiv.querySelector(`[name="bossImage${i}"]`).value;
            const wowhead = bossDiv.querySelector(`[name="bossWowhead${i}"]`).value;
            const stages = [];
            const stagesDiv = bossDiv.querySelector('.stages');
            for (let j = 0; j < stagesDiv.children.length; j++) {
                const stageDiv = stagesDiv.children[j];
                const nameStage = stageDiv.querySelector(`[name="stageName${i}_${j}"]`).value;
                const tank = stageDiv.querySelector(`[name="tank${i}_${j}"]`).value;
                const heal = stageDiv.querySelector(`[name="heal${i}_${j}"]`).value;
                const dps = stageDiv.querySelector(`[name="dps${i}_${j}"]`).value;
                // Опасности
                const dangers = [];
                const dangersDiv = stageDiv.querySelector('.dangers');
                for (let k = 0; k < dangersDiv.children.length; k++) {
                    const danger = dangersDiv.children[k].querySelector(`[name^="danger${i}_${j}"]`).value;
                    const solution = dangersDiv.children[k].querySelector(`[name^="solution${i}_${j}"]`).value;
                    if (danger && solution) dangers.push({ danger, solution });
                }
                // Советы
                const tips = [];
                const tipsDiv = stageDiv.querySelector('.tips');
                for (let k = 0; k < tipsDiv.children.length; k++) {
                    const tip = tipsDiv.children[k].querySelector(`[name^="tip${i}_${j}"]`).value;
                    if (tip) tips.push(tip);
                }
                stages.push({
                    name: nameStage,
                    tactics: { tank, heal, dps },
                    dangers,
                    tips
                });
            }
            bosses.push({ name, image, wowhead, stages });
        }
        // Дополнение
        let addon = form.addon.value;
        if (addon === "Другое") {
            addon = form.addonOther.value;
        }

        const guide = {
            title: form.title.value,
            type: form.type.value,
            difficulty: form.difficulty.value,
            addon: addon,
            mapImage: form.mapImage.value,
            summary: form.summary.value,
            bosses
        };
        // Сохраняем на сервер
        try {
            const res = await fetch('https://catnip-sulfuric-price.glitch.me/guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guide)
            });
            if (!res.ok) throw new Error('Ошибка сохранения на сервере');
            document.getElementById('msg').textContent = 'Гайд успешно сохранён!';
            form.reset();
            document.getElementById('bosses').innerHTML = '';
            addonOther.style.display = 'none';
            setTimeout(() => document.getElementById('msg').textContent = '', 3000);
        } catch (err) {
            document.getElementById('msg').textContent = 'Ошибка: ' + err.message;
        }
    };

    // ===== Динамические блоки ==== //

    function createBossBlock(idx, boss = {}) {
        const div = document.createElement('div');
        div.className = 'boss-block';
        div.innerHTML = `
            <div class="boss-head">
                <span class="boss-title">Босс ${idx + 1}</span>
                <button type="button" class="del-btn" title="Удалить босса">&times;</button>
            </div>
            <label>Картинка босса: <input type="text" name="bossImage${idx}" value="${boss.image || ''}"></label>
            <label>Имя босса: <input type="text" name="bossName${idx}" value="${boss.name || ''}"></label>
            <label>Ссылка на Wowhead: <input type="text" name="bossWowhead${idx}" value="${boss.wowhead || ''}"></label>
            <div class="group-label">Стадии:</div>
            <div class="stages" id="stages${idx}"></div>
            <button type="button" class="add-btn mini-add-btn" data-boss="${idx}">+ Стадия</button>
        `;
        // Удаление босса
        div.querySelector('.del-btn').onclick = () => {
            div.remove();
            reindexBosses();
        };
        // Добавление стадии
        div.querySelector('.mini-add-btn').onclick = (e) => {
            addStage(idx);
        };
        return div;
    }
    function createStageBlock(bossIdx, stageIdx, stage = {}) {
        const div = document.createElement('div');
        div.className = 'stage-block';
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <b>Стадия ${stageIdx + 1}</b>
                <button type="button" class="mini-del-btn" title="Удалить стадию">&times;</button>
            </div>
            <label>Название стадии: <input type="text" name="stageName${bossIdx}_${stageIdx}" value="${stage.name || ''}"></label>
            <label>Тактика для танка: <input type="text" name="tank${bossIdx}_${stageIdx}" value="${stage.tactics?.tank || ''}"></label>
            <label>Тактика для хила: <input type="text" name="heal${bossIdx}_${stageIdx}" value="${stage.tactics?.heal || ''}"></label>
            <label>Тактика для ДПС: <input type="text" name="dps${bossIdx}_${stageIdx}" value="${stage.tactics?.dps || ''}"></label>
            <div class="group-label">Опасности:</div>
            <div class="dangers" id="dangers${bossIdx}_${stageIdx}"></div>
            <button type="button" class="add-btn mini-add-btn" data-boss="${bossIdx}" data-stage="${stageIdx}">+ Опасность</button>
            <div class="group-label">Советы:</div>
            <div class="tips" id="tips${bossIdx}_${stageIdx}"></div>
            <button type="button" class="add-btn mini-add-btn" data-boss="${bossIdx}" data-stage="${stageIdx}">+ Совет</button>
        `;
        // Удаление стадии
        div.querySelector('.mini-del-btn').onclick = () => {
            div.remove();
            reindexStages(bossIdx);
        };
        // Добавить опасность
        div.querySelectorAll('.mini-add-btn')[0].onclick = () => addDanger(bossIdx, stageIdx);
        // Добавить совет
        div.querySelectorAll('.mini-add-btn')[1].onclick = () => addTip(bossIdx, stageIdx);
        return div;
    }
    function createDangerInput(bossIdx, stageIdx, danger = {}) {
        const div = document.createElement('div');
        div.style.marginBottom = "4px";
        div.innerHTML = `
            <input type="text" name="danger${bossIdx}_${stageIdx}_X" placeholder="Опасность" value="${danger.danger || ''}" style="width:43%;">
            <input type="text" name="solution${bossIdx}_${stageIdx}_X" placeholder="Как избежать" value="${danger.solution || ''}" style="width:53%;">
            <button type="button" class="mini-del-btn" title="Удалить">&times;</button>
        `;
        div.querySelector('.mini-del-btn').onclick = () => div.remove();
        return div;
    }
    function createTipInput(bossIdx, stageIdx, tip = '') {
        const div = document.createElement('div');
        div.style.marginBottom = "4px";
        div.innerHTML = `
            <input type="text" name="tip${bossIdx}_${stageIdx}_X" placeholder="Совет" value="${tip}" style="width:95%;">
            <button type="button" class="mini-del-btn" title="Удалить">&times;</button>
        `;
        div.querySelector('.mini-del-btn').onclick = () => div.remove();
        return div;
    }
    // Динамические функции
    function reindexBosses() {
        const bossesDiv = document.getElementById('bosses');
        Array.from(bossesDiv.children).forEach((bossDiv, idx) => {
            bossDiv.querySelector('.boss-title').innerText = `Босс ${idx + 1}`;
            bossDiv.querySelector('.mini-add-btn').dataset.boss = idx;
            bossDiv.querySelector('.stages').id = `stages${idx}`;
            reindexStages(idx);
        });
    }
    function reindexStages(bossIdx) {
        const stagesDiv = document.getElementById(`stages${bossIdx}`);
        Array.from(stagesDiv.children).forEach((stageDiv, sIdx) => {
            stageDiv.querySelector('b').innerText = `Стадия ${sIdx + 1}`;
            stageDiv.querySelectorAll('.mini-add-btn')[0].dataset.stage = sIdx;
            stageDiv.querySelectorAll('.mini-add-btn')[1].dataset.stage = sIdx;
            stageDiv.querySelector('.dangers').id = `dangers${bossIdx}_${sIdx}`;
            stageDiv.querySelector('.tips').id = `tips${bossIdx}_${sIdx}`;
        });
    }
    // Добавить босса
    window.addBoss = function (boss = {}) {
        const bossesDiv = document.getElementById('bosses');
        const idx = bossesDiv.children.length;
        const bossDiv = createBossBlock(idx, boss);
        bossesDiv.appendChild(bossDiv);
    }
    window.addStage = function (bossIdx, stage = {}) {
        const stagesDiv = document.getElementById(`stages${bossIdx}`);
        const stageIdx = stagesDiv.children.length;
        const stageDiv = createStageBlock(bossIdx, stageIdx, stage);
        stagesDiv.appendChild(stageDiv);
    }
    window.addDanger = function (bossIdx, stageIdx, danger = {}) {
        const dangersDiv = document.getElementById(`dangers${bossIdx}_${stageIdx}`);
        dangersDiv.appendChild(createDangerInput(bossIdx, stageIdx, danger));
    }
    window.addTip = function (bossIdx, stageIdx, tip = '') {
        const tipsDiv = document.getElementById(`tips${bossIdx}_${stageIdx}`);
        tipsDiv.appendChild(createTipInput(bossIdx, stageIdx, tip));
    }
});