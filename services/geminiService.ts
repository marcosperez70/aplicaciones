import { GoogleGenAI, GenerateContentResponse, Part, GenerateContentParameters, GenerateContentCandidate, Content } from "@google/genai";
import { UiTexts, LanguageKeywords, SemanticMapData, Flashcard, SessionHistoryEntry } from '../types';
import { GEMINI_FLASH_MODEL, BASE_UI_TEXTS as FALLBACK_BASE_UI_TEXTS, FIXED_INTERACTION_LANGUAGE, LANGUAGE_KEYWORDS as APP_LANGUAGE_KEYWORDS } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

const parseJsonFromText = <T,>(text: string): T | null => {
    let jsonStr = text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    try {
        return JSON.parse(jsonStr) as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", e, "Original text:", text);
        return null;
    }
};

const preparePromptText = (
    type: string,
    // interactionLanguage: string, // Removed, using FIXED_INTERACTION_LANGUAGE
    course: string, 
    // languageKeywords: LanguageKeywords, // Removed, using APP_LANGUAGE_KEYWORDS
    uiTexts: UiTexts, 
    baseUiTexts: UiTexts, // This is FALLBACK_BASE_UI_TEXTS
    data: any = {}
): string => {
    const interactionLanguage = FIXED_INTERACTION_LANGUAGE;
    let prompt = `Responde ESTRICTA y EXCLUSIVAMENTE en el idioma: ${interactionLanguage}.\n`;
    const currentKeywords = APP_LANGUAGE_KEYWORDS[interactionLanguage.toLowerCase()] || APP_LANGUAGE_KEYWORDS['español'];

    if (course) { 
        prompt += `Adapta la complejidad y el lenguaje para un estudiante de ${course}, pero siempre manteniendo la respuesta en ${interactionLanguage}.\n`;
    }
    
    const getBaseUIText = (key: keyof UiTexts, fallbackUiTexts: UiTexts): string => {
        return baseUiTexts[key] || fallbackUiTexts[key] || "";
    };


    if (type === 'generateQuestion') {
        prompt += `Genera una pregunta de comprensión concisa y clara sobre el contenido proporcionado.\n`;
        if (data.askedQuestions && data.askedQuestions.size > 0) prompt += `Asegúrate de que la pregunta NO sea una de las siguientes: ${Array.from(data.askedQuestions).join('; ')}.\n`;
        
        let typeForPromptConstruction = data.questionType;
        // Since uiTexts will be BASE_UI_TEXTS, direct comparison is fine
        const currentQtKey = Object.keys(baseUiTexts).find(k => baseUiTexts[k as keyof UiTexts] === data.questionType && k.startsWith('qType')) as keyof UiTexts | undefined;


        if (data.effectiveType) { // effectiveType is already base version
            typeForPromptConstruction = data.effectiveType; 
        } else if (currentQtKey) {
            typeForPromptConstruction = getBaseUIText(currentQtKey, FALLBACK_BASE_UI_TEXTS);
        }


        if (typeForPromptConstruction === getBaseUIText('qTypeDefinition', FALLBACK_BASE_UI_TEXTS)) prompt += `La pregunta debe pedir una definición de un concepto clave.\n`;
        else if (typeForPromptConstruction === getBaseUIText('qTypeRelationship', FALLBACK_BASE_UI_TEXTS)) prompt += `La pregunta debe pedir la relación entre dos o más conceptos.\n`;
        else if (typeForPromptConstruction === getBaseUIText('qTypeApplication', FALLBACK_BASE_UI_TEXTS)) prompt += `La pregunta debe pedir un ejemplo o aplicación de un concepto.\n`;
        else if (typeForPromptConstruction === getBaseUIText('qTypeTrueFalse', FALLBACK_BASE_UI_TEXTS)) prompt += `La pregunta debe ser una ÚNICA afirmación de Verdadero/Falso que el alumno debe evaluar y justificar.\n`;
        else if (typeForPromptConstruction === getBaseUIText('qTypeMultipleChoice', FALLBACK_BASE_UI_TEXTS)) {
            prompt += `La pregunta debe ser de opción múltiple con 3 o 4 opciones de respuesta, donde SOLO UNA opción es correcta. Indica claramente cuál es la pregunta y cuáles son las opciones (por ejemplo, A, B, C, D). No indiques la respuesta correcta en la generación de la pregunta.\n`;
        }
        
        const currentSmKey = Object.keys(baseUiTexts).find(k => baseUiTexts[k as keyof UiTexts] === data.studyMode && k.startsWith('studyMode')) as keyof UiTexts | undefined;
        const baseStudyMode = currentSmKey ? getBaseUIText(currentSmKey, FALLBACK_BASE_UI_TEXTS) : data.studyMode;


        if (baseStudyMode === getBaseUIText('studyModeGuided', FALLBACK_BASE_UI_TEXTS)) {
            const coveredConceptsList = data.coveredConcepts ? Array.from(data.coveredConcepts).join(', ') : '';
            prompt += `Formula una pregunta sobre el siguiente concepto lógico o una nueva sección del documento que aún no se haya cubierto. Conceptos ya cubiertos: [${coveredConceptsList}]. Después de la pregunta, sugiere brevemente el concepto o área que cubre la pregunta para que podamos registrarlo. Por ejemplo: "Pregunta: [Tu pregunta] (Concepto: [Nombre del concepto])"\n`;
        }
        prompt += `Recuerda: Toda la pregunta y cualquier texto adicional deben estar en ${interactionLanguage}.\n`;
    } else if (type === 'evaluateAnswer') {
        prompt += `Pregunta: "${data.currentQuestion}"\n`;
        prompt += `Respuesta del alumno: "${data.userAnswer}"\n`;
        prompt += `IMPORTANTE: Tu evaluación y explicación DEBEN estar EXCLUSIVAMENTE en ${interactionLanguage}, sin importar el idioma en que el alumno haya respondido.\n`;
        prompt += `Evalúa si la respuesta del alumno es ${currentKeywords.correct} o ${currentKeywords.incorrect} basándote estrictamente en el contenido proporcionado y la pregunta. Tu respuesta DEBE empezar con la palabra clave '${currentKeywords.correct}' si es correcta, o '${currentKeywords.incorrect}' si es incorrecta. Después de esta palabra clave, añade un punto y luego la explicación detallada. Si la pregunta era de opción múltiple, indica cuál era la opción correcta en tu explicación si la respuesta del alumno fue incorrecta. Toda tu evaluación y explicación debe estar en ${interactionLanguage}.\n`;
    } else if (type === 'generateReport') {
        prompt += `Basado en el siguiente historial de preguntas y respuestas de un alumno, genera un informe conciso sobre sus puntos fuertes y débiles. Incluye el número total de respuestas correctas (${data.correctCount}) e incorrectas (${data.incorrectCount}).\n`;
        prompt += `Historial de Sesión: ${JSON.stringify(data.sessionHistory, null, 2)}\n`;
        prompt += `El informe completo debe estar en ${interactionLanguage}.\n`;
    } else if (type === 'generateSuggestions') {
         prompt += `Basado en el siguiente historial de preguntas y respuestas del alumno, y considerando que ha respondido ${data.correctCount} correctamente y ${data.incorrectCount} incorrectamente, sugiere áreas específicas del documento (conceptos, secciones, temas) que el alumno debería repasar con más atención.\n`;
        prompt += `Sé conciso y usa un formato de lista simple.\n`;
        prompt += `Historial: ${JSON.stringify(data.sessionHistory, null, 2)}\n`;
        prompt += `Todas las sugerencias deben estar en ${interactionLanguage}.\n`;
    } else if (type === 'generateSummary') {
        prompt += `Genera un resumen conciso y fácil de entender del material de estudio proporcionado (texto y/o imagen).\n`;
        prompt += `El resumen debe capturar las ideas principales y los puntos clave. Todo el resumen debe estar en ${interactionLanguage}.\n`;
    } else if (type === 'elaborateConcept') {
        prompt += `Proporciona una explicación más detallada y clara sobre el siguiente tema, pregunta o concepto: "${data.concept}".\n`;
        prompt += `Utiliza el material de estudio proporcionado como base para tu explicación.\n`;
        prompt += `Si el material no contiene información directa, intenta inferir o explicar basándote en principios generales relacionados con el tema del material. La explicación completa debe estar en ${interactionLanguage}.\n`;
    } else if (type === 'generateFaq') {
        prompt += `Genera una lista exhaustiva de preguntas frecuentes (FAQ) relevantes y sus respuestas concisas basadas en el material de estudio proporcionado (texto y/o imagen). Para documentos más largos, genera más preguntas.\n`;
        prompt += `Formatea CADA pregunta y respuesta de la siguiente manera, usando Markdown:\n`;
        prompt += `**Pregunta [Número]:** [Texto de la pregunta]\n`;
        prompt += `**Respuesta [Número]:** [Texto de la respuesta]\n\n`;
        prompt += `Asegúrate de que haya una línea en blanco entre cada par de pregunta/respuesta. Todas las preguntas y respuestas deben estar en ${interactionLanguage}.\n`;
    } else if (type === 'generateAnalogies') {
        prompt += `Genera 1 o 2 analogías o metáforas creativas y claras para explicar el siguiente concepto o pregunta: "${data.concept}".\n`;
        prompt += `Las analogías deben ser fáciles de entender y relevantes para el concepto, ayudando a simplificarlo.\n`;
        prompt += `Utiliza el material de estudio proporcionado como base para el contexto si es necesario. Todas las analogías deben estar en ${interactionLanguage}.\n`;
    } else if (type === 'describeImageForMap') {
        prompt += `Describe la imagen proporcionada con el mayor detalle posible. Concéntrate en los objetos, sus relaciones, el contexto y cualquier texto visible. El objetivo es generar una descripción que pueda ser utilizada posteriormente para crear un mapa conceptual. La descripción debe estar en ${interactionLanguage}.\n`;
    }
    else if (type === 'generateFlashcardsBase') { 
        prompt += `Genera un conjunto de flashcards basadas en el material de estudio proporcionado (texto y/o imagen). Cada flashcard debe tener un "anverso" (término, concepto clave o pregunta breve) y un "reverso" (definición, explicación o respuesta).\n`;
    } else if (type === 'generateSemanticMapBase') { 
        // Base part for context like language and course.
    }
    // Removed translateUI case

    return prompt;
};

async function callGemini<T = string,>(
    modelPrompt: string | Content, 
    jsonOutput: boolean = false,
    schemaForJson?: any
): Promise<T | null> {
    if (!API_KEY) {
      throw new Error("API_KEY is not configured. Cannot call Gemini API.");
    }

    const request: GenerateContentParameters = {
        model: GEMINI_FLASH_MODEL,
        contents: typeof modelPrompt === 'string' ? [{role: "user", parts: [{text: modelPrompt}]}] : [modelPrompt], // Ensure contents is Content[]
        config: {},
    };

    if (jsonOutput) {
        request.config!.responseMimeType = "application/json";
        if (schemaForJson) {
            request.config!.responseSchema = schemaForJson;
        }
    }
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent(request);
        const responseText = response.text;

        if (!responseText) {
            const candidate: GenerateContentCandidate | undefined = response.candidates?.[0];
            if (candidate?.finishReason && candidate.finishReason !== "STOP") {
                 console.error('Gemini API call issue:', candidate.finishReason, candidate.safetyRatings);
                 let readableReason = candidate.finishReason;
                 if (candidate.finishReason === "MAX_TOKENS") readableReason = "La respuesta fue demasiado larga.";
                 if (candidate.finishReason === "SAFETY") readableReason = "La respuesta fue bloqueada por motivos de seguridad.";
                 if (candidate.finishReason === "RECITATION") readableReason = "La respuesta fue bloqueada por recitación.";
                 throw new Error(`Respuesta incompleta o bloqueada por IA: ${readableReason}.`);
            }
            console.error('Empty response from Gemini API or text part missing:', response);
            throw new Error('Respuesta inesperada o vacía de la IA.');
        }

        if (jsonOutput) {
            return parseJsonFromText<T>(responseText);
        }
        return responseText as unknown as T; 

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        throw new Error(error.message || "Error al comunicarse con la IA.");
    }
}

const buildContentRequest = (
    promptText: string,
    studyContentText?: string | null,
    studyContentImageBase64?: string | null
): Content => {
    const parts: Part[] = [];
    
    // Order: Image (if any), Text Content (if any), Prompt Instructions
    if (studyContentImageBase64) {
        parts.push({
            inlineData: {
                mimeType: 'image/png', 
                data: studyContentImageBase64,
            },
        });
    }
    if (studyContentText) {
        parts.push({ text: `Contenido de estudio (texto):\n${studyContentText}` });
    }
    parts.push({ text: promptText }); 

    return { role: "user", parts };
};


export const geminiService = {
    generateQuestion: async (
        course: string, studyContentText: string | null, studyContentImageBase64: string | null,
        questionType: string, studyMode: string, askedQuestions: Set<string>, coveredConcepts: Set<string>,
        uiTexts: UiTexts, baseUiTexts: UiTexts, effectiveType: string
    ): Promise<string | null> => {
        const promptText = preparePromptText('generateQuestion', course, uiTexts, baseUiTexts, {
            questionType, studyMode, askedQuestions, coveredConcepts, effectiveType
        });
        const contentRequest = buildContentRequest(promptText, studyContentText, studyContentImageBase64);
        return callGemini<string>(contentRequest);
    },

    evaluateAnswer: async (
        course: string, studyContentText: string | null, studyContentImageBase64: string | null,
        currentQuestion: string, userAnswer: string, uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<string | null> => {
        const promptText = preparePromptText('evaluateAnswer', course, uiTexts, baseUiTexts, {
            currentQuestion, userAnswer
        });
        const contentRequest = buildContentRequest(promptText, studyContentText, studyContentImageBase64);
        return callGemini<string>(contentRequest);
    },

    generateReport: async (
        course: string, 
        sessionHistory: SessionHistoryEntry[], correctCount: number, incorrectCount: number,
        uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<string | null> => {
        const promptText = preparePromptText('generateReport', course, uiTexts, baseUiTexts, {
            sessionHistory, correctCount, incorrectCount
        });
        return callGemini<string>(promptText);
    },

    generateSuggestions: async (
        course: string, 
        sessionHistory: SessionHistoryEntry[], correctCount: number, incorrectCount: number,
        uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<string | null> => {
        const promptText = preparePromptText('generateSuggestions', course, uiTexts, baseUiTexts, {
            sessionHistory, correctCount, incorrectCount
        });
        return callGemini<string>(promptText);
    },
    
    generateSummary: async (
        course: string, studyContentText: string | null, studyContentImageBase64: string | null,
        uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<string | null> => {
        const promptText = preparePromptText('generateSummary', course, uiTexts, baseUiTexts);
        const contentRequest = buildContentRequest(promptText, studyContentText, studyContentImageBase64);
        return callGemini<string>(contentRequest);
    },

    elaborateConcept: async (
        course: string, studyContentText: string | null, studyContentImageBase64: string | null,
        concept: string, uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<string | null> => {
        const promptText = preparePromptText('elaborateConcept', course, uiTexts, baseUiTexts, { concept });
        const contentRequest = buildContentRequest(promptText, studyContentText, studyContentImageBase64);
        return callGemini<string>(contentRequest);
    },

    generateFaq: async (
        course: string, studyContentText: string | null, studyContentImageBase64: string | null,
        uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<string | null> => {
        const promptText = preparePromptText('generateFaq', course, uiTexts, baseUiTexts);
        const contentRequest = buildContentRequest(promptText, studyContentText, studyContentImageBase64);
        return callGemini<string>(contentRequest);
    },
    
    generateAnalogies: async (
        course: string, studyContentText: string | null, studyContentImageBase64: string | null,
        concept: string, uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<string | null> => {
        const promptText = preparePromptText('generateAnalogies', course, uiTexts, baseUiTexts, { concept });
        const contentRequest = buildContentRequest(promptText, studyContentText, studyContentImageBase64);
        return callGemini<string>(contentRequest);
    },

    generateFlashcards: async (
        course: string, studyContentText: string | null, studyContentImageBase64: string | null,
        uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<{ flashcards: Flashcard[] } | null> => {
        const schema = {
            type: "OBJECT",
            properties: {
                "flashcards": {
                    type: "ARRAY",
                    description: "Una lista de flashcards.",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "front": { "type": "STRING", "description": "El contenido del anverso de la flashcard (término, concepto, pregunta)." },
                            "back": { "type": "STRING", "description": "El contenido del reverso de la flashcard (definición, explicación, respuesta)." }
                        },
                        required: ["front", "back"]
                    }
                }
            },
            required: ["flashcards"]
        };
        let promptText = preparePromptText('generateFlashcardsBase', course, uiTexts, baseUiTexts);
        promptText += `\nGenera entre 5 y 15 flashcards, dependiendo de la extensión y complejidad del material. Para material más extenso o complejo, genera más flashcards.\n`;
        promptText += `El texto en AMBOS LADOS de CADA flashcard debe estar en ${FIXED_INTERACTION_LANGUAGE}.\n`;
        promptText += `Devuelve las flashcards en formato JSON, siguiendo este esquema:\n`;
        promptText += `Asegúrate de que el JSON sea válido y siga el esquema proporcionado.\n`;
        
        const contentRequest = buildContentRequest(promptText, studyContentText, studyContentImageBase64);
        return callGemini<{ flashcards: Flashcard[] }>(contentRequest, true, schema);
    },

    describeImageForMap: async (
        course: string, studyContentTextForContext: string | null, studyContentImageBase64: string | null, 
        uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<string | null> => {
        const promptText = preparePromptText('describeImageForMap', course, uiTexts, baseUiTexts);
        const contentRequest = buildContentRequest(promptText, studyContentTextForContext, studyContentImageBase64);
        return callGemini<string>(contentRequest);
    },

    generateSemanticMap: async (
        course: string, effectiveStudyText: string, 
        uiTexts: UiTexts, baseUiTexts: UiTexts,
    ): Promise<SemanticMapData | null> => {
        const schema = {
            type: "OBJECT",
            properties: {
                "nodes": {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "id": { type: ["STRING", "NUMBER"] }, "label": { type: "STRING" }, "title": { type: "STRING" }
                        }, required: ["id", "label"]
                    }
                },
                "edges": {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "from": { type: ["STRING", "NUMBER"] }, "to": { type: ["STRING", "NUMBER"] }, "label": { type: "STRING" }, "arrows": { type: "STRING" }
                        }, required: ["from", "to"]
                    }
                }
            }, required: ["nodes", "edges"]
        };
        let promptText = preparePromptText('generateSemanticMapBase', course, uiTexts, baseUiTexts);
        promptText += `Analiza el siguiente material de estudio (que puede ser texto, una descripción detallada de una imagen, o una combinación de ambos) y extrae los conceptos clave y sus relaciones para construir un mapa conceptual.\n`;
        promptText += `El objetivo es visualizar las ideas principales y cómo se conectan entre sí.\n`;
        promptText += `Identifica entre 5 y 15 nodos principales, dependiendo de la complejidad del material. Para material muy corto, pueden ser menos.\n`;
        promptText += `Las etiquetas de los nodos y las aristas deben estar en ${FIXED_INTERACTION_LANGUAGE}.\n\n`;
        promptText += `MATERIAL DE ESTUDIO PROPORCIONADO:\n---\n${effectiveStudyText}\n---\n\n`;
        promptText += `Devuelve los datos del mapa conceptual en formato JSON, siguiendo este esquema exacto:\n`;
        promptText += `Asegúrate de que el JSON sea válido y siga el esquema proporcionado. El JSON DEBE ser un OBJETO con dos claves principales: "nodes" (una lista de objetos nodo) y "edges" (una lista de objetos arista). Los 'id' de los nodos deben ser únicos y referenciados correctamente en las aristas ('from' y 'to').\n`;

        return callGemini<SemanticMapData>(promptText, true, schema);
    },

    // translateUiTexts function removed as UI translation is no longer a feature
};