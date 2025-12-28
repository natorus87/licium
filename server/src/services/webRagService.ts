import axios from 'axios';
import * as cheerio from 'cheerio';
import { embeddingService } from './embeddingService';
import { SearchResult } from '../search';

export const webRagService = {

    // Main entry point: Enrich search results with vector ranking
    enrichWebResults: async (query: string, results: SearchResult[], embeddingConfig: any): Promise<string> => {
        if (!results || results.length === 0) return "Keine Suchergebnisse.";

        console.log(`[WebRAG] Enriched processing for ${results.length} URLs...`);

        // 1. Fetch & Scrape (Parallel)
        // Limit to top 3 for performance
        const topResults = results.slice(0, 3);
        const scrapedPages = await Promise.all(topResults.map(async (r) => {
            try {
                console.log(`[WebRAG] Fetching ${r.url}...`);
                const response = await axios.get(r.url, { timeout: 3000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LiciumBot/1.0)' } });
                const $ = cheerio.load(response.data);

                // Cleanup
                $('script').remove();
                $('style').remove();
                $('nav').remove();
                $('footer').remove();
                $('header').remove();

                const text = $('body').text().replace(/\s+/g, ' ').trim();
                return { ...r, fullText: text };
            } catch (e: any) {
                console.warn(`[WebRAG] Failed to fetch ${r.url}:`, e.message);
                return { ...r, fullText: '' }; // Fallback to snippet
            }
        }));

        // 2. Chunk & Embed
        const allChunks: { text: string, url: string, title: string, vector?: number[] }[] = [];

        for (const page of scrapedPages) {
            const content = page.fullText && page.fullText.length > 500 ? page.fullText : page.content;
            const chunks = embeddingService.chunkText(content, 512, 50); // Small chunks for precision

            // Limit chunks per page to avoid massive processing
            const limitedChunks = chunks.slice(0, 10);

            limitedChunks.forEach(chunk => {
                allChunks.push({ text: chunk, url: page.url, title: page.title });
            });
        }

        if (allChunks.length === 0) return "Konnte keine relevanten Inhalte extrahieren.";

        console.log(`[WebRAG] Generated ${allChunks.length} chunks. Embedding and ranking...`);

        // 3. Generate Embeddings (Query & Chunks)
        try {
            const queryVector = await embeddingService.getEmbedding(query, embeddingConfig);

            // Embed chunks (Sequential to avoid rate limits/overload)
            // In a real prod env, we'd batch this.
            for (const chunk of allChunks) {
                try {
                    chunk.vector = await embeddingService.getEmbedding(chunk.text, embeddingConfig);
                } catch (e) {
                    // Ignore failed chunks
                }
            }

            // 4. Rank (Cosine Similarity)
            const ranked = allChunks
                .filter(c => c.vector)
                .map(chunk => {
                    const similarity = cosineSimilarity(queryVector, chunk.vector!);
                    return { ...chunk, similarity };
                })
                .sort((a, b) => b.similarity - a.similarity);

            // 5. Select Top Context
            const topK = ranked.slice(0, 5);

            return topK.map(c => `QUELLE: [${c.title}](${c.url})\nINHALT: ${c.text}`).join('\n\n');

        } catch (error) {
            console.error("[WebRAG] Embedding failed:", error);
            // Fallback to snippets
            return results.map(r => `Titel: ${r.title}\nURL: ${r.url}\nZusammenfassung: ${r.content}`).join('\n\n');
        }
    }
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
