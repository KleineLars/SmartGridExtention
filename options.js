let countInterval = null;

function showStatus(message) {
    const statusEl = $('#status-message');
    statusEl.text(message).fadeIn();
    setTimeout(() => statusEl.fadeOut(), 3000);
}

$(function () {
    // Navigatie
    $('.nav-item').click(function() {
        $('.nav-item').removeClass('active');
        $(this).addClass('active');
        $('.page').removeClass('active');
        $('#' + $(this).data('target')).addClass('active');
    });

    $('#go-home').click(function() {
        $('.nav-item').removeClass('active');
        $('.page').removeClass('active');
        $('#page-home').addClass('active');
    });

    // Inladen
    chrome.storage.sync.get({ theme: 'light', colortb: '#ff6600' }, function (items) {
        $('#theme').val(items.theme);
        $('#colortb').val(items.colortb);
        if($.fn.minicolors) $('.color').minicolors({ theme: 'bootstrap' });
        if(items.theme === 'custom') $('#colors').show();
    });

    // OPSLAAN LOGICA
    $('#save').click(function() {
        const selectedTheme = $('#theme').val();
        const customColor = $('#colortb').val();
        let settings = { theme: selectedTheme, colortb: customColor };

        if (selectedTheme === 'custom') {
            // FIX: Alleen topbar kleur, rest blijft wit
            settings.colorbg = '#FFFFFF';
            settings.colorte = '#262626';
            settings.colortt = '#FFFFFF';
        } else {
            // Automatische stand gebaseerd op browser
            const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDarkMode) {
                settings.colorbg = '#0a0a0a';
                settings.colorte = '#ffffff';
                settings.colortb = '#3b82f6';
                settings.colortt = '#ffffff';
            } else {
                settings.colorbg = '#FFFFFF';
                settings.colorte = '#262626';
                settings.colortb = '#ff6600';
                settings.colortt = '#FFFFFF';
            }
        }

        chrome.storage.sync.set(settings, function () {
            showStatus('✅ Instellingen opgeslagen!');
            chrome.tabs.query({ url: "*://*.smartschool.be/*" }, tabs => {
                tabs.forEach(tab => chrome.tabs.reload(tab.id));
            });
        });
    });

    $('#theme').change(() => $('#theme').val() === 'custom' ? $('#colors').fadeIn() : $('#colors').fadeOut());

    // Fake messages
    $('#fake-msg').click(function() {
        if (countInterval) clearInterval(countInterval);
        const max = parseInt($('#max-msgs').val()) || 10;
        showStatus('🚀 Gestart...');
        countInterval = setInterval(() => {
            chrome.storage.sync.get({ fakeMsgCount: 0 }, function(data) {
                if (data.fakeMsgCount < max) {
                    chrome.storage.sync.set({ fakeMsgCount: data.fakeMsgCount + 1 });
                } else {
                    clearInterval(countInterval);
                }
            });
        }, 3000);
    });

    $('#reset-msg').click(() => {
        if (countInterval) clearInterval(countInterval);
        chrome.storage.sync.set({ fakeMsgCount: 0 }, () => showStatus('🗑️ Gereset'));
    });
});