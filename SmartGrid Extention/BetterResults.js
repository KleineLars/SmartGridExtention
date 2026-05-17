const sidebar_selector = ".sidebar-results>:first-child";
const SMARTGRID_THEME_STYLE_ID = "smartgrid-theme-vars";
const SMARTGRID_SMPP_ID = "bdhficnphioomdjhdfbhdepjgggekodf";
const SMARTGRID_SMPP_FILES = [
  "media/icons/smpp/128.png",
  "media/icons/smpp/48.png",
  "media/icons/smpp/16.png",
];

const SMARTGRID_DEFAULT_THEME = {
  accent: "#FF520E",
  base01: "#ffffff",
  base02: "#f8fafc",
  base03: "#e5e7eb",
  border: "#cbd5e1",
  text: "#1e293b",
  muted: "#64748b",
  headertext: "#ffffff",
  tooltipBg: "#1e293b",
};

function getCssVar(name) {
  const rootValue = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (rootValue || !document.body) return rootValue;
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function getSmppThemeColors() {
  return {
    colorAccent: getCssVar("--color-accent"),
    colorBase01: getCssVar("--color-base01"),
    colorBase02: getCssVar("--color-base02"),
    colorBase03: getCssVar("--color-base03"),
    colorText: getCssVar("--color-text"),
    colorMuted: getCssVar("--color-muted") || getCssVar("--color-text-muted"),
  };
}

function hasSmppThemeColors(colors = getSmppThemeColors()) {
  return Boolean(colors.colorAccent && colors.colorBase02);
}

function getStoredSmppState() {
  try {
    const stored = JSON.parse(localStorage.getItem("smppActive") || "null");
    return Boolean(stored && stored.active);
  } catch (_) {
    return false;
  }
}

function isSmppActive() {
  return document.documentElement.dataset.smartschoolPlusPlus === "active"
    || hasSmppThemeColors()
    || getStoredSmppState();
}

function resolveThemeColors() {
  const colors = getSmppThemeColors();

  if (isSmppActive() && hasSmppThemeColors(colors)) {
    return {
      accent: colors.colorAccent,
      base01: colors.colorBase01 || SMARTGRID_DEFAULT_THEME.base01,
      base02: colors.colorBase02 || SMARTGRID_DEFAULT_THEME.base02,
      base03: colors.colorBase03 || SMARTGRID_DEFAULT_THEME.base03,
      border: colors.colorBase03 || SMARTGRID_DEFAULT_THEME.border,
      text: colors.colorText || SMARTGRID_DEFAULT_THEME.text,
      muted: colors.colorMuted || colors.colorText || SMARTGRID_DEFAULT_THEME.muted,
      headertext: colors.colorText || SMARTGRID_DEFAULT_THEME.text,
      tooltipBg: colors.colorBase02 || SMARTGRID_DEFAULT_THEME.tooltipBg,
    };
  }

  return SMARTGRID_DEFAULT_THEME;
}

function applySmartGridTheme() {
  const theme = resolveThemeColors();
  let style = document.getElementById(SMARTGRID_THEME_STYLE_ID) || document.createElement("style");
  style.id = SMARTGRID_THEME_STYLE_ID;
  style.textContent = `
    :root,
    body {
      --sg-accent: var(--color-accent, ${theme.accent});
      --sg-base01: var(--color-base01, ${theme.base01});
      --sg-base02: var(--color-base02, ${theme.base02});
      --sg-base03: var(--color-base03, ${theme.base03});
      --sg-border: var(--color-base03, ${theme.border});
      --sg-text: var(--color-text, ${theme.text});
      --sg-muted: var(--color-muted, var(--color-text-muted, ${theme.muted}));
      --sg-headertext: var(--color-text, ${theme.headertext});
      --sg-tooltip-bg: var(--color-base02, ${theme.tooltipBg});
    }

    html[data-smartschool-plus-plus="active"],
    html[data-smartschool-plus-plus="active"] body {
      --sg-accent: var(--color-accent, ${theme.accent});
      --sg-base01: var(--color-base01, ${theme.base01});
      --sg-base02: var(--color-base02, ${theme.base02});
      --sg-base03: var(--color-base03, ${theme.base03});
      --sg-border: var(--color-base03, ${theme.border});
      --sg-text: var(--color-text, ${theme.text});
      --sg-muted: var(--color-muted, var(--color-text-muted, ${theme.muted}));
      --sg-headertext: var(--color-text, ${theme.headertext});
      --sg-tooltip-bg: var(--color-base02, ${theme.tooltipBg});
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

async function probeSmppFile(file) {
  const url = `chrome-extension://${SMARTGRID_SMPP_ID}/${file}`;
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    return { file, ok: res.ok, status: res.status };
  } catch (_) {
    return { file, ok: false, status: "ERR_FAILED" };
  }
}

async function detectSmartschoolPlusPlus() {
  let active = hasSmppThemeColors();
  let results = [];
  let firstHit = null;

  if (!active) {
    results = await Promise.all(SMARTGRID_SMPP_FILES.map(probeSmppFile));
    firstHit = results.find(result => result.ok) || null;
    active = Boolean(firstHit);
  }

  document.documentElement.dataset.smartschoolPlusPlus = active ? "active" : "inactive";

  try {
    localStorage.setItem("smppActive", JSON.stringify({ active, firstHit, results }));
  } catch (_) {}

  return { active, firstHit, results };
}

function initSmartGridTheme() {
  applySmartGridTheme();
  detectSmartschoolPlusPlus().then(applySmartGridTheme).catch(applySmartGridTheme);

  let refreshes = 0;
  const refreshTheme = setInterval(() => {
    applySmartGridTheme();
    if (++refreshes > 15) clearInterval(refreshTheme);
  }, 300);
}

initSmartGridTheme();

// --- OBSERVERS ---
let wideToolbarCallback = function (mutationsList, _) {
  for (let mutation of mutationsList) {
    if (mutation.type == 'childList' && mutation.removedNodes.length != 0) {
      for (const node of mutation.removedNodes) {
        if (node.id == "show-grid") addButton();
      }
    }
  }
};

let wideToolbarObserver = new MutationObserver(wideToolbarCallback);

let smscMainCallback = function (mutationsList, observer) {
  if ($(sidebar_selector)[0]) {
    wideToolbarObserver.observe($(sidebar_selector)[0], { attributes: false, childList: true, subtree: false });
  }
  onLoad();
  addButton();
};

let smscMainObserver = new MutationObserver(smscMainCallback);
if ($('#smscMain')[0]) {
  smscMainObserver.observe($('#smscMain')[0], { attributes: false, childList: true, subtree: false });
}

function totalToStr(total_numerator, total_denominator) {
  return (Math.round(total_numerator / total_denominator * 1000) / 10).toString() + '%';
}

// --- QUOTE LOGICA ---
const quotes = {
  bad: [
    "Ai, dit ziet er niet best uit. Tijd om die boeken eens echt open te slaan!",
    "Oei, deze cijfers doen pijn aan m'n pixels. Je kunt beter dan dit!",
    "Werk aan de winkel! De vakantie is nog ver weg met deze punten.",
    "Dit is de 'danger zone'. Tijd voor een serieuze inhaalbeweging!",
    "Focus! Leg die telefoon weg en ga aan de slag. Je toekomst wacht!"
  ],
  okay: [
    "Niet slecht, maar er zit zeker nog meer in je! Even doorzetten.",
    "Je bent er bijna, maar nog net niet helemaal 'veilig'. Kop op!",
    "Een wankele basis. Probeer die 50% om te buigen naar een 60%!",
    "Je overleeft het, maar we willen niet alleen overleven, toch?",
    "Kleine verbeteringen kunnen een groot verschil maken. Keep going!"
  ],
  good: [
    "Lekker bezig! Je bent goed op weg naar een top-rapport!",
    "Kijk die groene gloed eens! Je hebt het onder controle.",
    "Sterk werk! Vergeet niet ook af en toe te ontspannen.",
    "Je bent on fire! Blijf deze flow vasthouden.",
    "Topresultaten! Je mag oprecht trots zijn op jezelf."
  ]
};

function getQuote(percentage) {
  let category = percentage < 0.5 ? "bad" : (percentage < 0.6 ? "okay" : "good");
  let pool = quotes[category];
  return pool[Math.floor(Math.random() * pool.length)];
}

function addButton() {
  if (document.getElementById("show-grid")) return;
  const btn = $("<button/>")
    .attr("id", "show-grid")
    .addClass("optionWrapper-IEDUX button-mJfIq sg-sidebar-item smsc-sidebar__item") 
    .click(openGrid);

  const icon = $("<img/>").attr("src", chrome.runtime.getURL("static/img/icon_128.png")).addClass("sg-icon");
  const label = $("<span/>").text("SmartGrid").addClass("label-dOebJ sg-label-text");

  btn.append(icon).append(label);
  $(sidebar_selector).append(btn);
}

// --- RAPPORT LOGICA ---
function showReport(periodName, data_source) {
    $(".report-overlay").remove(); 
    let reportWindow = $("<div id='report-content'/>").addClass("report-overlay");
    
    reportWindow.append($("<div/>").addClass("report-header").append(
        $("<h1/>").addClass("report-title").text("SmartGrid Voortgangsrapport"),
        $("<p/>").text(periodName + " | Datum: " + new Date().toLocaleDateString())
    ));

    let table = $("<table/>").addClass("report-table");
    table.append("<thead><tr><th class='report-th report-th-left'>Vak</th><th class='report-th report-th-right'>Gemiddelde</th></tr></thead>");
    
    let tbody = $("<tbody/>");
    let grand_n = 0;
    let grand_d = 0;

    for (let [course_name, course] of Object.entries(data_source)) {
        let tn = 0; let td = 0;
        course.forEach(res => {
            let match = res.graphic.description.match(/^([\d\,\.]+)\/([\d\,\.]+)$/);
            if (match) {
                let n = parseFloat(match[1].replace(',', '.'));
                let d = parseFloat(match[2].replace(',', '.'));
                tn += n; td += d;
                grand_n += n; grand_d += d;
            }
        });
        if (td > 0) {
            let p = tn / td;
            let percentageText = Math.round(p * 1000) / 10 + "%";
            let scoreStyle = p < 0.5 ? "color: #ef4444;" : "color: var(--sg-text);";
            
            let row = $("<tr/>").append(
                $("<td/>").addClass("report-td").text(course_name),
                $("<td style='" + scoreStyle + "'/>").addClass("report-td report-score").text(percentageText)
            );
            tbody.append(row);
        }
    }

    if (grand_d > 0) {
        let grand_p = grand_n / grand_d;
        let grand_text = Math.round(grand_p * 1000) / 10 + "%";
        let grand_style = grand_p < 0.5 ? "color: #ef4444;" : "color: var(--sg-text);";
        
        let footerRow = $("<tr/>").addClass("report-total-row").append(
            $("<td/>").addClass("report-total-cell").text("Totaal"),
            $("<td style='" + grand_style + "'/>").addClass("report-total-cell report-score").text(grand_text)
        );
        tbody.append(footerRow);
    }

    table.append(tbody);
    reportWindow.append(table);

    let actions = $("<div/>").css({"margin-top": "30px", "text-align": "center", "display":"flex", "gap":"10px", "justify-content":"center"});
    let printBtn = $("<button/>").text("Print / PDF").addClass("period_button active").click(() => window.print());
    let closeBtn = $("<button/>").text("Sluiten").addClass("period_button").click(() => reportWindow.remove());

    reportWindow.append(actions.append(printBtn, closeBtn));
    $("body").append(reportWindow);
}

// --- CORE LOGICA ---
function generateGridContent(name, data_source) {
    let total_n_period = 0;
    let total_d_period = 0;
    let table = $("<table/>").attr("id", "result-table");
    let longest = 0;

    for (let [_, course] of Object.entries(data_source)) {
        course.sort((a, b) => a["date"].localeCompare(b["date"]));
        if (course.length > longest) longest = course.length;
    }

    for (let [course_name, course] of Object.entries(data_source)) {
        let row = $("<tr/>");
        row.append($("<td/>").addClass("course-name-cell").text(course_name));

        let total_n_course = 0; let total_d_course = 0;
        for (const res of course) {
            const desc = res["graphic"]["description"] || "/";
            const color = res["graphic"]["color"];
            
            let scoreCell = $("<td/>")
                .addClass("score-cell")
                .attr("data-title", res["name"]) 
                .text(desc)
                .on("mouseenter", function(e) {
                    $(".custom-tooltip").remove(); 
                    let tooltipText = $(this).attr("data-title");
                    $("<div/>", { class: "custom-tooltip", text: tooltipText })
                        .appendTo("body")
                        .css({ display: "block", opacity: 0 })
                        .animate({ opacity: 1 }, 100);
                })
                .on("mousemove", function(e) {
                    let tooltip = $(".custom-tooltip");
                    let xOffset = 15;
                    let yOffset = 15;
                    if (e.pageX + tooltip.outerWidth() + 20 > $(window).width()) {
                        xOffset = -(tooltip.outerWidth() + 15);
                    }
                    tooltip.css({ top: e.pageY + yOffset, left: e.pageX + xOffset });
                })
                .on("mouseleave", function() {
                    $(".custom-tooltip").remove();
                });

            let match = desc.match(/^([\d\,\.]+)\/([\d\,\.]+)$/);
            if (match) {
                let n = parseFloat(match[1].replace(',', '.'));
                let d = parseFloat(match[2].replace(',', '.'));
                let perc = n / d;
                if (perc < 0.5) scoreCell.addClass("glow-red");
                else if (perc < 0.6) scoreCell.addClass("glow-yellow");
                else scoreCell.addClass("glow-green");
                total_n_course += n; total_d_course += d;
                total_n_period += n; total_d_period += d;
            } else {
                scoreCell.addClass("c-" + color + "-score");
            }
            row.append(scoreCell);
        }
        for (let i = 0; i < longest - course.length; i++) row.append($("<td/>").addClass("empty-cell"));

        let last_cell = $("<td/>").addClass("total-cell");
        if (total_d_course != 0) {
            let cp = total_n_course / total_d_course;
            last_cell.text(totalToStr(total_n_course, total_d_course));
            if (cp < 0.5) last_cell.addClass("glow-red-text");
            else if (cp < 0.6) last_cell.addClass("glow-yellow-text");
            else last_cell.addClass("glow-green-text");
        }
        row.append(last_cell);
        table.append(row);
    }

    let period_perc = total_n_period / total_d_period;
    let grid = $("<div/>").addClass("period-wrapper-inner");
    let stats = $("<div/>").addClass("stats-container");
    stats.append($("<div/>").addClass("total-badge").text("Totaal: " + totalToStr(total_n_period, total_d_period)));
    stats.append($("<div/>").addClass("quote-box").text(getQuote(period_perc)));
    
    let reportBtn = $("<button/>").addClass("period_button").text("Rapport").css({"margin-left":"auto"}).click(() => showReport(name, data_source));
    stats.append(reportBtn);

    grid.append($("<div/>").addClass("header-container").append($("<h2/>").text(name).css("margin", "0")));
    grid.append(stats);
    grid.append($("<div/>").addClass("table-scroll-container").append(table));
    return grid;
}

function makeGrid() {
  let loading = $("<h3 style='padding:20px; font-family: Segoe UI;'>Laden...</h3>");
  fetch('/results/api/v1/evaluations?itemsOnPage=500').then(r => r.json()).then(results => {
    let data = {}; let yearData = {}; let latest_period = null;
    for (const result of results) {
      if (result["type"] != "normal") continue;
      let period = result["period"]["name"];
      if (latest_period === null) latest_period = period;
      if (!(period in data)) data[period] = {};
      for (const course of result["courses"]) {
        const course_name = course["name"];
        if (!(course_name in data[period])) data[period][course_name] = [];
        data[period][course_name].push({ "date": result["date"], "name": result["name"], "graphic": result["graphic"] });
        if (!(course_name in yearData)) yearData[course_name] = [];
        yearData[course_name].push({ "date": result["date"], "name": result["name"], "graphic": result["graphic"] });
      }
    }
    
    let renderedGrids = {};
    Object.keys(data).forEach(p => { renderedGrids[p] = generateGridContent(p, data[p]); });
    renderedGrids["Jaartotaal"] = generateGridContent("Volledig Schooljaar", yearData);

    let modal = $("<div/>").attr("id", "content-container");
    let period_nav = $("<div/>").addClass("period-nav");
    let main_grid = $("<div/>").attr("id", "period-container");
    let nav_items = [...Object.keys(data).reverse(), "Jaartotaal"];

    nav_items.forEach(p_name => {
      let btn = $("<button/>").addClass("period_button").text(p_name).click(function() {
        if ($(this).hasClass("active")) return;
        const oldContent = main_grid.find(".period-wrapper-inner");
        const newContent = renderedGrids[p_name].clone(true);
        $(".period_button").removeClass("active");
        $(this).addClass("active");
        oldContent.addClass("swipe-exit");
        setTimeout(() => {
          main_grid.empty();
          newContent.addClass("swipe-enter");
          main_grid.append(newContent);
          newContent[0].offsetHeight; 
          newContent.addClass("swipe-enter-active");
        }, 200); 
      });
      if(p_name === latest_period) btn.addClass("active");
      period_nav.append(btn);
    });

    modal.append(period_nav).append(main_grid);
    if (latest_period) main_grid.append(renderedGrids[latest_period].clone(true));
    loading.replaceWith(modal);
  });
  return loading;
}

function onLoad() {
  if (document.getElementById("grid-style")) return;
  let style = document.createElement('style');
  style.id = "grid-style";
  style.innerHTML = `
    .sg-sidebar-item { display: flex !important; align-items: center !important; padding-left: 12px !important; width: 100% !important; height: 48px !important; background: transparent !important; border: none !important; cursor: pointer !important; }
    .sg-icon { width: 24px !important; height: 24px !important; flex-shrink: 0 !important; margin-right: 16px !important; }
    #modal-background { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9998; }
    #modal-content { background: var(--sg-base01); color: var(--sg-text); border: 1px solid var(--sg-border); border-radius: 20px; display: none; padding: 25px; position: fixed; z-index: 9999; left: 5%; top: 5%; width: 90%; height: 85%; font-family: 'Segoe UI', sans-serif; box-shadow: none; overflow: hidden; }
    #modal-content.active, #modal-background.active { display: block; }
    #content-container { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    #period-container { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; position: relative; }
    .period-wrapper-inner { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; transition: all 0.25s ease; }
    
    .report-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--sg-base01); color: var(--sg-text); z-index: 100000; overflow-y: auto; padding: 50px; font-family: 'Segoe UI', sans-serif; }
    .report-title { color: var(--sg-accent); }
    .report-header p { color: var(--sg-muted); }
    .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; color: var(--sg-text); }
    .report-th { border-bottom: 2px solid var(--sg-border); padding: 10px; color: var(--sg-text); }
    .report-th-left { text-align: left; }
    .report-th-right, .report-score { text-align: right; }
    .report-td { padding: 10px; border-bottom: 1px solid var(--sg-border); }
    .report-total-row { background: var(--sg-base02); }
    .report-total-cell { padding: 12px; font-weight: 800; border-top: 2px solid var(--sg-border); }
    
    .swipe-exit { opacity: 0; transform: translateX(-20px); pointer-events: none; }
    .swipe-enter { opacity: 0; transform: translateX(20px); }
    .swipe-enter-active { opacity: 1; transform: translateX(0); }
    .stats-container { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-shrink: 0; }
    .total-badge { background: var(--sg-accent); color: var(--sg-headertext); padding: 8px 15px; border-radius: 10px; font-weight: 800; box-shadow: none; }
    .quote-box { font-style: italic; color: var(--sg-muted); font-size: 14px; border-left: 3px solid var(--sg-accent); padding-left: 10px; min-height: 20px; }
    .table-scroll-container { flex: 1; overflow: auto; border: 1.5px solid var(--sg-border); border-radius: 8px; background: var(--sg-base01); min-height: 0; }
    #result-table { width: 100%; border-collapse: separate; border-spacing: 8px; min-width: 1000px; }
    #result-table td { padding: 10px; text-align: center; font-size: 13.5px; height: 45px; border-radius: 8px; transition: all 0.15s ease; color: var(--sg-text); }
    .score-cell { cursor: pointer; position: relative; }
    .score-cell:hover { transform: translateY(-2px) scale(1.05); z-index: 100; box-shadow: none !important; }
    .course-name-cell { width: 220px; text-align: left !important; font-weight: 700; background: var(--sg-base02) !important; position: sticky; left: 0; z-index: 10; border-right: 2px solid var(--sg-border) !important; border-radius: 0 !important; }
    .total-cell { width: 85px; font-weight: 800; background: var(--sg-base02) !important; position: sticky; right: 0; z-index: 10; border-left: 2px solid var(--sg-border) !important; border-radius: 0 !important; }
    .period-nav { height: 55px; display: flex; gap: 10px; overflow-x: auto; align-items: center; margin-bottom: 10px; flex-shrink: 0; }
    .period_button { background: var(--sg-base02); color: var(--sg-text); border: 1px solid var(--sg-border); padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s ease; box-shadow: none; }
    .period_button:hover:not(.active) { background: var(--sg-base03); transform: translateY(-2px); box-shadow: none; }
    .period_button.active { background: var(--sg-accent); color: var(--sg-headertext); border-color: var(--sg-accent); box-shadow: none; }
    #modal-close { position: absolute; top: 15px; right: 15px; background: var(--sg-base02); color: var(--sg-text); border: 1px solid var(--sg-border); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; z-index: 100; transition: background 0.2s; box-shadow: none; }
    #modal-close:hover { background: var(--sg-base03); }
    .glow-red { background-color: #fee2e2 !important; color: #991b1b !important; }
    .glow-yellow { background-color: #fef9c3 !important; color: #854d0e !important; }
    .glow-green { background-color: #dcfce7 !important; color: #166534 !important; }
    .glow-red-text { color: #ef4444 !important; font-weight: 800; }
    .glow-yellow-text { color: #d97706 !important; font-weight: 800; }
    .glow-green-text { color: #16a34a !important; font-weight: 800; }
    .custom-tooltip { position: absolute; z-index: 99999; background: var(--sg-tooltip-bg); color: var(--sg-headertext); padding: 10px 15px; border-radius: 8px; font-size: 13px; font-weight: 600; pointer-events: none; box-shadow: none; max-width: 300px; line-height: 1.4; border: 1px solid var(--sg-border); }

    html[data-smartschool-plus-plus="active"] .score-cell,
    html[data-smartschool-plus-plus="active"] .empty-cell,
    html[data-smartschool-plus-plus="active"] .course-name-cell,
    html[data-smartschool-plus-plus="active"] .total-cell,
    html[data-smartschool-plus-plus="active"] .total-badge {
      background: var(--sg-base02) !important;
      color: var(--sg-text) !important;
      border: 1px solid var(--sg-border) !important;
    }

    html[data-smartschool-plus-plus="active"] .course-name-cell {
      min-width: 220px;
      max-width: 220px;
      z-index: 40;
      overflow-wrap: anywhere;
      line-height: 1.15;
    }

    html[data-smartschool-plus-plus="active"] .total-cell {
      min-width: 85px;
      z-index: 40;
    }

    html[data-smartschool-plus-plus="active"] .total-badge {
      box-shadow: none;
    }

    html[data-smartschool-plus-plus="active"] .quote-box {
      background: var(--sg-base02);
      color: var(--sg-text);
      border: 1px solid var(--sg-border);
      border-left: 3px solid var(--sg-accent);
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 600;
    }

    html[data-smartschool-plus-plus="active"] .score-cell:hover {
      transform: none;
      box-shadow: none !important;
    }
    
    @media print {
      body * { visibility: hidden !important; }
      #report-content, #report-content * { visibility: visible !important; }
      #report-content { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
      .period_button { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  if (!document.getElementById("modal-background")) {
    $("body").append($("<div/>").attr("id", "modal-background"))
             .append($("<div/>").attr("id", "modal-content")
             .append($("<button/>").attr("id", "modal-close").text("Sluiten")).append(makeGrid()));
    $("#modal-background, #modal-close").click(() => { 
        $("#modal-content, #modal-background").removeClass("active");
        $(".custom-tooltip").remove(); 
    });
  }
}

function openGrid() { $("#modal-content, #modal-background").addClass("active"); }

// --- SNELTOETSEN ---
$(document).keydown(function(e) {
    if (e.keyCode === 27) { // ESC
        if ($("#modal-content").hasClass("active")) {
            $("#modal-content, #modal-background").removeClass("active");
            $(".report-overlay").remove();
        }
    }
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 71) { // CTRL + G
        e.preventDefault();
        openGrid();
    }
});