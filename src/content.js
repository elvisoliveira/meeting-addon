const icon = (n) => `dc-icon--${n}`;
const sections = [
    {
        icon: icon('gem'),
        descr: 'Treasures from God’s Word',
        acronym: 'tfgw'
    }, {
        icon: icon('wheat'),
        descr: 'Apply Yourself to the Field Ministry',
        acronym: 'ayttfm'
    }, {
        icon: icon('sheep'),
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

            Array.from(meeting.querySelectorAll(`.${icon('music')} a`)).forEach((song) => {
                data.songs.push(getDigit(song.textContent));
            });

            let section = null;
            Array.from(meeting.querySelector('div.bodyTxt').querySelectorAll('div, h3')).forEach((item) => {
                item.classList.forEach((name) => {
                    if(sections.map((e) => e.icon).includes(name)) {
                        section = sections[sections.findIndex(e => e.icon === name)].acronym;
                        data[section] = [];
                    }
                });

                if(section && item.tagName === 'H3' && (/^\d+\./).test(item.textContent)) {
                    const info = item.nextElementSibling.textContent.match(/\(([^()]*)\)/g); // Next element contains descr
                    const title = item.textContent.match(/^(\d+)\.(.*)/); // Set part number apart
                    data[section].push({
                        time: getDigit(info.at(0)),
                        title: title.at(2).trim(),
                        number: getDigit(title.at(1))
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
                    theme: data.tfgw[0].title
                },
                spiritual_gems: '',
                bible_reading: {
                    reader: '',
                    assignment: '' // @TODO: Parse
                },
                apply_yourself_to_the_field_ministry: data.ayttfm.map(elem => ({
                    ...elem,
                    // @TODO: Figure out if it is a talk
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

function getText(base, element) {
    return getElement(base, element).textContent
}

function getElement(base, id) {
    return (base || document).querySelector(id);
}

function getDigit(string) {
    return +string.replace(/\D/g, '')
}