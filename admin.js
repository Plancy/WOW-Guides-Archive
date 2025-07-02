// Добавление босса (не меняется)
window.addBoss = function () {
    const bossesDiv = document.getElementById('bosses');
    const idx = bossesDiv.children.length;
    const bossDiv = document.createElement('div');
    bossDiv.className = 'boss-block';
    bossDiv.innerHTML = `
        <label>Картинка босса: <input type="text" name="bossImage${idx}"></label>
        <label>Имя босса: <input type="text" name="bossName${idx}"></label>
        <label>Ссылка на Wowhead: <input type="text" name="bossWowhead${idx}"></label>
        <div class="stages" id="stages${idx}"></div>
        <button type="button" onclick="addStage(${idx})">Добавить стадию</button>
    `;
    bossesDiv.append(bossDiv);
};

window.addStage = function (bossIdx) {
    const stagesDiv = document.getElementById('stages' + bossIdx);
    const stageIdx = stagesDiv.children.length;
    const stageDiv = document.createElement('div');
    stageDiv.className = 'stage-block';
    stageDiv.innerHTML = `
        <label>Название стадии: <input type="text" name="stageName${bossIdx}_${stageIdx}"></label>
        <label>Тактика для танка: <input type="text" name="tank${bossIdx}_${stageIdx}"></label>
        <label>Тактика для хила: <input type="text" name="heal${bossIdx}_${stageIdx}"></label>
        <label>Тактика для ДПС: <input type="text" name="dps${bossIdx}_${stageIdx}"></label>
        <div>
            <b>Опасности и как их избежать</b>
            <div class="dangers" id="dangers${bossIdx}_${stageIdx}"></div>
            <button type="button" onclick="addDanger(${bossIdx},${stageIdx})">Добавить опасность</button>
        </div>
        <div>
            <b>Полезные советы</b>
            <div class="tips" id="tips${bossIdx}_${stageIdx}"></div>
            <button type="button" onclick="addTip(${bossIdx},${stageIdx})">Добавить совет</button>
        </div>
    `;
    stagesDiv.append(stageDiv);
};

window.addDanger = function (bossIdx, stageIdx) {
    const dangersDiv = document.getElementById(`dangers${bossIdx}_${stageIdx}`);
    const dangerIdx = dangersDiv.children.length;
    const div = document.createElement('div');
    div.innerHTML = `
        <input type="text" name="danger${bossIdx}_${stageIdx}_${dangerIdx}" placeholder="Опасность">
        <input type="text" name="solution${bossIdx}_${stageIdx}_${dangerIdx}" placeholder="Как избежать">
    `;
    dangersDiv.append(div);
};

window.addTip = function (bossIdx, stageIdx) {
    const tipsDiv = document.getElementById(`tips${bossIdx}_${stageIdx}`);
    const tipIdx = tipsDiv.children.length;
    const input = document.createElement('input');
    input.type = "text";
    input.name = `tip${bossIdx}_${stageIdx}_${tipIdx}`;
    input.placeholder = "Совет";
    tipsDiv.append(input);
};

// --- ГЛАВНОЙ ЧАСТЬ: СОХРАНЕНИЕ НА СЕРВЕР ---
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
                const danger = dangersDiv.children[k].querySelector(`[name="danger${i}_${j}_${k}"]`).value;
                const solution = dangersDiv.children[k].querySelector(`[name="solution${i}_${j}_${k}"]`).value;
                if (danger && solution) dangers.push({ danger, solution });
            }
            // Советы
            const tips = [];
            const tipsDiv = stageDiv.querySelector('.tips');
            for (let k = 0; k < tipsDiv.children.length; k++) {
                const tip = tipsDiv.children[k].value;
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
    // Итоговый гайд
    const guide = {
        // id не нужен - сервер сам сгенерирует уникальный id!
        title: form.title.value,
        type: form.type.value,
        difficulty: form.difficulty.value,
        addon: form.addon.value,
        mapImage: form.mapImage.value,
        summary: form.summary.value,
        bosses
    };

    // --- Сохраняем на сервер ---
    try {
        const res = await fetch('https://catnip-sulfuric-price.glitch.me/guides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guide)
        });
        if (!res.ok) throw new Error('Ошибка сохранения на сервере');
        const data = await res.json();
        alert('Гайд успешно сохранён на сервере!');
        form.reset();
        document.getElementById('bosses').innerHTML = "";
    } catch (err) {
        alert('Ошибка: ' + err.message);
    }
};