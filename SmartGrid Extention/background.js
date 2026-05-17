// Luister naar de klik op het extensie-icoontje
chrome.action.onClicked.addListener(() => {
  // Dit opent de pagina die in "options_ui" staat (in een nieuw tabblad)
  chrome.runtime.openOptionsPage();
});