// ==UserScript==
// @name         Current Uncoded Combat Knowledge (Flatline)
// @namespace    https://github.com/mtxve
// @version      0.17.1
// @description  Send callout orders to discord from torn.
// @author       MCSH, Updated by Asemov (Removed custom API requests & fixed chat clear issue)
// @match        https://www.torn.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        GM.xmlHttpRequest
// @require      https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// ==/UserScript==

(function() {
    'use strict';

    function writeInFactionChat(msg) {
    // Open faction chat if not open.
    const factionButton = document.querySelector("button[title='Faction']");
    if (factionButton && factionButton.className.indexOf("minimized-menu-item--open") === -1) {
        factionButton.click();
    }
    // Locate the chat input box.
    let box;
    try {
        box = [...document.querySelectorAll("div[class*='chat-box-header__av']")]
            .filter(e => e.nextSibling && e.nextSibling.innerText === 'Faction')[0]
            .parentElement.parentElement.parentElement.lastElementChild.firstChild;
    } catch (e) {
        console.error("Failed to locate faction chat input:", e);
    }
    if (!box) {
        console.error("Faction chat input not found");
        return;
    }
    box.focus();

    // Use the native setter for the value property.
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    nativeInputValueSetter.call(box, msg);

    // Dispatch an 'input' event.
    const event = new Event('input', { bubbles: true });
    box.dispatchEvent(event);
}

    function get_tbs(tid) {
        const tkey = `tdup.battleStatsPredictor.cache.spy_v2.tornstats_${tid}`;
        if (localStorage[tkey] && (Date.now() / 1000 - JSON.parse(localStorage[tkey]).timestamp) < 60 * 60 * 24 * 30) {
            return JSON.parse(localStorage[tkey]).total;
        }
        const pkey = `tdup.battleStatsPredictor.cache.prediction.${tid}`;
        return JSON.parse(localStorage[pkey]).TBS;
    }

    function get_tbs_string(tid) {
        const tbs = get_tbs(tid);
        if (tbs > 1000000000) {
            return Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(tbs / 1000000000) + "B";
        }
        if (tbs > 1000000) {
            return Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(tbs / 1000000) + "M";
        }
        if (tbs > 1000) {
            return Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(tbs / 1000) + "K";
        }
        return "<1k";
    }

    if (window.location.href.startsWith("https://www.torn.com/loader.php?sid=attack")) {
        const tID = (new URLSearchParams(window.location.search)).get("user2ID");
        let uname;
        waitForKeyElements("#defender span[class^='userName']", e => { uname = e.innerText; });
        waitForKeyElements("div[class^='titleContainer']", elem => {
            const b1 = document.createElement("h4");
            b1.className = "title___rhtB4";
            b1.innerHTML = "HOSP";
            b1.style = "color: #FF0000;";
            b1.onclick = () => {
                const bts = get_tbs_string(tID);
                writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} HOSP ${uname}`);
            };
            elem.appendChild(b1);
            const b2 = document.createElement("h4");
            b2.className = "title___rhtB4";
            b2.innerHTML = "LEAVE";
            b2.style = "color: #009900;";
            b2.onclick = () => {
                const bts = get_tbs_string(tID);
                writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} LEAVE ${uname}`);
            };
            elem.appendChild(b2);
            const b3 = document.createElement("h4");
            b3.className = "title___rhtB4";
            b3.innerHTML = "RETAL";
            b3.style = "color: #0000FF;";
            b3.onclick = () => {
                const bts = get_tbs_string(tID);
                writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} RETAL ${uname}`);
            };
            elem.appendChild(b3);
        });
    }

    if (window.location.href.startsWith("https://www.torn.com/profiles")) {
        const tID = (new URLSearchParams(window.location.search)).get("XID");
        let uname = document.querySelector("#skip-to-content").innerText;
        let ind = uname.indexOf("'");
        if (ind === -1) {
            ind = uname.indexOf(" ");
        }
        uname = uname.substr(0, ind);
        waitForKeyElements("#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.buttons-wrap > div", (btn_list) => {
            const b1 = document.createElement("a");
            b1.className = "profile-button active";
            b1.innerHTML = "<center style='margin:10px 5px; color: #FF0000;'>HOSP</center>";
            b1.style = "text-decoration:none;";
            b1.onclick = () => {
                const bts = get_tbs_string(tID);
                const txt = document.querySelector("div.description span.main-desc").innerText;
                let add = "";
                if (txt.startsWith("In hospital for ")) {
                    add += txt.substring(15);
                }
                writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} HOSP ${uname} ${add}`);
            };
            btn_list.appendChild(b1);
            const b2 = document.createElement("a");
            b2.className = "profile-button active";
            b2.innerHTML = "<center style='margin:10px 3px; color: #00FF00;'>LEAVE</center>";
            b2.style = "text-decoration:none;";
            b2.onclick = () => {
                const bts = get_tbs_string(tID);
                const txt = document.querySelector("div.description span.main-desc").innerText;
                let add = "";
                if (txt.startsWith("In hospital for ")) {
                    add += txt.substring(15);
                }
                writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} LEAVE ${uname} ${add}`);
            };
            btn_list.appendChild(b2);
            const b3 = document.createElement("a");
            b3.className = "profile-button active";
            b3.innerHTML = "<center style='margin:10px 3px; color: #0000FF;'>RETAL</center>";
            b3.style = "text-decoration:none;";
            b3.onclick = () => {
                const bts = get_tbs_string(tID);
                const txt = document.querySelector("div.description span.main-desc").innerText;
                let add = "";
                if (txt.startsWith("In hospital for ")) {
                    add += txt.substring(15);
                }
                writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} RETAL ${uname} ${add}`);
            };
            btn_list.appendChild(b3);
        });
    }

    waitForKeyElements("div[class^='profile-mini-_userProfileWrapper'", (uprof_wrap) => {
        const prof_wrap = uprof_wrap.parentNode;
        const tID = prof_wrap.querySelector("img").parentNode.href.substr(40);
        const btn_list = prof_wrap.querySelector("div.buttons-list");
        const b1 = document.createElement("a");
        b1.className = "profile-button active";
        b1.innerHTML = "<center style='margin:10px 5px; color: #FF0000; font-size: 80%;'>HOSP</center>";
        b1.style = "text-decoration:none;";
        b1.onclick = () => {
            const uname = document.querySelector("div[class^='profile-mini-_h'] a div[class^='honor']").innerText;
            const bts = get_tbs_string(tID);
            const txt = document.querySelector("div.description span.main-desc").innerText;
            let add = "";
            if (txt.startsWith("In hospital for ")) {
                add += txt.substring(15);
            }
            writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} HOSP ${uname} ${add}`);
        };
        btn_list.appendChild(b1);
        const b2 = document.createElement("a");
        b2.className = "profile-button active";
        b2.innerHTML = "<center style='margin:10px 3px; color: #00FF00; font-size: 80%;'>LEAVE</center>";
        b2.style = "text-decoration:none;";
        b2.onclick = () => {
            const uname = document.querySelector("div[class^='profile-mini-_h'] a div[class^='honor']").innerText;
            const bts = get_tbs_string(tID);
            const txt = document.querySelector("div.description span.main-desc").innerText;
            let add = "";
            if (txt.startsWith("In hospital for ")) {
                add += txt.substring(15);
            }
            writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} LEAVE ${uname} ${add}`);
        };
        btn_list.appendChild(b2);
        const b3 = document.createElement("a");
        b3.className = "profile-button active";
        b3.innerHTML = "<center style='margin:10px 3px; color: #0000FF; font-size: 80%;'>RETAL</center>";
        b3.style = "text-decoration:none;";
        b3.onclick = () => {
            const uname = document.querySelector("div[class^='profile-mini-_h'] a div[class^='honor']").innerText;
            const bts = get_tbs_string(tID);
            const txt = document.querySelector("div.description span.main-desc").innerText;
            let add = "";
            if (txt.startsWith("In hospital for ")) {
                add += txt.substring(15);
            }
            writeInFactionChat(`https://www.torn.com/loader.php?sid=attack&user2ID=${tID} ${bts} RETAL ${uname} ${add}`);
        };
        btn_list.appendChild(b3);
    }, false);
})();
