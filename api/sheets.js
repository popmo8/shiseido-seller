// Vercel Serverless Function
// 此函數將用戶決定寫入 Google Sheets

export default async function handler(req, res) {
    // 只允許 POST 請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 啟用 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 處理 OPTIONS 請求（CORS preflight）
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { timestamp, decision, timeDiff } = req.body;

        // 從環境變數取得 Google Sheets 相關設定
        const SHEET_ID = process.env.GOOGLE_SHEET_ID;
        const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

        if (!SHEET_ID || !SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
            console.error('Missing configuration:', { 
                hasSheetId: !!SHEET_ID, 
                hasEmail: !!SERVICE_ACCOUNT_EMAIL,
                hasPrivateKey: !!SERVICE_ACCOUNT_PRIVATE_KEY
            });
            return res.status(500).json({ 
                error: 'Google Sheets not configured',
                details: 'Missing SHEET_ID, SERVICE_ACCOUNT_EMAIL or SERVICE_ACCOUNT_PRIVATE_KEY'
            });
        }

        console.log('Attempting to write to Google Sheets:', {
            timestamp,
            decision,
            timeDiff
        });

        // 生成 JWT token
        const accessToken = await getAccessToken(SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY);

        // 使用 Google Sheets API v4 添加新行
        const range = 'Sheet1!A:C';
        const values = [[timestamp, decision, timeDiff]];

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=RAW`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                values: values
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Google Sheets API Error:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            return res.status(response.status).json({ 
                error: 'Google Sheets API error',
                details: data
            });
        }

        console.log('Successfully wrote to Google Sheets');
        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('Error in sheets handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            stack: error.stack
        });
    }
}

// 生成 Google OAuth2 Access Token
async function getAccessToken(email, privateKey) {
    const now = Math.floor(Date.now() / 1000);
    
    // JWT Header
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };
    
    // JWT Claim Set
    const claimSet = {
        iss: email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };
    
    // Base64URL encode
    const base64UrlEncode = (obj) => {
        return Buffer.from(JSON.stringify(obj))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };
    
    const encodedHeader = base64UrlEncode(header);
    const encodedClaimSet = base64UrlEncode(claimSet);
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;
    
    // Sign with private key
    const crypto = await import('crypto');
    
    // 處理私鑰格式（移除 \\n 並替換為實際換行）
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    const signature = crypto
        .createSign('RSA-SHA256')
        .update(signatureInput)
        .sign(formattedPrivateKey, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    const jwt = `${signatureInput}.${signature}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
        throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
    }
    
    return tokenData.access_token;
}
