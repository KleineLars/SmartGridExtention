const STYLE_ELM_ID = "smarterSmartschoolStyle";

function setStyle(colorbg, colorte, colortb, colortt) {
    let style = document.getElementById(STYLE_ELM_ID) || document.createElement("style");
    style.id = STYLE_ELM_ID;
    document.head.appendChild(style);
    style.innerHTML = `
        body, input, select, textarea, .smsc-title--1, .course__block, .news__feed__button__content, .topnav__menu, .topnav__menuitem, .smscMainBlockContainer, .smsc-container, #smscMain {
            color: ${colorte} !important;
            background-color: ${colorbg} !important;
        }
        .topnav, .topnav__btn, .topnav__title {
            color: ${colortt} !important;
            background-color: ${colortb} !important;
        }
    `;
}

function updateBadge(count) {
    let msgAnnounce = document.querySelector(".js-badge-msg");
    if (msgAnnounce && count > 0) {
        msgAnnounce.innerHTML = count.toString();
        msgAnnounce.removeAttribute("hidden");
        msgAnnounce.style.setProperty("display", "block", "important");
        msgAnnounce.classList.remove("smsc-hide");
    }
}

chrome.storage.sync.get({
    theme: "light", colorbg: "#FFFFFF", colorte: "#262626", colortb: "#FF520E", colortt: "#FFFFFF", fakeMsgCount: 0
}, function (items) {
    if (document.getElementById("quickSettingsButton")) return;
    if (items.theme === "custom") setStyle(items.colorbg, items.colorte, items.colortb, items.colortt);
    
    // Refresh proof: blijf de badge forceren tijdens het laden
    let attempts = 0;
    const force = setInterval(() => {
        updateBadge(items.fakeMsgCount);
        if (++attempts > 50) clearInterval(force);
    }, 100);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.fakeMsgCount) updateBadge(changes.fakeMsgCount.newValue);
});