
import { UiTexts } from '../types';

type ShowToastFn = (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

const fallbackCopyTextToClipboard = (
    text: string, 
    itemLabel: string, 
    showToast: ShowToastFn,
    uiTexts: UiTexts
) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  Object.assign(textArea.style, {
    position: "fixed", top: "0", left: "0", width: "2em", height: "2em",
    padding: "0", border: "none", outline: "none", boxShadow: "none", background: "transparent"
  });
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    if (document.execCommand('copy')) {
      showToast(uiTexts.copiedToClipboardFallback.replace('{item}', itemLabel), 'success');
    } else {
      showToast(uiTexts.copiedToClipboardError.replace('{item}', itemLabel), 'error');
    }
  } catch (err) {
    showToast(uiTexts.copiedToClipboardErrorFallback.replace('{item}', itemLabel), 'error');
  }
  document.body.removeChild(textArea);
};

export const clipboardService = {
  copyToClipboard: (
    text: string | null | undefined,
    itemTypeKey: keyof UiTexts, // Key to get the item label from uiTexts
    showToast: ShowToastFn,
    uiTexts: UiTexts
  ) => {
    const itemLabel = uiTexts[itemTypeKey] || itemTypeKey.toString();
    if (!text) {
      showToast(uiTexts.noItemToCopy.replace('{item}', itemLabel), 'info');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast(uiTexts.copiedToClipboardSuccess.replace('{item}', itemLabel), 'success'))
        .catch(err => {
          console.error(`Error al copiar ${itemLabel}:`, err);
          fallbackCopyTextToClipboard(text, itemLabel, showToast, uiTexts);
        });
    } else {
      fallbackCopyTextToClipboard(text, itemLabel, showToast, uiTexts);
    }
  },
};
