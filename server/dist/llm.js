"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = handleChat;
const openai_1 = __importDefault(require("openai"));
const axios_1 = __importDefault(require("axios"));
const search_1 = require("./search");
const webRagService_1 = require("./services/webRagService");
async function handleChat(messages, noteContent, mode, config, useSearch = false, language = 'de') {
    // Localization Map
    const prompts = {
        de: {
            system: "Du bist ein hilfreicher KI-Assistent für eine Notiz-App. Antworte immer auf Deutsch.",
            webContext: "ZUSATZINFORMATIONEN AUS DEM WEB (RAG)",
            noteContext: "Hier ist der Inhalt der aktuell ausgewählten Notiz",
            truncated: "[Inhalt gekürzt, da zu lang]",
            summarize: "Bitte fasse den Notizinhalt zusammen. Sei präzise und kurz.",
            rewrite: "Bitte formuliere den Notizinhalt klarer und strukturierter um. Gib NUR den umformulierten Inhalt zurück.",
            structure: "Bitte schlage eine strukturierte Gliederung für diese Notiz vor."
        },
        en: {
            system: "You are a helpful AI assistant for a note-taking app. Always answer in English.",
            webContext: "ADDITIONAL INFORMATION FROM WEB (RAG)",
            noteContext: "Here is the content of the currently selected note",
            truncated: "[Content truncated, too long]",
            summarize: "Please summarize the note content. Be precise and concise.",
            rewrite: "Please rewrite the note content to be clearer and more structured. Return ONLY the rewritten content.",
            structure: "Please suggest a structured outline for this note."
        },
        fr: {
            system: "Tu es un assistant IA utile pour une application de prise de notes. Réponds toujours en Français.",
            webContext: "INFORMATIONS SUPPLÉMENTAIRES DU WEB (RAG)",
            noteContext: "Voici le contenu de la note actuellement sélectionnée",
            truncated: "[Contenu tronqué, trop long]",
            summarize: "Veuillez résumer le contenu de la note. Soyez précis et concis.",
            rewrite: "Veuillez réécrire le contenu de la note pour qu'il soit plus clair et structuré. Retournez UNIQUEMENT le contenu réécrit.",
            structure: "Veuillez suggérer un plan structuré pour cette note."
        },
        it: {
            system: "Sei un utile assistente IA per un'app di appunti. Rispondi sempre in Italiano.",
            webContext: "INFORMAZIONI AGGIUNTIVE DAL WEB (RAG)",
            noteContext: "Ecco il contenuto della nota attualmente selezionata",
            truncated: "[Contenuto troncato, troppo lungo]",
            summarize: "Per favore riassumi il contenuto della nota. Sii preciso e conciso.",
            rewrite: "Per favore riscrisci il contenuto della nota per renderlo più chiaro e strutturato. Restituisci SOLO il contenuto riscritto.",
            structure: "Per favore suggerisci una struttura per questa nota."
        },
        es: {
            system: "Eres un asistente de IA útil para una aplicación de notas. Responde siempre en Español.",
            webContext: "INFORMACIÓN ADICIONAL DE LA WEB (RAG)",
            noteContext: "Aquí está el contenido de la nota seleccionada actualmente",
            truncated: "[Contenido truncado, demasiado largo]",
            summarize: "Por favor resume el contenido de la nota. Sé preciso y conciso.",
            rewrite: "Por favor reescribe el contenido de la nota para que sea más claro y estructurado. Devuelve SOLO el contenido reescrito.",
            structure: "Por favor sugiere una estructura para esta nota."
        },
        nl: {
            system: "Je bent een behulpzame AI-assistent voor een notitie-app. Antwoord altijd in het Nederlands.",
            webContext: "AANVULLENDE INFORMATIE VAN HET WEB (RAG)",
            noteContext: "Hier is de inhoud van de geselecteerde notitie",
            truncated: "[Inhoud ingekort, te lang]",
            summarize: "Vat de inhoud van de notitie samen. Wees precies en beknopt.",
            rewrite: "Herschrijf de inhoud van de notitie zodat deze duidelijker en gestructureerder is. Geef ALLEEN de herschreven inhoud terug.",
            structure: "Stel een gestructureerde indeling voor deze notitie voor."
        }
    };
    const t = prompts[language] || prompts['de']; // Fallback to German if language not found
    // Construct System Prompt
    let systemPrompt = t.system;
    // Web Search Integration
    console.log(`[LLM] useSearch=${useSearch}, searxngUrl=${config.searxngUrl}, language=${language}`);
    if (useSearch && config.searxngUrl) {
        // Use the last user message as the search query
        const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
        if (lastUserMessage) {
            console.log(`[LLM] Calling searchWeb with query: "${lastUserMessage.content}"`);
            try {
                const searchResults = await (0, search_1.searchWeb)(lastUserMessage.content, config.searxngUrl);
                console.log(`[LLM] Raw Search results: ${searchResults.length}`);
                let webContext = "";
                // Use WebRAG if possible
                if (searchResults.length > 0) {
                    webContext = await webRagService_1.webRagService.enrichWebResults(lastUserMessage.content, searchResults, config);
                }
                else {
                    webContext = "No results found.";
                }
                systemPrompt += `\n\n${t.webContext}:\n${webContext}\n\nNutze diese Informationen, um die Anfrage des Benutzers zu beantworten. Zitiere die URLs als Markdown Links.`;
            }
            catch (err) {
                console.error("[LLM] Web Search Failed:", err);
                systemPrompt += `\n\n(Web search failed: ${err.message})`;
            }
        }
    }
    if (noteContent) {
        // Truncate note content to prevent overflow (approx 3000 tokens)
        const MAX_CONTEXT_LENGTH = 12000;
        let truncatedContent = noteContent;
        if (noteContent.length > MAX_CONTEXT_LENGTH) {
            truncatedContent = noteContent.substring(0, MAX_CONTEXT_LENGTH) + `\n... ${t.truncated}`;
        }
        systemPrompt += `\n\n${t.noteContext}:\n---\n${truncatedContent}\n---\n`;
    }
    if (mode === 'summarize') {
        systemPrompt += `\n${t.summarize}`;
    }
    else if (mode === 'rewrite') {
        systemPrompt += `\n${t.rewrite}`;
    }
    else if (mode === 'structure') {
        systemPrompt += `\n${t.structure}`;
    }
    const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];
    let responseContent = '';
    if (config.type === 'openai' || config.type === 'custom') {
        if (!config.apiKey && config.type === 'openai')
            throw new Error("OpenAI API Key is missing. Please configure it in the settings.");
        // For custom providers (TogetherAI, Groq, etc), they usually support OpenAI SDK
        // by changing the baseURL.
        const openai = new openai_1.default({
            apiKey: config.apiKey || 'dummy', // Some local servers might not need key
            baseURL: config.baseUrl || undefined
        });
        const completion = await openai.chat.completions.create({
            model: config.model,
            messages: fullMessages,
        });
        if (!completion.choices || completion.choices.length === 0) {
            console.error("OpenAI/Custom Provider Response Issue:", JSON.stringify(completion, null, 2));
            throw new Error("Invalid response from LLM Provider: No choices returned.");
        }
        responseContent = completion.choices[0]?.message?.content || '';
    }
    else if (config.type === 'ollama') {
        const baseUrl = config.baseUrl || 'http://localhost:11434';
        const model = config.model || 'llama3';
        try {
            const res = await axios_1.default.post(`${baseUrl}/api/chat`, {
                model: model,
                messages: fullMessages,
                stream: false
            });
            responseContent = res.data.message.content;
        }
        catch (error) {
            console.error("Ollama Error:", error);
            throw new Error("Failed to connect to Ollama. Make sure it is running.");
        }
    }
    return responseContent;
}
