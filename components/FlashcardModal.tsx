
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Flashcard, UiTexts } from '../types';

interface FlashcardModalProps {
  isOpen: boolean;
  flashcards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  onClose: () => void;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
  uiTexts: UiTexts;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({
  isOpen,
  flashcards,
  currentIndex,
  isFlipped,
  onClose,
  onFlip,
  onNext,
  onPrev,
  onShuffle,
  uiTexts,
}) => {
  if (!isOpen || flashcards.length === 0) return null;

  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <h3 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-4 text-center">{uiTexts.flashcardsModalTitle}</h3>
        <div
          className="flashcard-container bg-amber-100 border-2 border-amber-400 rounded-lg min-h-[200px] flex justify-center items-center p-6 mb-4 cursor-pointer select-none perspective"
          onClick={onFlip}
        >
          <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
            <div className="flashcard-front rounded-lg">
              <div className="prose max-w-none">
                <ReactMarkdown>{currentFlashcard.front}</ReactMarkdown>
              </div>
            </div>
            <div className="flashcard-back rounded-lg">
              <div className="prose max-w-none">
                <ReactMarkdown>{currentFlashcard.back}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-600 mb-4">
          {uiTexts.flashcardOf.replace('{current}', (currentIndex + 1).toString()).replace('{total}', flashcards.length.toString())}
        </p>
        <div className="flex justify-between mb-4">
          <button onClick={onPrev} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition">{uiTexts.prevFlashcardButton}</button>
          <button onClick={onShuffle} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition">{uiTexts.shuffleFlashcardButton}</button>
          <button onClick={onNext} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition">{uiTexts.nextFlashcardButton}</button>
        </div>
        <button onClick={onClose} className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition">{uiTexts.closeFlashcardsButton}</button>
      </div>
    </div>
  );
};

export default FlashcardModal;
