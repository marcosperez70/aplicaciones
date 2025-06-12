export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export interface UiTexts {
  [key: string]: string; // Allow dynamic access for translation keys
  appTitle: string;
  tabContentTools: string;
  tabPractice: string;
  tabReport: string;
  contentToolsTitle: string;
  courseLabel: string; 
  // interactionLanguageLabel: string; // Removed
  // interactionLanguagePlaceholder: string; // Removed
  // translateInterfaceButton: string; // Removed
  // translatingInterfaceButton: string; // Removed
  inputMethodDocTitle: string;
  loadDocumentLabel: string;
  dropDocumentPlaceholder: string;
  inputMethodTextTitle: string;
  pasteTextLabel: string;
  pasteTextPlaceholder: string;
  inputMethodImageTitle: string;
  loadImageLabel: string;
  dropImagePlaceholder: string;
  documentLoadedMsg: string;
  imageErrorPlaceholder: string;
  canLoadTextAndImage: string;
  guidedPracticeTitle: string;
  questionTypeLabel: string;
  studyModeLabel: string;
  generateQuestionButton: string;
  generatingQuestionButton: string;
  yourAnswerLabel: string;
  yourAnswerPlaceholder: string;
  checkAnswerButton: string;
  evaluatingButton: string;
  explainMoreButton: string;
  explainingButton: string;
  createAnalogiesButton: string;
  creatingAnalogiesButton: string;
  correctLabel: string;
  incorrectLabel: string;
  reportTitle: string;
  generateReportButton: string;
  generatingReportButton: string;
  copyReportButton: string;
  reportResultsTitle: string;
  studySuggestionsTitle: string;
  clickToGenerateReportMsg: string;
  completeQuestionsForReportMsg: string;
  restartSessionButton: string;
  descriptionModalTitle: string;
  closeButton: string;
  confirmRestartMsg: string;
  yesRestartButton: string;
  cancelButton: string;
  acceptButton: string;
  summaryModalTitle: string;
  copySummaryButton: string;
  faqModalTitle: string;
  copyFaqButton: string;
  elaborationModalTitle: string;
  elaborationModalConceptLabel: string;
  copyElaborationButton: string;
  analogyModalTitle: string;
  copyAnalogiesButton: string;
  flashcardsModalTitle: string;
  flashcardOf: string;
  prevFlashcardButton: string;
  shuffleFlashcardButton: string;
  nextFlashcardButton: string;
  closeFlashcardsButton: string;
  semanticMapModalTitle: string;
  downloadHtmlButton: string;
  descP1: string;
  descP2: string;
  descP3: string;
  descTitle2: string;
  descP4: string;
  descL1I1: string;
  descL1I2: string;
  descL1I3: string;
  descL1I4: string;
  descL1I5: string;
  descL1I6: string;
  descTitle3?: string;
  descP5?: string;
  descTab1Name?: string;
  descTab1P1?: string;
  descTab1L1I1?: string;
  descTab1L1I2?: string;
  descTab1L1I3?: string;
  descTab1L2I1?: string;
  descTab1L2I2?: string;
  descTab1L2I3?: string;
  descTab1L2I4?: string;
  descTab2Name?: string;
  descTab2P1?: string;
  descTab2L1I1?: string;
  descTab2L1I2?: string;
  descTab2L1I3?: string;
  descTab2L1I4?: string;
  descTab2L1I5?: string;
  descTab3Name?: string;
  descTab3P1?: string;
  descTab3L1I1?: string;
  descTab3L1I2?: string;
  descTab4Name?: string;
  descTab4P1?: string;
  descTab4L1I1?: string;
  descTab4L1I2?: string;
  descP6?: string;
  imageLoadedToast: string;
  docLoadedToast: string;
  pdfLibNotLoadedToast: string;
  visNotLoadedToast: string;
  mammothNotLoadedToast: string;
  noContentToGenerateToast: string;
  noContentForActionToast: string;
  questionTypeRandomToast: string;
  noQuestionToEvaluateToast: string;
  noHistoryForReportToast: string;
  noConceptToElaborateToast: string;
  noContentForElaborationToast: string;
  noConceptForAnalogiesToast: string;
  noContentForAnalogiesToast: string;
  invalidFlashcardsToast: string;
  errorProcessingFlashcardsToast: string;
  noSemanticMapDataToast: string;
  errorProcessingSemanticMapToast: string;
  sessionRestartedToast: string;
  copiedToClipboardSuccess: string;
  copiedToClipboardFallback: string;
  copiedToClipboardError: string;
  copiedToClipboardErrorFallback: string;
  noItemToCopy: string;
  // interfaceTranslationSuccess: string; // Removed
  // interfaceTranslationError: string; // Removed
  describingImageForMapToast: string;
  imageDescriptionSuccessToast: string;
  imageDescriptionErrorToast: string;
  qTypeRandom: string;
  qTypeGeneral: string;
  qTypeDefinition: string;
  qTypeRelationship: string;
  qTypeApplication: string;
  qTypeTrueFalse: string;
  qTypeMultipleChoice: string;
  studyModeRandom: string;
  studyModeGuided: string;
  focusModeButtonLabel: string; 
  exitFocusModeButtonLabel: string; 
  focusModeActiveToast: string; 
  focusModeInactiveToast: string; 
  focusModeRequestErrorToast: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface SemanticMapNode {
  id: string | number;
  label: string;
  title?: string;
}

export interface SemanticMapEdge {
  from: string | number;
  to: string | number;
  label?: string;
  arrows?: string;
}

export interface SemanticMapData {
  nodes: SemanticMapNode[];
  edges: SemanticMapEdge[];
}

export interface SessionHistoryEntry {
  question: string;
  userAnswer: string;
  feedback: string;
  isCorrect: boolean;
  concept: string;
}

export interface LanguageKeywords {
  [lang: string]: { correct: string; incorrect: string };
}

export type ActiveTab = 'contenido' | 'practica' | 'reporte';

// Define PdfJsLib and Mammoth types for window object
declare global {
  interface Window {
    pdfjsLib?: any;
    mammoth?: any;
    vis?: any;
  }
}