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
            code.appendChild((new DOMParser().parseFromString('<span id="error">You must be in the meetings page</span>', 'text/html')).body);
        }
    });
}, false);

document.getElementById('empty').addEventListener('change', (e) => render(e.currentTarget.checked));

document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(code.innerText));

const render = (assignments) => {
    chrome.storage.local.get('meeting', (data) => {
        const { meeting } = data;
        const json = prettyPrintJson.toHtml(assignments ? meeting.map(formatMeeting) : meeting, {
            indent: 2,
            quoteKeys: true,
            trailingComma: false
        });
        (new DOMParser().parseFromString(`<div>${json}</div>`, 'text/html')).body.childNodes.forEach((node) => {
            code.replaceChildren(node);
        });
    });
};

function formatMeeting(meeting) {
    return {
        chairman: '',
        opening_talk: { ...meeting.opening_talk, speaker: '' },
        spiritual_gems: { ...meeting.spiritual_gems, conductor: '' },
        bible_reading: { ...meeting.bible_reading, reader: '' },
        apply_yourself_to_the_field_ministry: meeting.apply_yourself_to_the_field_ministry.map(p => ({
            ...p,
            assigned: '',
            assistant: p.lesson && !p.theme ? '' : undefined
        })),
        living_as_christians: meeting.living_as_christians.map(p => ({ ...p, speaker: '' })),
        congregation_bible_study: { ...meeting.congregation_bible_study, conductor: '', reader: '' },
        closing_prayer: ''
    };
}

window.addEventListener('unload', () => chrome.storage.local.remove('meeting'));