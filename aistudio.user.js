// ==UserScript==
// @name         Google AI Studio
// @namespace    https://github.com/Mralimoh
// @version      1.0
// @description  Set Persian Font + Fix RTL.
// @author       Mralimoh
// @match        https://aistudio.google.com/*
// @resource     VAZIR_FONT https://cdnjs.cloudflare.com/ajax/libs/vazir-font/30.1.0/Vazir-Light.woff
// @resource     SHABNAM_FONT https://cdnjs.cloudflare.com/ajax/libs/shabnam-font/5.0.1/Shabnam-Light.woff
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceURL
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addStyle
// @run-at       document-start
// @updateURL    https://github.com/Mralimoh/Google-AI-Studio--Fix-RTL-Font/raw/main/aistudio.user.js
// @downloadURL  https://github.com/Mralimoh/Google-AI-Studio--Fix-RTL-FontE/raw/main/aistudio.user.js
// ==/UserScript==

(function() {
    'use strict';

    const TARGET_HINT = "Start typing a prompt to see what our models can do";
    const NEW_HINT = "پرامپت خود را اینجا بنویسید...";

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

    const activeFontKey = GM_getValue('SELECTED_FONT', 'shabnam');
    let activeFont = FONTS[activeFontKey] || FONTS.shabnam;
    let styleElement = null;

    const PERSIAN_UNICODE_RANGE = 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF';

    function generateCSS(font) {
        return `
            @font-face {
                font-family: 'AutoPersian';
                src: url('${font.url}') format('woff');
                unicode-range: ${PERSIAN_UNICODE_RANGE};
                font-display: swap;
                size-adjust: 100%;
            }

            @font-face {
                font-family: 'AutoPersianChat';
                src: url('${font.url}') format('woff');
                font-display: swap;
                size-adjust: 110%;
            }

            * {
                font-family: 'AutoPersian', Roboto, Arial, sans-serif !important;
            }

            ms-prompt-box {
                font-family: 'AutoPersianChat', Roboto, Arial, sans-serif !important;
                direction: rtl !important;
                text-align: right !important;
                line-height: 1.7 !important;
            }

            .multi-media-row,
            .buttons-row {
            direction: ltr !important;
            }

            ms-text-chunk,
            ms-code-assistant-chat {
                direction: rtl !important;
                text-align: right !important;
                unicode-bidi: plaintext !important;
            }

            ms-text-chunk,
            ms-text-chunk *,
            ms-code-assistant-chat,
            ms-code-assistant-chat * {
                font-family: 'AutoPersianChat', Roboto, Arial, sans-serif !important;
                line-height: 1.8 !important;
            }

            ms-code-block,
            ms-code-block * {
                direction: ltr !important;
                text-align: left !important;
                font-family: monospace !important;
                font-size: 13px !important;
                line-height: 1.2 !important;
            }

            .material-symbols-outlined {
                font-family: 'Google Symbols' !important;
                font-size: 20px !important;
            }

            @keyframes placeholderDetector {
                from { opacity: 0.99; }
                to { opacity: 1; }
            }

            textarea[placeholder="${TARGET_HINT}"] {
                animation: placeholderDetector 0.1s;
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

        document.addEventListener('animationstart', (event) => {
        if (event.animationName === 'placeholderDetector') {
            event.target.placeholder = NEW_HINT;
        }
    }, true);

    let menuIds = [];
    function renderMenu(currentFont) {
        menuIds.forEach(id => GM_unregisterMenuCommand(id));
        menuIds = [];
        menuIds.push(GM_registerMenuCommand(`${currentFont === 'shabnam' ? '✅ ' : ''}Shabnam`, () => applyFont('shabnam')));
        menuIds.push(GM_registerMenuCommand(`${currentFont === 'vazir' ? '✅ ' : ''}Vazir`, () => applyFont('vazir')));
    }

    applyFont(activeFontKey);
})();
