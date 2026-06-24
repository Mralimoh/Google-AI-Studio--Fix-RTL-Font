// ==UserScript==
// @name         Google AI Studio
// @namespace    https://github.com/Mralimoh
// @version      1.0
// @description  Set Persian Font + Fix RTL.
// @author       Mralimoh
// @match        https://aistudio.google.com/*
// @resource     VAZIR_FONT https://cdnjs.cloudflare.com/ajax/libs/vazir-font/30.1.0/Vazir-Thin.woff
// @resource     SHABNAM_FONT https://cdnjs.cloudflare.com/ajax/libs/shabnam-font/5.0.1/Shabnam-Thin.woff
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceURL
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-start
// @updateURL    https://github.com/Mralimoh/Google-AI-Studio--Fix-RTL-Font/raw/main/aistudio.user.js
// @downloadURL  https://github.com/Mralimoh/Google-AI-Studio--Fix-RTL-Font/raw/main/aistudio.user.js
// ==/UserScript==

(function() {
    'use strict';

    const HINTS = {
        "Start typing a prompt to see what our models can do": "پرامپت خود را اینجا بنویسید...",
        "Describe an app and let Gemini do the rest": "اپلیکیشن خود را توصیف کنید...",
        "Make changes, add new features, ask for anything": "تغییرات یا ویژگی‌های جدید..."
    };

    const FONTS = {
        vazir: { name: 'Vazirmatn', url: GM_getResourceURL('VAZIR_FONT') },
        shabnam: { name: 'Shabnam', url: GM_getResourceURL('SHABNAM_FONT') }
    };

    const PERSIAN_UNICODE_RANGE = 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF';
    const activeFontKey = GM_getValue('SELECTED_FONT', 'shabnam');
    let menuIds = [];

    const aiStyleSheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, aiStyleSheet];

    function generateCSS(font) {
        const placeholderSelectors = Object.keys(HINTS)
            .map(hint => `textarea[placeholder="${hint}"]`)
            .join(',\n');

        return `
            :root {
                --ai-persian-only-font: 'PersianOnly', Roboto, Arial, sans-serif;
                --ai-persian-all-font: 'PersianAll', Roboto, Arial, sans-serif;
            }

            @font-face {
                font-family: 'PersianOnly';
                src: url('${font.url}') format('woff');
                unicode-range: ${PERSIAN_UNICODE_RANGE};
                font-display: swap;
                size-adjust: 114%;
            }

            @font-face {
                font-family: 'PersianAll';
                src: url('${font.url}') format('woff');
                font-display: swap;
                size-adjust: 114%;
            }

            * {
                font-family: var(--ai-persian-only-font) !important;
            }

            ms-prompt-box .textarea-row,
            ms-autocomplete-textarea .prompt-textarea,
            ms-autosize-textarea .textarea,
            ms-code-assistant-chat textarea {
                direction: rtl !important;
                text-align: right !important;
            }

            ms-prompt-chunk ms-cmark-node,
            ms-console-turn ms-cmark-node {
                font-family: var(--ai-persian-all-font) !important;
                direction: rtl !important;
                text-align: start !important;
                unicode-bidi: plaintext !important;
                line-height: 1.6 !important;
            }

            ms-prompt-chunk ms-code-block,
            ms-prompt-chunk ms-code-block * {
                direction: ltr !important;
                text-align: left !important;
                font-family: monospace !important;
                line-height: 1.2 !important;
            }

            ms-system-instructions-panel .subtitle,
            ms-system-instructions textarea {
                unicode-bidi: plaintext !important;
                text-align: start !important;
            }

            .material-symbols-outlined {
                font-family: 'Google Symbols' !important;
            }

            @keyframes placeholderDetector {
                from { opacity: 0.99; }
                to { opacity: 1; }
            }

            ${placeholderSelectors} {
                animation: placeholderDetector 0.1ms;
            }
        `;
    }

    function applyFont(fontKey) {
        const activeFont = FONTS[fontKey] || FONTS.shabnam;
        GM_setValue('SELECTED_FONT', fontKey);

        aiStyleSheet.replaceSync(generateCSS(activeFont));

        renderMenu(fontKey);
    }

    function renderMenu(currentFont) {
        menuIds.forEach((id) => GM_unregisterMenuCommand(id));
        menuIds = [];

        Object.keys(FONTS).forEach(key => {
            const isSelected = currentFont === key ? '✅ ' : '';
            menuIds.push(GM_registerMenuCommand(`${isSelected}${FONTS[key].name}`, () => applyFont(key)));
        });
    }

    document.addEventListener('animationstart', (event) => {
        if (event.animationName === 'placeholderDetector') {
            const el = event.target;
            if (HINTS[el.placeholder]) {
                el.placeholder = HINTS[el.placeholder];
            }
        }
    }, true);

    applyFont(activeFontKey);
})();
