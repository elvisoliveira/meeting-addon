import { prettyPrintJson } from 'pretty-print-json';

const show = document.querySelector('[name="show"]');
['form', 'code', 'copy'].map(id => window[id] = document.getElementById(id));

show.addEventListener('change', (e) => render(e.currentTarget.checked));

chrome.storage.local.get('show', (data) => {
    show.checked = data.show;
});

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
                chrome.tabs.sendMessage(tab.id, {
                    action: 'getSource'
                }, meeting => chrome.storage.local.set({ meeting }, () => render(show.checked)));
            });
        } else {
            code.appendChild((new DOMParser().parseFromString('<span id="error">You must be in the meetings page</span>', 'text/html')).body);
        }
        form.style.display = tabs.length ? 'block' : 'none';
    });
}, false);

copy.addEventListener('click', () => {
    navigator.clipboard.writeText(code.innerText).then(() => {
        copy.textContent = "Done!";
        setTimeout(() => {
            copy.textContent = "Copy";
        }, '1000');
    });
});

const render = (checked) => {
    chrome.storage.local.set({
        'show': checked
    });
    chrome.storage.local.get('meeting', (data) => {
        const { meeting } = data;
        const json = prettyPrintJson.toHtml(checked ? meeting.map(formatMeeting) : meeting, {
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
        week: meeting.week,
        label: meeting.label,
        theme: meeting.theme,
        chairman: '',
        opening_song: meeting.opening_song,
        opening_talk: { ...meeting.opening_talk, speaker: '' },
        spiritual_gems: { ...meeting.spiritual_gems, conductor: '' },
        bible_reading: { ...meeting.bible_reading, reader: '' },
        apply_yourself_to_the_field_ministry: meeting.apply_yourself_to_the_field_ministry.map(p => ({
            ...p,
            assigned: '',
            assistant: p.lesson && !p.theme ? '' : undefined
        })),
        middle_song: meeting.middle_song,
        living_as_christians: meeting.living_as_christians.map(p => ({ ...p, speaker: '' })),
        congregation_bible_study: { ...meeting.congregation_bible_study, conductor: '', reader: '' },
        closing_song: meeting.closing_song,
        closing_prayer: ''
    };
}

window.addEventListener('unload', () => chrome.storage.local.remove('meeting'));