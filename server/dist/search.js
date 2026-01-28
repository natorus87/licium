"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchWeb = searchWeb;
exports.formatSearchResults = formatSearchResults;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
// Return structured results for Web RAG processing
async function searchWeb(query, searxngUrl) {
    try {
        // INTERNAL OVERRIDE:
        if (searxngUrl.includes('.local') || searxngUrl.includes('localhost') || searxngUrl.includes('journai') || searxngUrl.includes('licium')) {
            console.log(`[Search] Detected local URL '${searxngUrl}', switching to internal K8s service 'http://searxng:8080'`);
            searxngUrl = 'http://searxng:8080';
        }
        if (!searxngUrl.startsWith('http')) {
            searxngUrl = `https://${searxngUrl}`;
        }
        searxngUrl = searxngUrl.replace(/\/$/, '');
        console.log(`[Search] Querying: ${searxngUrl}/search?q=${query}&format=json`);
        const agent = new https_1.default.Agent({ rejectUnauthorized: false });
        const response = await axios_1.default.get(`${searxngUrl}/search`, {
            params: {
                q: query,
                format: 'json',
                language: 'de'
            },
            headers: {
                'X-Forwarded-For': '127.0.0.1',
                'X-Real-IP': '127.0.0.1'
            },
            httpsAgent: agent,
            timeout: 5000
        });
        if (response.data && response.data.results) {
            // Standardize results
            const results = response.data.results.map((r) => ({
                title: r.title || 'Kein Titel',
                url: r.url || '',
                content: r.content || ''
            }));
            return results.slice(0, 5); // Return top 5 raw results
        }
        return [];
    }
    catch (error) {
        console.error("SearXNG Search Error:", error.message);
        return [];
    }
}
// Helper to format results as string (Backward Compatibility)
function formatSearchResults(results) {
    if (results.length === 0)
        return "Keine Suchergebnisse gefunden.";
    return results.map(r => {
        let content = r.content;
        if (content.length > 500) {
            content = content.substring(0, 500) + '...';
        }
        return `Titel: ${r.title}\nURL: ${r.url}\nInhalt: ${content}`;
    }).join('\n\n');
}
