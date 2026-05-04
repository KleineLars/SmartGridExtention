const sidebar_selector = ".sidebar-results>:first-child";

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

function showReport(periodName, data_source) {
    $(".report-overlay").remove(); 
    let reportWindow = $("<div id='report-content'/>").addClass("report-overlay");
    
    reportWindow.append($("<div/>").addClass("report-header").append(
        $("<h1/>").text("SmartGrid Voortgangsrapport").css("color", "#FF520E"),
        $("<p/>").text(periodName + " | Datum: " + new Date().toLocaleDateString())
    ));

    let table = $("<table/>").addClass("report-table");
    table.append("<thead><tr><th style='text-align:left; border-bottom:2px solid #ddd; padding:10px;'>Vak</th><th style='text-align:right; border-bottom:2px solid #ddd; padding:10px;'>Gemiddelde</th></tr></thead>");
    
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
            let scoreStyle = p < 0.5 ? "color: #ef4444;" : "color: #1e293b;";
            
            let row = $("<tr/>").append(
                $("<td style='padding:10px; border-bottom:1px solid #eee;'>").text(course_name),
                $("<td style='padding:10px; border-bottom:1px solid #eee; text-align:right; font-weight:bold; " + scoreStyle + "'>").text(percentageText)
            );
            tbody.append(row);
        }
    }

    if (grand_d > 0) {
        let grand_p = grand_n / grand_d;
        let grand_text = Math.round(grand_p * 1000) / 10 + "%";
        let grand_style = grand_p < 0.5 ? "color: #ef4444;" : "color: #1e293b;";
        
        let footerRow = $("<tr/>").css("background", "#f8fafc").append(
            $("<td style='padding:12px; font-weight:800; border-top:2px solid #cbd5e1;'>").text("Totaal"),
            $("<td style='padding:12px; text-align:right; font-weight:800; border-top:2px solid #cbd5e1; " + grand_style + "'>").text(grand_text)
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
    #modal-content { background: white; border-radius: 20px; display: none; padding: 25px; position: fixed; z-index: 9999; left: 5%; top: 5%; width: 90%; height: 85%; font-family: 'Segoe UI', sans-serif; box-shadow: 0 20px 50px rgba(0,0,0,0.2); overflow: hidden; }
    #modal-content.active, #modal-background.active { display: block; }
    #content-container { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    #period-container { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; position: relative; }
    .period-wrapper-inner { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; transition: all 0.25s ease; }
    
    .report-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 100000; overflow-y: auto; padding: 50px; font-family: 'Segoe UI', sans-serif; }
    .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    
    .swipe-exit { opacity: 0; transform: translateX(-20px); pointer-events: none; }
    .swipe-enter { opacity: 0; transform: translateX(20px); }
    .swipe-enter-active { opacity: 1; transform: translateX(0); }
    .stats-container { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-shrink: 0; }
    .total-badge { background: #1e293b; color: white; padding: 8px 15px; border-radius: 10px; font-weight: 800; }
    .quote-box { font-style: italic; color: #64748b; font-size: 14px; border-left: 3px solid #FF520E; padding-left: 10px; min-height: 20px; }
    .table-scroll-container { flex: 1; overflow: auto; border: 1.5px solid #cbd5e1; border-radius: 8px; background: #fff; min-height: 0; }
    #result-table { width: 100%; border-collapse: separate; border-spacing: 8px; min-width: 1000px; }
    #result-table td { padding: 10px; text-align: center; font-size: 13.5px; height: 45px; border-radius: 8px; transition: all 0.15s ease; }
    .score-cell { cursor: pointer; position: relative; }
    .score-cell:hover { transform: translateY(-2px) scale(1.05); z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important; }
    .course-name-cell { width: 220px; text-align: left !important; font-weight: 700; background: #f8fafc !important; position: sticky; left: 0; z-index: 10; border-right: 2px solid #cbd5e1 !important; border-radius: 0 !important; }
    .total-cell { width: 85px; font-weight: 800; background: #f1f5f9 !important; position: sticky; right: 0; z-index: 10; border-left: 2px solid #cbd5e1 !important; border-radius: 0 !important; }
    .period-nav { height: 55px; display: flex; gap: 10px; overflow-x: auto; align-items: center; margin-bottom: 10px; flex-shrink: 0; }
    .period_button { background: #f1f5f9; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s ease; }
    .period_button:hover:not(.active) { background: #e2e8f0; transform: translateY(-2px); }
    .period_button.active { background: #FF520E; color: white; box-shadow: 0 4px 12px rgba(255, 82, 14, 0.3); }
    #modal-close { position: absolute; top: 15px; right: 15px; background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; z-index: 100; transition: background 0.2s; }
    .glow-red { background-color: #fee2e2 !important; color: #991b1b !important; }
    .glow-yellow { background-color: #fef9c3 !important; color: #854d0e !important; }
    .glow-green { background-color: #dcfce7 !important; color: #166534 !important; }
    .glow-red-text { color: #ef4444 !important; font-weight: 800; }
    .glow-yellow-text { color: #d97706 !important; font-weight: 800; }
    .glow-green-text { color: #16a34a !important; font-weight: 800; }
    .custom-tooltip { position: absolute; z-index: 99999; background: #1e293b; color: white; padding: 10px 15px; border-radius: 8px; font-size: 13px; font-weight: 600; pointer-events: none; box-shadow: 0 10px 25px rgba(0,0,0,0.3); max-width: 300px; line-height: 1.4; border: 1px solid rgba(255,255,255,0.2); }
    
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
