// functions/api/battery.js

// Конфигурация KV-ключей
const BATTERY_KEYS = {
    '1': 'battery_state_1',
    '2': 'battery_state_2',
    '3': 'battery_state_3'
};

// Экспортируем единый объект, который содержит все обработчики методов
export const onRequest = {

    // =======================================================
    // ✅ ОБРАБОТЧИК ДЛЯ POST-ЗАПРОСОВ (ОБНОВЛЕНИЕ ДАННЫХ)
    // =======================================================
    POST: async ({ request, env }) => {
        try {
            const data = await request.json();
            const { id, level } = data; // Деструктурирование

            if (!BATTERY_KEYS[id] || typeof level !== 'number' || level < 0 || level > 100) {
                return new Response('Invalid ID (1, 2, or 3) or invalid level (0-100)', { status: 400 });
            }

            const key = BATTERY_KEYS[id];
            const dataToStore = {
                id: parseInt(id),
                level: level,
                timestamp: new Date().toISOString()
            };

            // Запись в KV Storage. env.BATTERY_KV должна быть привязана.
            await env.BATTERY_KV.put(key, JSON.stringify(dataToStore));

            return new Response(`Battery ${id} updated successfully`, { status: 200 });

        } catch (error) {
            // Если возникла проблема с KV-привязкой или JSON-парсингом.
            console.error('POST Error:', error.stack); 
            return new Response('Internal Server Error (Check KV Binding or JSON format)', { status: 500 });
        }
    },

    // =======================================================
    // ✅ ОБРАБОТЧИК ДЛЯ GET-ЗАПРОСОВ (ПОЛУЧЕНИЕ ДАННЫХ)
    // =======================================================
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
            console.error('GET Error:', error.stack);
            return new Response('Internal Server Error during GET processing', { status: 500 });
        }
    }
};
