import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

import {
  UiTexts, ToastState, ToastType, Flashcard, SemanticMapData,
  SessionHistoryEntry, ActiveTab
} from './types';
import { BASE_UI_TEXTS, LANGUAGE_KEYWORDS, COURSE_OPTIONS, FIXED_INTERACTION_LANGUAGE } from './constants';

import Toast from './components/Toast';
import DescriptionModalContent from './components/DescriptionModalContent';
import TabButton from './components/TabButton';
import ConfirmationModal from './components/ConfirmationModal';
import OutputModal from './components/OutputModal';
import FlashcardModal from './components/FlashcardModal';
import SemanticMapModal from './components/SemanticMapModal';
// import InitialLoadingScreen from './components/InitialLoadingScreen'; // Removed
import FullscreenButton from './components/FullscreenButton';

// Services
import { geminiService } from './services/geminiService';
import { fileProcessorService } from './services/fileProcessorService';
// import { translationService } from './services/translationService'; // Removed
import { clipboardService } from './services/clipboardService';


const App: React.FC = () => {
    // uiTexts will always be BASE_UI_TEXTS as translation is removed
    const uiTexts = BASE_UI_TEXTS; 
    const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: ToastType.INFO });
    
    const [studyContentText, setStudyContentText] = useState<string>('');
    const [studyContentImageBase64, setStudyContentImageBase64] = useState<string | null>(null);
    // const [interactionLanguage, setInteractionLanguage] = useState<string>(DEFAULT_INTERACTION_LANGUAGE); // Removed
    const [course, setCourse] = useState<string>(COURSE_OPTIONS[0]);

    // Removed state related to interface translation
    // const [isInterfaceTranslating, setIsInterfaceTranslating] = useState<boolean>(false);
    // const [isInitialTranslating, setIsInitialTranslating] = useState<boolean>(true); 
    // const [initialTranslationLanguage, setInitialTranslationLanguage] = useState<string>('');

    const [isPdfJsLoaded, setIsPdfJsLoaded] = useState<boolean>(false);
    const [isVisNetworkLoaded, setIsVisNetworkLoaded] = useState<boolean>(false);
    const [isMammothLoaded, setIsMammothLoaded] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState<ActiveTab>('contenido');
    
    const [questionType, setQuestionType] = useState<string>(BASE_UI_TEXTS.qTypeRandom);
    const [studyMode, setStudyMode] = useState<string>(BASE_UI_TEXTS.studyModeRandom);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [currentConcept, setCurrentConcept] = useState<string>('');
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');
    const [isPracticeLoading, setIsPracticeLoading] = useState<boolean>(false);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [incorrectCount, setIncorrectCount] = useState<number>(0);
    const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([]);
    const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
    const [coveredConcepts, setCoveredConcepts] = useState<Set<string>>(new Set());
    const [conceptToElaborate, setConceptToElaborate] = useState<string>('');

    const [reportContent, setReportContent] = useState<string>('');
    const [suggestionsContent, setSuggestionsContent] = useState<string>('');
    const [isReportLoading, setIsReportLoading] = useState<boolean>(false);

    const [showDescriptionModal, setShowDescriptionModal] = useState<boolean>(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
    const [confirmationModalMessage, setConfirmationModalMessage] = useState<string>('');
    const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(null);

    const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
    const [smartSummary, setSmartSummary] = useState<string>('');
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

    const [showFaqModal, setShowFaqModal] = useState<boolean>(false);
    const [faqContent, setFaqContent] = useState<string>('');
    const [isFaqLoading, setIsFaqLoading] = useState<boolean>(false);
    
    const [showElaborationModal, setShowElaborationModal] = useState<boolean>(false);
    const [elaboratedExplanation, setElaboratedExplanation] = useState<string>('');
    const [isElaborationLoading, setIsElaborationLoading] = useState<boolean>(false);

    const [showAnalogyModal, setShowAnalogyModal] = useState<boolean>(false);
    const [analogiesContent, setAnalogiesContent] = useState<string>('');
    const [isAnalogyLoading, setIsAnalogyLoading] = useState<boolean>(false);

    const [showFlashcardModal, setShowFlashcardModal] = useState<boolean>(false);
    const [flashcardsData, setFlashcardsData] = useState<Flashcard[]>([]);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
    const [isFlashcardFlipped, setIsFlashcardFlipped] = useState<boolean>(false);
    const [isFlashcardsLoading, setIsFlashcardsLoading] = useState<boolean>(false);

    const [showSemanticMapModal, setShowSemanticMapModal] = useState<boolean>(false);
    const [semanticMapData, setSemanticMapData] = useState<SemanticMapData | null>(null);
    const [isSemanticMapLoading, setIsSemanticMapLoading] = useState<boolean>(false);
    
    const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

    const appRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    const showToast = useCallback((message: string, type: ToastType = ToastType.INFO) => {
        setToast({ show: true, message, type });
    }, []);

    useEffect(() => {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        pdfScript.async = true;
        pdfScript.onload = () => {
            if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                setIsPdfJsLoaded(true);
            } else { showToast(uiTexts.pdfLibNotLoadedToast, ToastType.ERROR); }
        };
        pdfScript.onerror = () => { showToast('Error al cargar script de PDF.', ToastType.ERROR); };
        document.head.appendChild(pdfScript);

        const visNetworkScript = document.createElement('script');
        visNetworkScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.9/standalone/umd/vis-network.min.js';
        visNetworkScript.async = true;
        visNetworkScript.onload = () => {
            if (window.vis) setIsVisNetworkLoaded(true);
            else showToast(uiTexts.visNotLoadedToast, ToastType.ERROR);
        };
        visNetworkScript.onerror = () => showToast('Error crítico al cargar script de mapas conceptuales.', ToastType.ERROR);
        document.head.appendChild(visNetworkScript);
        
        const visNetworkCSS = document.createElement('link');
        visNetworkCSS.rel = 'stylesheet';
        visNetworkCSS.type = 'text/css';
        visNetworkCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.9/dist/vis-network.min.css';
        document.head.appendChild(visNetworkCSS);

        const mammothScript = document.createElement('script');
        mammothScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
        mammothScript.async = true;
        mammothScript.onload = () => {
            if (window.mammoth) setIsMammothLoaded(true);
            else showToast(uiTexts.mammothNotLoadedToast, ToastType.ERROR);
        };
        mammothScript.onerror = () => { showToast('Error al cargar script de DOCX.', ToastType.ERROR); };
        document.head.appendChild(mammothScript);

        return () => {
            if (document.head.contains(pdfScript)) document.head.removeChild(pdfScript);
            if (document.head.contains(visNetworkScript)) document.head.removeChild(visNetworkScript);
            if (document.head.contains(visNetworkCSS)) document.head.removeChild(visNetworkCSS);
            if (document.head.contains(mammothScript)) document.head.removeChild(mammothScript);
        };
    }, [showToast, uiTexts]);

    // Removed performUiTranslation, handleTranslateInterfaceManually, and related useEffects

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setStudyContentImageBase64((reader.result as string).split(',')[1]);
                showToast(uiTexts.imageLoadedToast.replace('{fileName}', file.name), ToastType.SUCCESS);
            };
            reader.readAsDataURL(file);
        }
         if (event.target) event.target.value = ""; 
    };

    const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setStudyContentImageBase64((reader.result as string).split(',')[1]);
                showToast(uiTexts.imageLoadedToast.replace('{fileName}', file.name), ToastType.SUCCESS);
            };
            reader.readAsDataURL(file);
        } else {
            showToast("Por favor, suelta un archivo de imagen válido.", ToastType.WARNING);
        }
    };
    
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    };

    const processAndSetFileContent = async (file: File) => {
        setIsPracticeLoading(true); 
        try {
            const result = await fileProcessorService.processFile(
                file, isPdfJsLoaded, isMammothLoaded, 
                uiTexts.pdfLibNotLoadedToast, uiTexts.mammothNotLoadedToast
            );
            if (result.error) {
                showToast(result.error, ToastType.ERROR);
                setStudyContentText('');
            } else {
                setStudyContentText(result.text);
                showToast(uiTexts.docLoadedToast.replace('{fileName}', file.name), ToastType.SUCCESS);
            }
        } catch (e: any) {
            showToast(`Error procesando archivo: ${e.message}`, ToastType.ERROR);
        } finally {
            setIsPracticeLoading(false);
        }
    };

    const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) processAndSetFileContent(file);
        if (event.target) event.target.value = ""; 
    };

    const handleDocumentDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file) processAndSetFileContent(file);
        else showToast("Por favor, suelta un archivo de documento válido (.pdf, .txt, .md, .docx).", ToastType.WARNING);
    };

    const callAiService = async <T,>(
        serviceFn: () => Promise<T | null>, 
        loadingSetter: React.Dispatch<React.SetStateAction<boolean>>,
        successMsg?: string, 
        errorMsg?: string
    ): Promise<T | null> => {
        if (!process.env.API_KEY) {
            showToast("La API Key de Gemini no está configurada. Por favor, configura la variable de entorno API_KEY.", ToastType.ERROR);
            return null;
        }
        
        const isContentIndependentCall = 
            serviceFn === geminiService.generateReport || 
            serviceFn === geminiService.generateSuggestions;

        if (!isContentIndependentCall && !studyContentText && !studyContentImageBase64) {
            if (serviceFn === geminiService.generateQuestion) {
                showToast(uiTexts.noContentToGenerateToast, ToastType.WARNING);
            } else {
                showToast(uiTexts.noContentForActionToast, ToastType.WARNING);
            }
            return null;
        }
        
        loadingSetter(true);
        try {
            const result = await serviceFn();
            if (result && successMsg) showToast(successMsg, ToastType.SUCCESS);
            return result;
        } catch (e: any) {
            console.error("AI Service Error:", e);
            showToast(errorMsg || e.message || "Error al comunicarse con la IA.", ToastType.ERROR);
            return null;
        } finally {
            loadingSetter(false);
        }
    };
    
    const handleGenerateQuestion = async () => {
        setFeedbackMessage(''); setUserAnswer(''); setConceptToElaborate('');

        let baseEffectiveType = questionType; // Since uiTexts is BASE_UI_TEXTS
        if (questionType === uiTexts.qTypeRandom) {
            const actualBaseTypes = [uiTexts.qTypeGeneral, uiTexts.qTypeDefinition, uiTexts.qTypeRelationship, uiTexts.qTypeApplication, uiTexts.qTypeTrueFalse, uiTexts.qTypeMultipleChoice];
            baseEffectiveType = actualBaseTypes[Math.floor(Math.random() * actualBaseTypes.length)];
            showToast(uiTexts.questionTypeRandomToast.replace('{type}', baseEffectiveType), ToastType.INFO);
        }

        const aiResponse = await callAiService(
            () => geminiService.generateQuestion(course, studyContentText, studyContentImageBase64, questionType, studyMode, askedQuestions, coveredConcepts, uiTexts, BASE_UI_TEXTS, baseEffectiveType),
            setIsPracticeLoading,
            undefined, 
            "No se pudo generar la pregunta."
        );

        if (aiResponse) {
            let questionText = aiResponse; let conceptText = '';
             const currentBaseStudyMode = studyMode; // Since uiTexts is BASE_UI_TEXTS

            if (currentBaseStudyMode === uiTexts.studyModeGuided) { 
                const match = aiResponse.match(/\(Concepto:\s*(.*?)\)/i);
                if (match && match[1]) { conceptText = match[1].trim(); questionText = aiResponse.replace(match[0], '').trim(); }
                if (conceptText) { setCoveredConcepts(prev => new Set(prev).add(conceptText)); setConceptToElaborate(conceptText); }
            }
            setCurrentQuestion(questionText); setCurrentConcept(conceptText); 
            setAskedQuestions(prev => new Set(prev).add(questionText));
            if (!conceptText) setConceptToElaborate(questionText); 
        }
    };

    const handleEvaluateAnswer = async () => {
        if (!currentQuestion || !userAnswer) {
            showToast(uiTexts.noQuestionToEvaluateToast, ToastType.WARNING);
            return;
        }
        const aiResponse = await callAiService(
            () => geminiService.evaluateAnswer(course, studyContentText, studyContentImageBase64, currentQuestion, userAnswer, uiTexts, BASE_UI_TEXTS),
            setIsPracticeLoading,
            undefined,
            "No se pudo evaluar la respuesta."
        );
        if (aiResponse) {
            const currentKeywords = LANGUAGE_KEYWORDS[FIXED_INTERACTION_LANGUAGE.toLowerCase()] || LANGUAGE_KEYWORDS['español'];
            const isCorrect = aiResponse.startsWith(`${currentKeywords.correct}.`);
            const feedback = aiResponse.substring(aiResponse.indexOf('.') + 1).trim();
            setFeedbackMessage(feedback);
            if (isCorrect) setCorrectCount(prev => prev + 1); else setIncorrectCount(prev => prev + 1);
            setSessionHistory(prev => [...prev, { question: currentQuestion, userAnswer, feedback, isCorrect, concept: currentConcept }]);
            setConceptToElaborate(currentConcept || currentQuestion);
        }
    };
    
    const handleGenerateReport = async () => {
        if (sessionHistory.length === 0) { showToast(uiTexts.noHistoryForReportToast, ToastType.INFO); return; }
        const reportRes = await callAiService(
            () => geminiService.generateReport(course, sessionHistory, correctCount, incorrectCount, uiTexts, BASE_UI_TEXTS),
            setIsReportLoading, undefined, "No se pudo generar el informe."
        );
        setReportContent(reportRes || 'Error al generar informe.');

        const suggestionsRes = await callAiService(
            () => geminiService.generateSuggestions(course, sessionHistory, correctCount, incorrectCount, uiTexts, BASE_UI_TEXTS),
            setIsReportLoading, undefined, "No se pudieron generar sugerencias."
        );
        setSuggestionsContent(suggestionsRes || 'Error al generar sugerencias.');
    };

    const handleGenerateSummary = async () => {
        const summary = await callAiService(
            () => geminiService.generateSummary(course, studyContentText, studyContentImageBase64, uiTexts, BASE_UI_TEXTS),
            setIsSummaryLoading, undefined, "No se pudo generar el resumen."
        );
        if (summary) { setSmartSummary(summary); setShowSummaryModal(true); }
    };

    const handleGenerateFaq = async () => {
        const faq = await callAiService(
            () => geminiService.generateFaq(course, studyContentText, studyContentImageBase64, uiTexts, BASE_UI_TEXTS),
            setIsFaqLoading, undefined, "No se pudieron generar las FAQs."
        );
        if (faq) { setFaqContent(faq); setShowFaqModal(true); }
    };

    const handleElaborateConcept = async () => {
        if (!conceptToElaborate) { showToast(uiTexts.noConceptToElaborateToast, ToastType.INFO); return; }
        if (!studyContentText && !studyContentImageBase64) { showToast(uiTexts.noContentForElaborationToast, ToastType.WARNING); return; }
        const explanation = await callAiService(
            () => geminiService.elaborateConcept(course, studyContentText, studyContentImageBase64, conceptToElaborate, uiTexts, BASE_UI_TEXTS),
            setIsElaborationLoading, undefined, "No se pudo generar la explicación."
        );
        if (explanation) { setElaboratedExplanation(explanation); setShowElaborationModal(true); }
    };
    
    const handleGenerateAnalogies = async () => {
        if (!conceptToElaborate) { showToast(uiTexts.noConceptForAnalogiesToast, ToastType.INFO); return; }
        if (!studyContentText && !studyContentImageBase64) { showToast(uiTexts.noContentForAnalogiesToast, ToastType.WARNING); return; }
        const analogies = await callAiService(
            () => geminiService.generateAnalogies(course, studyContentText, studyContentImageBase64, conceptToElaborate, uiTexts, BASE_UI_TEXTS),
            setIsAnalogyLoading, undefined, "No se pudieron generar las analogías."
        );
        if (analogies) { setAnalogiesContent(analogies); setShowAnalogyModal(true); }
    };

    const handleGenerateFlashcards = async () => {
        const flashcardResult = await callAiService(
            () => geminiService.generateFlashcards(course, studyContentText, studyContentImageBase64, uiTexts, BASE_UI_TEXTS),
            setIsFlashcardsLoading, undefined, "No se pudieron generar las flashcards."
        );
        if (flashcardResult && flashcardResult.flashcards && flashcardResult.flashcards.length > 0) {
            setFlashcardsData(flashcardResult.flashcards);
            setCurrentFlashcardIndex(0);
            setIsFlashcardFlipped(false);
            setShowFlashcardModal(true);
        } else if(flashcardResult) { 
            showToast(uiTexts.invalidFlashcardsToast, ToastType.ERROR);
        }
    };

    const handleGenerateSemanticMap = async () => {
        if (!isVisNetworkLoaded) { showToast(uiTexts.visNotLoadedToast, ToastType.WARNING); return; }
        setIsSemanticMapLoading(true); 
        setSemanticMapData(null);
        let effectiveText = studyContentText;

        if (studyContentImageBase64) {
            showToast(uiTexts.describingImageForMapToast, ToastType.INFO);
            try {
                const description = await geminiService.describeImageForMap(course, studyContentText, studyContentImageBase64, uiTexts, BASE_UI_TEXTS);
                if (description) {
                    effectiveText = `${description}\n\n${studyContentText || ''}`.trim();
                    showToast(uiTexts.imageDescriptionSuccessToast, ToastType.SUCCESS);
                } else {
                    throw new Error(uiTexts.imageDescriptionErrorToast);
                }
            } catch (e: any) {
                showToast(e.message || uiTexts.imageDescriptionErrorToast, ToastType.ERROR);
                setIsSemanticMapLoading(false);
                return;
            }
        }
        
        if (!effectiveText) { 
            showToast(uiTexts.noContentForActionToast, ToastType.WARNING);
            setIsSemanticMapLoading(false);
            return;
        }

        const mapDataResult = await callAiService(
            () => geminiService.generateSemanticMap(course, effectiveText, uiTexts, BASE_UI_TEXTS),
            setIsSemanticMapLoading, 
            undefined, 
            "No se pudo generar el mapa conceptual."
        );

        if (mapDataResult && mapDataResult.nodes && mapDataResult.edges) {
            setSemanticMapData(mapDataResult);
            setShowSemanticMapModal(true);
        } else if (mapDataResult) { 
            showToast(uiTexts.noSemanticMapDataToast, ToastType.ERROR);
        }
        if (!mapDataResult) setIsSemanticMapLoading(false); 
    };
    
    const makeShowToast = (msg: string, type?: ToastType) => showToast(msg, type);
    const handleCopySummary = () => clipboardService.copyToClipboard(smartSummary, 'summaryModalTitle', makeShowToast, uiTexts);
    const handleCopyFaq = () => clipboardService.copyToClipboard(faqContent, 'faqModalTitle', makeShowToast, uiTexts);
    const handleCopyElaboration = () => clipboardService.copyToClipboard(elaboratedExplanation, 'elaborationModalTitle', makeShowToast, uiTexts);
    const handleCopyAnalogies = () => clipboardService.copyToClipboard(analogiesContent, 'analogyModalTitle', makeShowToast, uiTexts);
    const handleCopyReport = () => {
        const fullReport = `${uiTexts.reportResultsTitle}\n=====================\n${reportContent}\n\n${uiTexts.studySuggestionsTitle}\n=====================\n${suggestionsContent}`;
        clipboardService.copyToClipboard(fullReport.trim(), 'reportTitle', makeShowToast, uiTexts);
    };
    
    const confirmRestartSession = () => {
        setStudyContentText(''); setStudyContentImageBase64(null);
        setCurrentQuestion(''); setCurrentConcept(''); setUserAnswer(''); setFeedbackMessage('');
        setCorrectCount(0); setIncorrectCount(0); setSessionHistory([]);
        setAskedQuestions(new Set()); setCoveredConcepts(new Set());
        setReportContent(''); setSuggestionsContent('');
        setSmartSummary(''); setShowSummaryModal(false);
        setFaqContent(''); setShowFaqModal(false); 
        setElaboratedExplanation(''); setShowElaborationModal(false); setConceptToElaborate('');
        setAnalogiesContent(''); setShowAnalogyModal(false); 
        setFlashcardsData([]); setShowFlashcardModal(false); setCurrentFlashcardIndex(0); setIsFlashcardFlipped(false);
        setSemanticMapData(null); setShowSemanticMapModal(false);
        
        setQuestionType(uiTexts.qTypeRandom); 
        setStudyMode(uiTexts.studyModeRandom);
        
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
        }
        setIsFocusMode(false); 
        
        setShowConfirmationModal(false);
        showToast(uiTexts.sessionRestartedToast, ToastType.INFO);
    };
    const handleRestartSessionRequest = () => {
        setConfirmationModalMessage(uiTexts.confirmRestartMsg);
        setOnConfirmAction(() => confirmRestartSession); 
        setShowConfirmationModal(true);
    };

    const handleToggleFocusMode = async () => {
        if (!appRef.current) return;
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        
        try {
            if (!isCurrentlyFullscreen) {
                if (appRef.current.requestFullscreen) await appRef.current.requestFullscreen();
                else if ((appRef.current as any).mozRequestFullScreen) await (appRef.current as any).mozRequestFullScreen();
                else if ((appRef.current as any).webkitRequestFullscreen) await (appRef.current as any).webkitRequestFullscreen();
                else if ((appRef.current as any).msRequestFullscreen) await (appRef.current as any).msRequestFullscreen();
            } else {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if ((document as any).mozCancelFullScreen) await (document as any).mozCancelFullScreen();
                else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
                else if ((document as any).msExitFullscreen) await (document as any).msExitFullscreen();
            }
        } catch (err) {
            showToast(uiTexts.focusModeRequestErrorToast, ToastType.ERROR);
            setIsFocusMode(false); 
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            const isFs = !!document.fullscreenElement;
            setIsFocusMode(isFs);
            showToast(isFs ? uiTexts.focusModeActiveToast : uiTexts.focusModeInactiveToast, ToastType.INFO);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        document.addEventListener('mozfullscreenchange', handleFsChange);
        document.addEventListener('MSFullscreenChange', handleFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
            document.removeEventListener('mozfullscreenchange', handleFsChange);
            document.removeEventListener('MSFullscreenChange', handleFsChange);
        };
    }, [showToast, uiTexts.focusModeActiveToast, uiTexts.focusModeInactiveToast]);
    
    const handleDownloadMapHTML = () => {
        if (!semanticMapData) {
            showToast('No hay datos del mapa para generar el HTML.', ToastType.WARNING);
            return;
        }
        const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa Conceptual Interactivo</title>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.9/standalone/umd/vis-network.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.9/dist/vis-network.min.css" rel="stylesheet" type="text/css" />
    <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; font-family: Arial, sans-serif; background-color: #f0f2f5; }
        #mynetwork { width: calc(100% - 20px); height: calc(100% - 20px); border: 1px solid #ccc; box-sizing: border-box; margin: 10px; background-color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px;}
        .controls { position: absolute; top: 20px; left: 20px; z-index: 10; background: rgba(255,255,255,0.9); padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.2); }
        .controls button { margin: 5px; padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc; background-color: #f0f0f0; cursor: pointer; font-size: 14px; }
        .controls button:hover { background-color: #e0e0e0; }
        .vis-tooltip { background-color: #fff !important; border: 1px solid #ccc !important; box-shadow: 0 2px 5px rgba(0,0,0,0.15) !important; padding: 8px !important; border-radius: 4px !important; font-family: Arial, sans-serif !important; color: #333 !important; }
    </style>
</head>
<body>
    <div class="controls">
        <button onclick="if(network) network.fit()">Ajustar Zoom</button>
        <button onclick="togglePhysics()">Físicas On/Off</button>
        <p style="font-size:0.8em; margin-top:5px; color: #555;">Rueda para zoom, arrastra para mover.</p>
    </div>
    <div id="mynetwork"></div>
    <script type="text/javascript">
        const nodes = new vis.DataSet(${JSON.stringify(semanticMapData.nodes || [])});
        const edges = new vis.DataSet(${JSON.stringify(semanticMapData.edges || [])});
        const container = document.getElementById('mynetwork');
        const data = { nodes: nodes, edges: edges };
        const options = {
            layout: { hierarchical: false, improvedLayout: true },
            interaction: { dragNodes: true, dragView: true, hover: true, zoomView: true, navigationButtons: false, keyboard: true, tooltipDelay: 200 },
            physics: { 
                enabled: true, 
                solver: 'barnesHut', 
                barnesHut: { gravitationalConstant: -2500, centralGravity: 0.1, springLength: 120, springConstant: 0.03, damping: 0.09, avoidOverlap: 0.15 },
                stabilization: { iterations: 1500, fit: true }
            },
            nodes: { 
                shape: 'box', size: 18, borderWidth: 1, shadow: {enabled: true, size:5, x:2, y:2},
                font: { size: 14, color: '#343434', strokeWidth: 0, face: 'Arial' }, 
                color: { border: '#4A90E2', background: '#E9F2FC', highlight: { border: '#357ABD', background: '#D4E8FA' }, hover: { border: '#357ABD', background: '#D4E8FA' } }
            },
            edges: { 
                width: 1.5, smooth: { type: 'dynamic', roundness: 0.2 }, arrows: { to: { enabled: true, scaleFactor: 0.8, type: 'arrow' } },
                color: { color:'#888', highlight:'#555', hover: '#555', opacity:0.8 },
                font: { align: 'middle', size: 11, color: '#666', strokeWidth: 0, background: 'rgba(255,255,255,0.7)'}
            }
        };
        let network = new vis.Network(container, data, options);
        network.on("stabilizationIterationsDone", function () { network.setOptions( { physics: false } ); });
        function togglePhysics() { 
            if (!network) return;
            const currentPhysicsState = network.physics.options.enabled;
            network.setOptions({ physics: !currentPhysicsState });
            if (!currentPhysicsState) network.stabilize(); 
        }
        window.onload = () => { if(network) network.fit(); }
    </script>
</body>
</html>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mapa_conceptual_interactivo.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Mapa conceptual descargado como HTML.', ToastType.SUCCESS);
    };

    // Removed InitialLoadingScreen display logic

    if (!process.env.API_KEY) {
      return (
        <div className="fixed inset-0 bg-red-100 flex flex-col justify-center items-center z-[300] p-8 text-center">
            <h1 className="text-3xl font-bold text-red-700 mb-4">Error de Configuración</h1>
            <p className="text-red-600 text-lg mb-2">La API Key de Gemini no está configurada.</p>
            <p className="text-gray-700">Por favor, asegúrate de que la variable de entorno <code>API_KEY</code> esté correctamente establecida para que la aplicación funcione.</p>
            <p className="text-gray-500 mt-4 text-sm">Esta aplicación no puede funcionar sin una API Key válida.</p>
        </div>
      );
    }


    return (
        <div ref={appRef} className={`min-h-screen bg-green-800 font-inter text-gray-100 flex flex-col items-center ${isFocusMode ? 'p-0 sm:p-1' : 'p-2 sm:p-4'} transition-all duration-300 ease-in-out`}>
            {toast.show && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ ...toast, show: false })} />}
            
            {!isFocusMode && (
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mb-4 sm:mb-6 text-center drop-shadow-md">
                    <span className="text-lime-400">{uiTexts.appTitle.charAt(0)}</span>{uiTexts.appTitle.substring(1)}
                </h1>
            )}

            <FullscreenButton isFocusMode={isFocusMode} onToggleFocusMode={handleToggleFocusMode} uiTexts={uiTexts} />
            
            <div className={`w-full max-w-3xl flex flex-col ${isFocusMode ? 'flex-grow' : ''}`}>
                <div className="flex flex-wrap gap-1 border-b-2 border-blue-500 pb-1 mb-0">
                    <TabButton tabId="contenido" label={uiTexts.tabContentTools} activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton tabId="practica" label={uiTexts.tabPractice} activeTab={activeTab} onClick={setActiveTab} />
                    <TabButton tabId="reporte" label={uiTexts.tabReport} activeTab={activeTab} onClick={setActiveTab} />
                </div>

                <div className={`bg-white p-4 sm:p-6 rounded-b-xl shadow-lg border border-t-0 border-blue-200 text-gray-800 ${isFocusMode ? 'flex-grow overflow-y-auto' : ''}`}> {/* Content area text color reset to default for bg-white */}
                    {activeTab === 'contenido' && (
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-4 sm:mb-5">{uiTexts.contentToolsTitle}</h2>
                            <div className="bg-slate-50 p-4 rounded-lg shadow-sm mb-6 border border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 items-end">
                                    <div className="md:col-span-2"> {/* Course takes full width if "Cómo usar" is removed */}
                                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">{uiTexts.courseLabel}</label>
                                        <select 
                                            id="course" 
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white" 
                                            value={course} 
                                            onChange={(e) => setCourse(e.target.value)}
                                        >
                                            {COURSE_OPTIONS.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* "Cómo usar?" button removed */}
                                </div>
                            </div>
                            
                            <div className="space-y-6 mt-6"> 
                                <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-700 mb-2">{uiTexts.inputMethodDocTitle}</h3>
                                    <label htmlFor="documentUploadArea" className="block text-sm font-medium text-gray-700 mb-1">{uiTexts.loadDocumentLabel}</label>
                                    <div id="documentUploadArea" className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 bg-white" onClick={() => documentInputRef.current?.click()} onDragOver={handleDragOver} onDrop={handleDocumentDrop}>
                                        <input type="file" accept=".pdf,.txt,.md,.docx" ref={documentInputRef} onChange={handleDocumentUpload} className="hidden"/>
                                        <p className="text-gray-500 text-sm">{uiTexts.dropDocumentPlaceholder}</p>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
                                    <h3 className="text-lg font-semibold text-green-700 mb-2">{uiTexts.inputMethodTextTitle}</h3>
                                    <label htmlFor="studyText" className="block text-sm font-medium text-gray-700 mb-1">{uiTexts.pasteTextLabel}</label>
                                    <textarea id="studyText" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-y min-h-[120px] text-sm bg-white" placeholder={uiTexts.pasteTextPlaceholder} value={studyContentText} onChange={(e) => setStudyContentText(e.target.value)}></textarea>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200">
                                    <h3 className="text-lg font-semibold text-purple-700 mb-2">{uiTexts.inputMethodImageTitle}</h3>
                                    <label htmlFor="imageUploadArea" className="block text-sm font-medium text-gray-700 mb-1">{uiTexts.loadImageLabel}</label>
                                    <div id="imageUploadArea" className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 bg-white" onClick={() => imageInputRef.current?.click()} onDragOver={handleDragOver} onDrop={handleImageDrop}>
                                        <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden"/>
                                        {studyContentImageBase64 ? (
                                            <img src={`data:image/png;base64,${studyContentImageBase64}`} alt="Contenido de estudio cargado" className="max-h-40 mx-auto rounded-md mb-2" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src=`https://placehold.co/200x100/CCCCCC/333333?text=${uiTexts.imageErrorPlaceholder}`; }}/>
                                        ) : (
                                            <p className="text-gray-500 text-sm">{uiTexts.dropImagePlaceholder}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4 mb-6 text-center">{uiTexts.canLoadTextAndImage}</p>
                        </div>
                    )}
                     {activeTab === 'practica' && (
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-4 sm:mb-5">{uiTexts.guidedPracticeTitle}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="questionType" className="block text-base font-medium text-gray-700 mb-1">{uiTexts.questionTypeLabel}</label>
                                    <select id="questionType" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                                        <option value={uiTexts.qTypeRandom}>{uiTexts.qTypeRandom}</option>
                                        <option value={uiTexts.qTypeGeneral}>{uiTexts.qTypeGeneral}</option>
                                        <option value={uiTexts.qTypeDefinition}>{uiTexts.qTypeDefinition}</option>
                                        <option value={uiTexts.qTypeRelationship}>{uiTexts.qTypeRelationship}</option>
                                        <option value={uiTexts.qTypeApplication}>{uiTexts.qTypeApplication}</option>
                                        <option value={uiTexts.qTypeTrueFalse}>{uiTexts.qTypeTrueFalse}</option>
                                        <option value={uiTexts.qTypeMultipleChoice}>{uiTexts.qTypeMultipleChoice}</option> 
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="studyMode" className="block text-base font-medium text-gray-700 mb-1">{uiTexts.studyModeLabel}</label>
                                    <select id="studyMode" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" value={studyMode} onChange={(e) => setStudyMode(e.target.value)}>
                                        <option value={uiTexts.studyModeRandom}>{uiTexts.studyModeRandom}</option> 
                                        <option value={uiTexts.studyModeGuided}>{uiTexts.studyModeGuided}</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleGenerateQuestion} disabled={isPracticeLoading || (!studyContentText && !studyContentImageBase64)} className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition transform hover:scale-105 mb-4 disabled:opacity-50">
                                {(isPracticeLoading && currentQuestion === '' && !feedbackMessage) ? uiTexts.generatingQuestionButton : uiTexts.generateQuestionButton}
                            </button>
                            {currentQuestion && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-800 font-medium text-lg mb-4">
                                    <ReactMarkdown>{currentQuestion}</ReactMarkdown> 
                                    {currentConcept && (studyMode === uiTexts.studyModeGuided) && <p className="text-sm text-blue-600 mt-1">(Concepto cubierto: {currentConcept})</p>}
                                </div>
                            )}
                            <label htmlFor="userAnswer" className="block text-lg font-medium text-gray-700 mb-2">{uiTexts.yourAnswerLabel}</label>
                            <textarea id="userAnswer" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[80px] mb-4 bg-white" placeholder={uiTexts.yourAnswerPlaceholder} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} disabled={!currentQuestion || isPracticeLoading}></textarea>
                            <button onClick={handleEvaluateAnswer} disabled={!currentQuestion || !userAnswer || isPracticeLoading} className="w-full bg-green-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition transform hover:scale-105 mb-4 disabled:opacity-50">
                                {isPracticeLoading && feedbackMessage === '' && currentQuestion !== '' ? uiTexts.evaluatingButton : uiTexts.checkAnswerButton}
                            </button>
                            {feedbackMessage && <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 font-medium mb-4"><ReactMarkdown>{feedbackMessage}</ReactMarkdown></div>}
                            
                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                {(currentQuestion || feedbackMessage) && conceptToElaborate && (
                                    <button onClick={handleElaborateConcept} disabled={isElaborationLoading || (!studyContentText && !studyContentImageBase64)} className="flex-1 bg-indigo-500 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition transform hover:scale-105 disabled:opacity-50 text-sm sm:text-base">
                                        {isElaborationLoading ? uiTexts.explainingButton : uiTexts.explainMoreButton}
                                    </button>
                                )}
                                {(currentQuestion || feedbackMessage) && conceptToElaborate && (
                                    <button onClick={handleGenerateAnalogies} disabled={isAnalogyLoading || (!studyContentText && !studyContentImageBase64)} className="flex-1 bg-orange-500 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition transform hover:scale-105 disabled:opacity-50 text-sm sm:text-base">
                                        {isAnalogyLoading ? uiTexts.creatingAnalogiesButton : uiTexts.createAnalogiesButton}
                                    </button>
                                )}
                            </div>
                            <div className="flex justify-around items-center mt-6 mb-2 text-lg sm:text-xl font-bold">
                                <p className="text-green-600">{uiTexts.correctLabel} {correctCount}</p> <p className="text-red-600">{uiTexts.incorrectLabel} {incorrectCount}</p>
                            </div>
                        </div>
                    )}
                     {activeTab === 'reporte' && (
                        <div>
                             <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-4 sm:mb-5">{uiTexts.reportTitle}</h2>
                             <button onClick={handleGenerateReport} disabled={sessionHistory.length === 0 || isReportLoading} className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition transform hover:scale-105 mb-6 disabled:opacity-50">
                                {isReportLoading && !reportContent ? uiTexts.generatingReportButton : uiTexts.generateReportButton}
                            </button>
                            {(reportContent || suggestionsContent) && sessionHistory.length > 0 ? (
                                <div className="mt-2 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                                    {reportContent && <>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">{uiTexts.reportResultsTitle}</h3>
                                        <div className="prose prose-sm sm:prose-base max-w-none mb-4"><ReactMarkdown>{reportContent}</ReactMarkdown></div>
                                    </>}
                                    {suggestionsContent && <>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mt-4 mb-3">{uiTexts.studySuggestionsTitle}</h3>
                                        <div className="prose prose-sm sm:prose-base max-w-none"><ReactMarkdown>{suggestionsContent}</ReactMarkdown></div>
                                    </>}
                                </div>
                            ) : (
                                sessionHistory.length > 0 && !isReportLoading && <p className="text-gray-600">{uiTexts.clickToGenerateReportMsg}</p> ||
                                sessionHistory.length === 0 && <p className="text-gray-600">{uiTexts.completeQuestionsForReportMsg}</p>
                            )}

                             <div className="mt-8 space-y-4">
                                {(reportContent || suggestionsContent) && sessionHistory.length > 0 && (
                                    <button onClick={handleCopyReport} className="w-full bg-sky-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition transform hover:scale-105">
                                        {uiTexts.copyReportButton}
                                    </button>
                                )}
                                <button onClick={handleRestartSessionRequest} className="w-full bg-red-500 text-white py-3 px-6 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition transform hover:scale-105">
                                    {uiTexts.restartSessionButton}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={showConfirmationModal}
                message={confirmationModalMessage}
                onConfirm={() => { if(onConfirmAction) onConfirmAction(); setShowConfirmationModal(false); }}
                onCancel={() => setShowConfirmationModal(false)}
                uiTexts={uiTexts}
            />

            {showDescriptionModal && (
                 <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-[60] p-4">
                    <div className="bg-white p-0 rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 text-gray-800">
                            <h3 className="text-xl sm:text-2xl font-semibold text-blue-700">{uiTexts.descriptionModalTitle}</h3>
                            <button onClick={() => setShowDescriptionModal(false)} className="text-gray-500 hover:text-gray-700 text-3xl leading-none font-bold" aria-label="Cerrar descripción">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto text-gray-800">
                           <DescriptionModalContent uiTexts={uiTexts} />
                        </div>
                         <div className="flex justify-end p-3 border-t sticky bottom-0 bg-white z-10">
                            <button onClick={() => setShowDescriptionModal(false)} className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition">{uiTexts.closeButton}</button>
                        </div>
                    </div>
                </div>
            )}
            
            <OutputModal 
                isOpen={showSummaryModal} title={uiTexts.summaryModalTitle} content={smartSummary}
                onClose={() => setShowSummaryModal(false)} onCopy={handleCopySummary}
                copyButtonText={uiTexts.copySummaryButton} uiTexts={uiTexts}
            />
            <OutputModal 
                isOpen={showFaqModal} title={uiTexts.faqModalTitle} content={faqContent}
                onClose={() => setShowFaqModal(false)} onCopy={handleCopyFaq}
                copyButtonText={uiTexts.copyFaqButton} uiTexts={uiTexts}
            />
            <OutputModal
                isOpen={showElaborationModal} title={uiTexts.elaborationModalTitle} content={elaboratedExplanation}
                onClose={() => setShowElaborationModal(false)} onCopy={handleCopyElaboration}
                copyButtonText={uiTexts.copyElaborationButton} uiTexts={uiTexts} conceptContext={conceptToElaborate}
            />
            <OutputModal
                isOpen={showAnalogyModal} title={uiTexts.analogyModalTitle} content={analogiesContent}
                onClose={() => setShowAnalogyModal(false)} onCopy={handleCopyAnalogies}
                copyButtonText={uiTexts.copyAnalogiesButton} uiTexts={uiTexts} conceptContext={conceptToElaborate}
            />
            <FlashcardModal
                isOpen={showFlashcardModal} flashcards={flashcardsData} currentIndex={currentFlashcardIndex}
                isFlipped={isFlashcardFlipped} onClose={() => setShowFlashcardModal(false)}
                onFlip={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                onNext={() => { setIsFlashcardFlipped(false); setCurrentFlashcardIndex(prev => (prev + 1) % flashcardsData.length); }}
                onPrev={() => { setIsFlashcardFlipped(false); setCurrentFlashcardIndex(prev => (prev - 1 + flashcardsData.length) % flashcardsData.length); }}
                onShuffle={() => { setIsFlashcardFlipped(false); setFlashcardsData(prev => [...prev].sort(() => Math.random() - 0.5)); setCurrentFlashcardIndex(0); }}
                uiTexts={uiTexts}
            />
            <SemanticMapModal
                isOpen={showSemanticMapModal} mapData={semanticMapData} onClose={() => setShowSemanticMapModal(false)}
                onDownloadHtml={handleDownloadMapHTML} uiTexts={uiTexts}
                isVisNetworkLoaded={isVisNetworkLoaded} isLoading={isSemanticMapLoading}
            />

            {!isFocusMode && (
                <footer className="w-full max-w-3xl text-center py-6 sm:py-8 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-300">
                    <p className="mb-2">
                        <a href="https://labia.tiddlyhost.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 underline">
                            Laboratorio de aplicaciones educativas
                        </a>
                    </p>
                    <p className="mb-2">
                        Aplicación creada a partir de la original hecha por <a href="https://bilateria.org" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 underline">Juan José de Haro</a>
                    </p>
                    <p>
                        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 underline">
                            Esta obra está bajo una licencia Creative Commons BY-SA
                        </a>
                    </p>
                </footer>
            )}

            <style>{`
                ::selection { background-color: #3b82f6; color: white; }
                ::-moz-selection { background-color: #3b82f6; color: white; }
                .perspective { perspective: 1000px; }
                .flashcard-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; }
                .flashcard-inner.is-flipped { transform: rotateY(180deg); }
                .flashcard-front, .flashcard-back { 
                    position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; 
                    display: flex; flex-direction: column; justify-content: center; align-items: center; 
                    padding: 20px; box-sizing: border-box; background-color: #fef3c7 !important; border-radius: 0.5rem; color: #374151; 
                }
                .flashcard-front > div, .flashcard-back > div, .flashcard-front p, .flashcard-back p, .flashcard-front span, .flashcard-back span { background-color: transparent !important; }
                .flashcard-front > div > p, .flashcard-back > div > p { margin: 0; }
                .flashcard-back { transform: rotateY(180deg); }
                .prose :where(p):where([class~="lead"]) { margin-top: 0; margin-bottom: 0; }
                .prose :where(p):not(:where([class~="not-prose"] *)) { margin-top: 0; margin-bottom: 0; }
                .vis-tooltip {
                    background-color: #ffffff !important; border: 1px solid #cccccc !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
                    padding: 10px !important; border-radius: 6px !important; font-family: 'Inter', Arial, sans-serif !important;
                    color: #333333 !important; font-size: 13px !important; max-width: 300px !important; pointer-events: none !important;
                }
            `}</style>
        </div>
    );
};

export default App;