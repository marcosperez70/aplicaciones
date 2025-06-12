
import React from 'react';
import { UiTexts } from '../types';
import { BASE_UI_TEXTS } from '../constants';

interface DescriptionModalContentProps {
  uiTexts: UiTexts;
}

const descriptionModalStyles = `
<style>
    .desc-modal-content { font-family: 'Inter', sans-serif; color: #334155; line-height: 1.6; padding: 0.5rem; }
    .desc-modal-content h2 { color: #1e40af; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #93c5fd; padding-bottom: 0.25rem; font-size: 1.2rem; }
    .desc-modal-content p { margin-bottom: 1rem; color: #475569; }
    .desc-modal-content ul { list-style-type: none; padding-left: 0; margin-bottom: 1rem; }
    .desc-modal-content > ul > li, .desc-modal-content > div > ul > li { /* Direct children li of main ul or div > ul */
        background-color: #e0f2fe; 
        padding: 0.75rem 1rem; 
        margin-bottom: 0.5rem; 
        border-radius: 0.5rem; 
        border-left: 4px solid #3b82f6; 
        color: #0f172a; 
    }
    .desc-modal-content li strong { color: #1e3a8a; } /* Applied via dangerouslySetInnerHTML */
    .desc-modal-content .desc-tab-button-like { display: inline-block; background-color: #3b82f6; color: white; padding: 0.3rem 0.6rem; border-radius: 0.375rem; font-size: 0.875rem; margin-right: 0.5rem; margin-bottom: 0.5rem; }
    /* Nested ul specific style */
    .desc-modal-content ul ul { margin-top: 0.5rem; margin-bottom: 0; padding-left: 1rem; } /* Add padding for nesting */
    .desc-modal-content ul ul li { 
        background-color: #cfeafe; /* Slightly different bg for nested items */
        border-left-color: #2563eb; 
        padding: 0.6rem 0.8rem;
    }
     .desc-modal-content ul ul ul li { /* For third-level nesting if any */
        background-color: #addcfe;
        border-left-color: #1d4ed8;
    }
</style>
`;

const DescriptionModalContent: React.FC<DescriptionModalContentProps> = ({ uiTexts }) => {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: descriptionModalStyles }} />
      <div className="desc-modal-content">
        <p dangerouslySetInnerHTML={{ __html: uiTexts.descP1 || BASE_UI_TEXTS.descP1 }} />
        <p dangerouslySetInnerHTML={{ __html: uiTexts.descP2 || BASE_UI_TEXTS.descP2 }} />
        <p dangerouslySetInnerHTML={{ __html: uiTexts.descP3 || BASE_UI_TEXTS.descP3 }} />
        
        <h2>{uiTexts.descTitle2 || BASE_UI_TEXTS.descTitle2}</h2>
        <p dangerouslySetInnerHTML={{ __html: uiTexts.descP4 || BASE_UI_TEXTS.descP4 }} />
        <ul>
            <li dangerouslySetInnerHTML={{ __html: uiTexts.descL1I1 || BASE_UI_TEXTS.descL1I1 }} />
            <li dangerouslySetInnerHTML={{ __html: uiTexts.descL1I2 || BASE_UI_TEXTS.descL1I2 }} />
            <li dangerouslySetInnerHTML={{ __html: uiTexts.descL1I3 || BASE_UI_TEXTS.descL1I3 }} />
            <li dangerouslySetInnerHTML={{ __html: uiTexts.descL1I4 || BASE_UI_TEXTS.descL1I4 }} />
            <li dangerouslySetInnerHTML={{ __html: uiTexts.descL1I5 || BASE_UI_TEXTS.descL1I5 }} />
            <li dangerouslySetInnerHTML={{ __html: uiTexts.descL1I6 || BASE_UI_TEXTS.descL1I6 }} />
        </ul>

        {(uiTexts.descTitle3 || BASE_UI_TEXTS.descTitle3) && (
            <>
                <h2>{uiTexts.descTitle3 || BASE_UI_TEXTS.descTitle3}</h2>
                <p dangerouslySetInnerHTML={{ __html: uiTexts.descP5 || BASE_UI_TEXTS.descP5 }} />

                {(uiTexts.descTab1Name || BASE_UI_TEXTS.descTab1Name) && (
                    <div>
                        <span className="desc-tab-button-like">{uiTexts.descTab1Name || BASE_UI_TEXTS.descTab1Name}</span>
                        <p className="mt-2 mb-4 ml-1" dangerouslySetInnerHTML={{ __html: uiTexts.descTab1P1 || BASE_UI_TEXTS.descTab1P1 }} />
                        <ul className="ml-1">
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab1L1I1 || BASE_UI_TEXTS.descTab1L1I1 }} />
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab1L1I2 || BASE_UI_TEXTS.descTab1L1I2 }} />
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab1L1I3 || BASE_UI_TEXTS.descTab1L1I3 }} />
                            {(uiTexts.descTab1L2I1 || BASE_UI_TEXTS.descTab1L2I1) && (
                                <ul>
                                    <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab1L2I1 || BASE_UI_TEXTS.descTab1L2I1 }} />
                                    <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab1L2I2 || BASE_UI_TEXTS.descTab1L2I2 }} />
                                    <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab1L2I3 || BASE_UI_TEXTS.descTab1L2I3 }} />
                                    <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab1L2I4 || BASE_UI_TEXTS.descTab1L2I4 }} />
                                </ul>
                            )}
                        </ul>
                    </div>
                )}
                {(uiTexts.descTab2Name || BASE_UI_TEXTS.descTab2Name) && (
                     <div>
                        <span className="desc-tab-button-like">{uiTexts.descTab2Name || BASE_UI_TEXTS.descTab2Name}</span>
                        <p className="mt-2 mb-4 ml-1" dangerouslySetInnerHTML={{ __html: uiTexts.descTab2P1 || BASE_UI_TEXTS.descTab2P1 }} />
                        <ul className="ml-1">
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab2L1I1 || BASE_UI_TEXTS.descTab2L1I1 }} />
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab2L1I2 || BASE_UI_TEXTS.descTab2L1I2 }} />
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab2L1I3 || BASE_UI_TEXTS.descTab2L1I3 }} />
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab2L1I4 || BASE_UI_TEXTS.descTab2L1I4 }} />
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab2L1I5 || BASE_UI_TEXTS.descTab2L1I5 }} />
                        </ul>
                    </div>
                )}
                {(uiTexts.descTab3Name || BASE_UI_TEXTS.descTab3Name) && (
                    <div>
                        <span className="desc-tab-button-like">{uiTexts.descTab3Name || BASE_UI_TEXTS.descTab3Name}</span>
                        <p className="mt-2 mb-4 ml-1" dangerouslySetInnerHTML={{ __html: uiTexts.descTab3P1 || BASE_UI_TEXTS.descTab3P1 }} />
                        <ul className="ml-1">
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab3L1I1 || BASE_UI_TEXTS.descTab3L1I1 }} />
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab3L1I2 || BASE_UI_TEXTS.descTab3L1I2 }} />
                        </ul>
                    </div>
                )}
                 {(uiTexts.descTab4Name || BASE_UI_TEXTS.descTab4Name) && (
                    <div>
                        <span className="desc-tab-button-like">{uiTexts.descTab4Name || BASE_UI_TEXTS.descTab4Name}</span>
                        <p className="mt-2 mb-4 ml-1" dangerouslySetInnerHTML={{ __html: uiTexts.descTab4P1 || BASE_UI_TEXTS.descTab4P1 }} />
                        <ul className="ml-1">
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab4L1I1 || BASE_UI_TEXTS.descTab4L1I1 }} />
                            <li dangerouslySetInnerHTML={{ __html: uiTexts.descTab4L1I2 || BASE_UI_TEXTS.descTab4L1I2 }} />
                        </ul>
                    </div>
                )}
                <p className="mt-6 text-center text-sm text-slate-500" dangerouslySetInnerHTML={{ __html: uiTexts.descP6 || BASE_UI_TEXTS.descP6 }} />
            </>
        )}
      </div>
    </>
  );
};

export default DescriptionModalContent;
