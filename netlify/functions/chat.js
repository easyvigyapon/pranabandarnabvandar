exports.handler = async (event) => {
    // Only allow POST requests for the chat API
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'POST method required' };
    }

    try {
        const { query } = JSON.parse(event.body);

        const systemPrompt = `You are a shopping assistant for 'Pranab And Arnab Vandar', a grocery shop in Ajodhya. 
        The user will tell you what they want to cook or what they need. 
        Your task is to identify 5-8 essential ingredients available in a typical Indian grocery store like this one.
        Important categories at the shop include: Daily Groceries (Rice, Dal, Oil, Tea, Sugar), Household Needs (Soaps, Detergent), 
        Snacks, Spices (Turmeric, Cumin, Chilli), Cold Beverages, Fresh Roots (Potato, Onion, Ginger, Garlic), and Disposables.
        Respond ONLY with a JSON object in this format: { "title": "List Name", "items": ["Item 1", "Item 2", ...] }. 
        Do not include any other text or explanation. Note that your response should be valid JSON containing Bengali strings.`;

        const url = `https://openrouter.ai/api/v1/chat/completions`;
        
        // This securely grabs the key from Netlify Environment Variables
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key is missing in Netlify environment variables.' })
            };
        }

        const payload = {
            model: "qwen/qwen3.6-plus-preview:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://pranab-arnab-vandar.netlify.app',
                'X-Title': 'Smart Grocery Assistant'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // Send the pure response down to the client index.html
        const result = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
