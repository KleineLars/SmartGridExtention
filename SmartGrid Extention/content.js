function save_options() {
    chrome.storage.sync.set({
        theme: $('#theme').val(),
        colortb: $('#colortb').val(),
        colorbg: $('#colorbg').val() || '#FFFFFF',
        colorte: $('#colorte').val() || '#262626',
        colortt: $('#colortt').val() || '#FFFFFF'
    }, function () {
        let btn = $('#save');
        btn.text('Opgeslagen!').addClass('btn-success');
        setTimeout(() => btn.text('Instellingen Opslaan').removeClass('btn-success'), 2000);
        
        chrome.tabs.query({ url: "*://*.smartschool.be/*" }, function (tabs) {
            tabs.forEach(tab => chrome.tabs.reload(tab.id));
        });
    });
}

function send_fake_message() {
    chrome.storage.sync.get({ fakeMsgCount: 0 }, function(data) {
        chrome.storage.sync.set({ fakeMsgCount: data.fakeMsgCount + 1 });
    });
}

function reset_fake_messages() {
    chrome.storage.sync.set({ fakeMsgCount: 0 }, function() {
        chrome.tabs.query({ url: "*://*.smartschool.be/*" }, function (tabs) {
            tabs.forEach(tab => chrome.tabs.reload(tab.id));
        });
    });
}

function theme_change() {
    $('#theme').val() === 'custom' ? $('#colors').fadeIn(300) : $('#colors').fadeOut(200);
}

$(function () {
    chrome.storage.sync.get({ theme: 'light', colortb: '#ff6600' }, function (items) {
        $('#theme').val(items.theme);
        $('#colortb').val(items.colortb);
        if($.fn.minicolors) $('.color').minicolors({ theme: 'bootstrap' });
        theme_change();
    });

    $('#save').click(save_options);
    $('#theme').change(theme_change);
    $('#fake-msg').click(function() {
        send_fake_message();
        $(this).text("Verstuurd!");
        setTimeout(() => $(this).text("📩 +1 Fake Bericht"), 1000);
    });
    $('#reset-msg').click(reset_fake_messages);
});