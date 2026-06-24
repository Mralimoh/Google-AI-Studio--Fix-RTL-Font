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
// @grant        GM_addStyle
// @run-at       document-start
// @updateURL    https://github.com/Mralimoh/Google-AI-Studio--Fix-RTL-Font/raw/main/aistudio.user.js
// @downloadURL  https://github.com/Mralimoh/Google-AI-Studio--Fix-RTL-Font/raw/main/aistudio.user.js
// ==/UserScript==

(function() {
    'use strict';

    const TARGET_HINT = "Start typing a prompt to see what our models can do";
    const NEW_HINT = "پرامپت خود را اینجا بنویسید...";

    const TARGET_APP_HINT = "Describe an app and let Gemini do the rest";
    const NEW_APP_HINT = "اپلیکیشن خود را توصیف کنید...";

    const TARGET_EDIT_HINT = "Make changes, add new features, ask for anything";
    const NEW_EDIT_HINT = "تغییرات یا ویژگی‌های جدید...";

    const FONTS = {
        vazir: {
            name: 'Vazirmatn',
            url: GM_getResourceURL('VAZIR_FONT')
        },
        shabnam: {
            name: 'Shabnam',
            url: GM_getResourceURL('SHABNAM_FONT')
        }
    };

    const PERSIAN_UNICODE_RANGE = 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF';

    const activeFontKey = GM_getValue('SELECTED_FONT', 'shabnam');
    let activeFont = FONTS[activeFontKey] || FONTS.shabnam;
    let styleElement = null;
    let menuIds = [];

    function generateCSS(font) {
        return `
            @font-face {
                font-family: 'Persian';
                src: url('${font.url}') format('woff');
                unicode-range: ${PERSIAN_UNICODE_RANGE};
                font-display: swap;
                size-adjust: 110%;
            }

            @font-face {
                font-family: 'PersianAll';
                src: url('${font.url}') format('woff');
                font-display: swap;
                size-adjust: 110%;
            }

            * {
                font-family: 'Persian', Roboto, Arial, sans-serif !important;
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
                font-family: 'PersianAll', Roboto, Arial, sans-serif !important;
                direction: rtl !important;
                text-align: start !important;
                unicode-bidi: plaintext !important;
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

            textarea[placeholder="${TARGET_HINT}"],
            textarea[placeholder="${TARGET_APP_HINT}"],
            textarea[placeholder="${TARGET_EDIT_HINT}"] {
                animation: placeholderDetector 0.1ms;
            }
        `;
    }

    function applyFont(fontKey) {
        activeFont = FONTS[fontKey] || FONTS.shabnam;
        GM_setValue('SELECTED_FONT', fontKey);

        const css = generateCSS(activeFont);

        if (!styleElement) {
            styleElement = GM_addStyle(css);
        } else {
            styleElement.textContent = css;
        }

        renderMenu(fontKey);
    }

    function renderMenu(currentFont) {
        menuIds.forEach((id) => GM_unregisterMenuCommand(id));
        menuIds = [];

        menuIds.push(GM_registerMenuCommand(
            `${currentFont === 'shabnam' ? '✅ ' : ''}Shabnam`,
            () => applyFont('shabnam')
        ));

        menuIds.push(GM_registerMenuCommand(
            `${currentFont === 'vazir' ? '✅ ' : ''}Vazir`,
            () => applyFont('vazir')
        ));
    }

    document.addEventListener('animationstart', (event) => {
        if (event.animationName === 'placeholderDetector') {
            if (event.target.placeholder === TARGET_HINT) {
                event.target.placeholder = NEW_HINT;
            } else if (event.target.placeholder === TARGET_APP_HINT) {
                event.target.placeholder = NEW_APP_HINT;
            } else if (event.target.placeholder === TARGET_EDIT_HINT) {
                event.target.placeholder = NEW_EDIT_HINT;
            }
        }
    }, true);

    applyFont(activeFontKey);
})();
