// Ключи для каждой батареи в KV Storage
const BATTERY_KEYS = {
    '1': 'battery_state_1',
    '2': 'battery_state_2',
    '3': 'battery_state_3'
};

// Обработчик для POST запроса (Обновление)
export async function onRequestPost({ request, env }) {
    try {
        const data = await request.json();
        const { id, level } = data; // Ожидаем { "id": 1, "level": 85 }

        if (!BATTERY_KEYS[id] || typeof level !== 'number' || level < 0 || level > 100) {
            return new Response('Invalid ID (1, 2, or 3) or invalid level (0-100)', { status: 400 });
        }

        const key = BATTERY_KEYS[id];
        const dataToStore = {
            id: parseInt(id),
            level: level,
            timestamp: new Date().toISOString() // Сохраняем метку времени
        };

        // Запись уровня заряда в KV Storage. env.BATTERY_KV должна быть привязана.
        await env.BATTERY_KV.put(key, JSON.stringify(dataToStore));

        return new Response(`Battery ${id} updated successfully`, { status: 200 });

    } catch (error) {
        return new Response('Failed to process request or Invalid JSON', { status: 500 });
    }
}

// Обработчик для GET запроса (Извлечение)
export async function onRequestGet({ env }) {
    try {
        const results = {};
        const keysToFetch = Object.values(BATTERY_KEYS);

        // Чтение данных для всех трех батарей
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
        return new Response('Internal Server Error', { status: 500 });
    }
}
