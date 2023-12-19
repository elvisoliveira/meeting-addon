const ref = [
    {
        icon: 'dc-icon--gem',
        descr: 'Treasures from God’s Word',
        acronym: 'tgw'
    }, {
        icon: 'dc-icon--wheat',
        descr: 'Apply Yourself to the Field Ministry',
        acronym: 'ayf'
    }, {
        icon: 'dc-icon--sheep',
        descr: 'Living as Christians',
        acronym: 'lac'
    }
];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === 'getSource') {
        const meetings = [];

        document.querySelectorAll('div.pub-mwb:not(:has(> div#f1))').forEach((meeting, i) => {
            const data = {
                date: getText(meeting, '[data-pid="1"]'),
                theme: getText(meeting, '[data-pid="2"]'),
                songs: []
            };

            Array.from(meeting.querySelectorAll('.dc-icon--music a')).forEach((song) => {
                data.songs.push(getDigit(song.textContent));
            });

            let section = null;
            Array.from(meeting.querySelector('div.bodyTxt').querySelectorAll('div, h3')).forEach((item) => {
                item.classList.forEach((name) => {
                    if(ref.map((e) => e.icon).includes(name)) {
                        section = ref[ref.findIndex(e => e.icon === name)].acronym;
                        data[section] = [];
                    }
                });

                if(section && item.tagName === 'H3' && (/^\d+\./).test(item.textContent)) {
                    const info = item.nextElementSibling.textContent.match(/\(([^()]*)\)/g);
                    const title = item.textContent.match(/^(\d+)\.(.*)/);
                    data[section].push({
                        title: title.at(2).trim(),
                        number: getDigit(title.at(1)),
                        time: getDigit(info.shift())
                    });
                }
            });

            meetings.push({
                date: data.date,
                theme: data.theme,
                chairman: '',
                opening_song: data.songs[0],
                opening_talk: {
                    speaker: '',
                    theme: data.tgw[0].title
                },
                spiritual_gems: '',
                bible_reading: {
                    number: 3,
                    reader: ''
                },
                apply_yourself_to_the_field_ministry: data.ayf.map(elem => ({
                    ...elem,
                    speaker: '',
                    assigned: '',
                    assistant: ''
                })),
                middle_song: data.songs[1],
                living_as_christians: data.lac.map(elem => ({ ...elem, speaker: '' })).slice(0, -1),
                congregation_bible_study: {
                    reader: '',
                    conductor: ''
                },
                closing_song: data.songs[2],
                closing_prayer: ''
            });
        });

        sendResponse(meetings);
    }
});

function querySelector(base, element, query) {
    return getElement(base, element).querySelector(query).textContent
}

function getNumber(base, element) {
    return getDigit(getText(base, element))
}

function getText(base, element) {
    return getElement(base, element).textContent
}

function getElement(base, id) {
    return (base || document).querySelector(id);
}

function getDigit(string) {
    return +string.replace(/\D/g, '')
}
