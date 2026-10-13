import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function writeComparison(directory) {
  const report = JSON.parse(await readFile(join(directory, 'report.json'), 'utf8'))
  const cards = report.visual.map(state => `<section><h2>${state.name}</h2><p>Изменённые пиксели: ${state.changedPercent}%; вне областей текста: ${state.nonTextChangedPercent}%.</p><div class="row">${[
    ['Эталон', `../reference/${state.name}.png`], ['Реализация', `${state.name}.png`],
    ['Наложение 50/50', `${state.name}-overlay.png`], ['Различия RGB > 16', `${state.name}-diff.png`],
  ].map(([label, src]) => `<figure><figcaption>${label}</figcaption><a href="${src}"><img src="${src}" alt="${label}: ${state.name}" width="390" height="844"></a></figure>`).join('')}</div></section>`).join('')
  await writeFile(join(directory, 'comparison.html'), `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Сравнение пяти состояний</title><style>body{margin:24px;font:16px/1.5 system-ui;background:#f7f7ff;color:#201a35}h1{font-size:28px}h2{margin:32px 0 8px}.row{display:flex;gap:16px;overflow-x:auto}figure{margin:0;flex-shrink:0}figcaption{margin-bottom:8px}img{display:block;width:390px;height:844px;max-width:none}a{color:#6c5ce7}</style><h1>TestKidTask — пять состояний</h1><p>Chromium, 390 × 844, DPR 1, локальный Inter после document.fonts.ready. SVG не изменены.</p><p>Пиксель изменён, если разница хотя бы одного RGB-канала &gt; 16. Автоматический порог: &lt; 5% всего изображения и &lt; 1% вне прямоугольников текста (с полем 3 px). Маска текста — диагностическая метрика, не доказательство идентичности шрифта. Основные координаты проверены отдельно.</p><p>Локальный Inter отличается шириной некоторых надписей от Figma; сглаживание браузера также отличается. Результат не является пиксельным совпадением.</p>${cards}</html>`)
}
