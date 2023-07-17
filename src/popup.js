import { prettyPrintJson } from 'pretty-print-json';

window.addEventListener("load", () => {
    const elem = document.getElementById('code');
    chrome.tabs.query({
        url: 'https://wol.jw.org/*/wol/meetings/*',
        active: true
    }, (tabs) => {
        if(tabs.length > 0) {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, { action: "getSource" }, (response) => {
                    elem.innerHTML = prettyPrintJson.toHtml(response, {
                        indent: 2
                    });
                });
            });
        } else {
            document.body.innerHTML = 'You must be in the meetings page'
        }
    });
}, false);