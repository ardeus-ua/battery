// ВРЕМЕННЫЙ КОД ДЛЯ ОТЛАДКИ
export async function onRequest(context) {
    const method = context.request.method;
    
    // Вернет статус 200 и сообщит, какой метод был использован
    return new Response(JSON.stringify({
        status: "OK",
        received_method: method,
        message: "Это отладочный ответ. Удалите этот код после проверки."
    }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
    });
}
