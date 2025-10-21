// functions/api/data.js
// Cloudflare Pages Function (Worker)
// Использует привязку к KV, названную BATTERY_KV

const KV_KEY = 'all_batteries_data'; 

export async function onRequest(context) {
    // Получаем привязку к KV
    const KV = context.env.BATTERY_KV; 
    
    // ----------------------------------------------------------------
    // 1. GET-запрос: Чтение данных (для index.html)
    // ----------------------------------------------------------------
    if (context.request.method === 'GET') {
        try {
            const dataString = await KV.get(KV_KEY);
            // Если данных нет, возвращаем пустой массив
            const data = dataString ? JSON.parse(dataString) : []; 
            
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (err) {
            return new Response('Ошибка чтения данных из хранилища.', { status: 500 });
        }
    }

    // ----------------------------------------------------------------
    // 2. POST-запрос: Обновление данных (из Home Assistant)
    // Ожидаемый JSON: { id: 1, level: 95 }
    // ----------------------------------------------------------------
    if (context.request.method === 'POST') {
        try {
            const updateData = await context.request.json();
            const { id, level } = updateData;
            
            // Проверяем наличие обязательных полей
            if (id && level !== undefined) {
                
                // Получаем текущий массив данных или инициализируем его, если нет
                const dataString = await KV.get(KV_KEY);
                let batteries = dataString ? JSON.parse(dataString) : [
                    { id: 1, level: 0, timestamp: null },
                    { id: 2, level: 0, timestamp: null },
                    { id: 3, level: 0, timestamp: null },
                ];
                
                // Находим и обновляем нужную батарею
                const batteryIndex = batteries.findIndex(b => b.id === id);

                if (batteryIndex !== -1) {
                    batteries[batteryIndex].level = level;
                    // Обновляем метку времени
                    batteries[batteryIndex].timestamp = new Date().toISOString(); 
                    
                    // Сохраняем обновленный массив обратно в KV
                    await KV.put(KV_KEY, JSON.stringify(batteries));
                    
                    return new Response(`Батарея ${id} обновлена.`, { status: 200 });
                } else {
                    return new Response(`Батарея с ID ${id} не найдена (ожидаются 1, 2, 3).`, { status: 404 });
                }

            }

            return new Response('Неверный формат данных (требуются id, level).', { status: 400 });

        } catch (err) {
            return new Response(`Ошибка обработки POST-запроса: ${err.message}`, { status: 500 });
        }
    }
    
    return new Response('Метод не разрешен.', { status: 405 });
}
