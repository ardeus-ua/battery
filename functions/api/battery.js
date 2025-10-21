// functions/api/battery.js

// Конфигурация
const BATTERY_KEYS = {
    '1': 'battery_state_1',
    '2': 'battery_state_2',
    '3': 'battery_state_3'
};

// Экспортируем единый объект, который содержит все обработчики методов
export const onRequest = {
    // 1. Обработчик для POST-запросов (от Home Assistant)
    POST: async ({ request, env }) => {
        try {
            const data = await request.json();
            const { id, level } = data;

            if (!BATTERY_KEYS[id] || typeof level !== 'number' || level < 0 || level > 100) {
                return new Response('Invalid ID or level', { status: 400 });
            }

            const key = BATTERY_KEYS[id];
            const dataToStore = {
                id: parseInt(id),
                level: level,
                timestamp: new Date().toISOString()
            };

            await env.BATTERY_KV.put(key, JSON.stringify(dataToStore));

            return new Response(`Battery ${id} updated successfully`, { status: 200 });

        } catch (error) {
            return new Response('Internal Server Error during POST', { status: 500 });
        }
    },

    // 2. Обработчик для GET-запросов (для главной страницы)
    GET: async ({ env }) => {
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
            return new Response('Internal Server Error during GET', { status: 500 });
        }
    }
};

// ПРИМЕЧАНИЕ: В этом случае экспортировать onRequestPost и onRequestGet НЕ НУЖНО.
