import { prettyPrintJson } from 'pretty-print-json';

const code = document.getElementById('code');

window.addEventListener('load', () => {
    chrome.tabs.query({
        url: [
            'https://wol.jw.org/*/wol/meetings/*',
            'https://elvisoliveira.github.io/jwpub/'
        ],
        active: true
    }, (tabs) => {
        if(tabs.length > 0) {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: 'getSource' }, meeting => chrome.storage.local.set({ meeting }, () => render(false)));
            });
        } else {
            code.innerHTML = '<span id="error">You must be in the meetings page</span>';
        }
    });
}, false);

document.getElementById('empty').addEventListener('change', (e) => render(e.currentTarget.checked));

const render = (assignments) => {
    chrome.storage.local.get('meeting', (data) => {
        const { meeting } = data;
        // @TODO: Improve this kludge
        if(assignments) {
            for (let i = 0; i < meeting.length; i++) {
                meeting[i] = Object.assign({ chairman: '' }, meeting[i], { closing_prayer: '' });
                meeting[i].opening_talk.speaker = '';
                meeting[i].spiritual_gems.conductor = '';
                meeting[i].bible_reading.reader = '';
                meeting[i].congregation_bible_study.conductor = '';
                meeting[i].congregation_bible_study.reader = '';
                meeting[i].apply_yourself_to_the_field_ministry.forEach((p, ii) => {
                    meeting[i].apply_yourself_to_the_field_ministry[ii].assigned = '';
                    if(!p.theme) {
                        meeting[i].apply_yourself_to_the_field_ministry[ii].assistant = '';
                    }
                });
                meeting[i].living_as_christians.forEach((p, ii) => {
                    meeting[i].living_as_christians[ii].speaker = '';
                });
            }
        }
        code.innerHTML = prettyPrintJson.toHtml(meeting, {
            indent: 2,
            quoteKeys: true,
            trailingComma: false
        });
    });
};

window.addEventListener('unload', () => chrome.storage.local.remove('meeting'));