/**
 * Coinbase Commerce API Service
 * Handles secure charge creation for crypto payments.
 */

const COINBASE_API_URL = 'https://api.commerce.coinbase.com/charges';
const API_KEY = import.meta.env.VITE_COINBASE_API_KEY;

export interface CoinbaseChargeRequest {
    name: string;
    description: string;
    amount: string;
    currency: string;
    metadata?: Record<string, any>;
}

export interface CoinbaseChargeResponse {
    data: {
        id: string;
        code: string;
        hosted_url: string;
        [key: string]: any;
    };
}

export const createCoinbaseCharge = async (params: CoinbaseChargeRequest): Promise<string> => {
    if (!API_KEY) {
        throw new Error('Coinbase API Key is not configured. Please add VITE_COINBASE_API_KEY to your .env file.');
    }

    const response = await fetch(COINBASE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CC-Api-Key': API_KEY,
            'X-CC-Version': '2018-03-22',
        },
        body: JSON.stringify({
            name: params.name,
            description: params.description,
            local_price: {
                amount: params.amount,
                currency: params.currency,
            },
            pricing_type: 'fixed_price',
            metadata: params.metadata || {},
            redirect_url: window.location.origin,
            cancel_url: window.location.origin,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create Coinbase charge');
    }

    const result: CoinbaseChargeResponse = await response.json();
    return result.data.hosted_url;
};
