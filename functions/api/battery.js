// functions/api/battery.js

// Конфигурация
const BATTERY_KEYS = {
    '1': 'battery_state_1',
    '2': 'battery_state_2',
    '3': 'battery_state_3'
};

// =======================================================
// ✅ ОБРАБОТЧИК ДЛЯ POST-ЗАПРОСА (ОБНОВЛЕНИЕ ДАННЫХ)
// Имя 'onRequestPost' КРИТИЧЕСКИ ВАЖНО для Pages
// =======================================================
export async function onRequestPost({ request, env }) {
    try {
        const data = await request.json();
        const { id, level } = data;

        if (!BATTERY_KEYS[id] || typeof level !== 'number' || level < 0 || level > 100) {
            return new Response('Invalid ID (1, 2, or 3) or invalid level (0-100)', { status: 400 });
        }

        const key = BATTERY_KEYS[id];
        const dataToStore = {
            id: parseInt(id),
            level: level,
            timestamp: new Date().toISOString()
        };

        // Запись в KV Storage.
        await env.BATTERY_KV.put(key, JSON.stringify(dataToStore));

        return new Response(`Battery ${id} updated successfully`, { status: 200 });

    } catch (error) {
        // Если ошибка 500 появляется здесь, проверьте логи Cloudflare: 
        // часто это означает ошибку с KV-привязкой (env.BATTERY_KV)
        console.error('POST Error:', error.stack); 
        return new Response('Internal Server Error during POST processing', { status: 500 });
    }
}

// =======================================================
// ✅ ОБРАБОТЧИК ДЛЯ GET-ЗАПРОСА (ПОЛУЧЕНИЕ ДАННЫХ)
// Имя 'onRequestGet' КРИТИЧЕСКИ ВАЖНО для Pages
// =======================================================
export async function onRequestGet({ env }) {
    try {
        const results = {};
        
        for (const [id, key] of Object.entries(BATTERY_KEYS)) {
            const data = await env.BATTERY_KV.get(key);
            results[id] = data ? JSON.parse(data) : { id: parseInt(id), level: 0, timestamp: 'Нет данных' };
        }

        return new Response(JSON.stringify(results), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('GET Error:', error.stack);
        return new Response('Internal Server Error during GET processing', { status: 500 });
    }
}
