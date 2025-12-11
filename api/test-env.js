// 测试环境变量是否正确加载
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.status(200).json({
        hasSheetId: !!process.env.GOOGLE_SHEET_ID,
        hasApiKey: !!process.env.GOOGLE_SHEETS_API_KEY,
        sheetIdLength: process.env.GOOGLE_SHEET_ID?.length || 0,
        apiKeyLength: process.env.GOOGLE_SHEETS_API_KEY?.length || 0
    });
}
