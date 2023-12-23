const icon = (n) => `dc-icon--${n}`;
const sections = [
    'gem', // Treasures from God’s Word
    'wheat', // Apply Yourself to the Field Ministry
    'sheep' // Living as Christians
].reduce((previous, section) => ({ ...previous, [section]: icon(section)}), {});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === 'getSource') {
        const meetings = [];

        document.querySelectorAll('div.pub-mwb:not(:has(> div#f1))').forEach((meeting) => {
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
                    if(Object.values(sections).includes(name)) {
                        section = Object.keys(sections).find(k => sections[k] === name);
                        data[section] = [];
                    }
                });

                if(section && item.tagName === 'H3' && (/^\d+\./).test(item.textContent)) {
                    /* ^\(                < matches ( on the beginning of the string
                     *     ([^()]*)       < capturing group 1, everything but [ and ]
                     * \)                 < matches )
                     * \s*                < matches 0 or more whitespaces
                     * ([^]*)             < capturing group 2, rest of the string
                     */
                    const info = item.nextElementSibling.textContent.trim().match(/^\(([^()]*)\)\s*([^]*)/); // next element contains descr
                    const title = item.textContent.match(/^(\d+)\.(.*)/); // set part number apart
                    const number = getDigit(title[1]);
                    const entry = {
                        time: getDigit(info[1]),
                        title: title[2].trim(),
                        number
                    };
                    if(info[2]) {
                        const description = info[2].trim();
                        /* ([^]*)\(            < capturing group 1, everything untill (
                         * ((?:lmd|th).*)      < capturing group 2, everything starting with lmd or th
                         * \)$                 < matches ) right before the end of line
                         */
                        const hasLesson = description.match(/([^]*)\(((?:lmd|th).*)\)$/);
                        if(hasLesson) {
                            entry.lesson = hasLesson[2].trim();
                            if(number === 3) { // number 3 is always bible reading, add assignment
                                entry.assignment = hasLesson[1].trim();
                            } else {
                                const isTalk = hasLesson[1].trim().match(/\—(?:[^]*)\:(.*)$/);
                                if(isTalk) {
                                    entry.theme = isTalk[1].trim();
                                }
                            }
                        }
                    }

                    data[section].push(entry);
                }
            });

            meetings.push({
                date: data.date,
                theme: data.theme,
                opening_song: data.songs[0],
                opening_talk: data.gem[0],
                spiritual_gems: data.gem[1],
                bible_reading: data.gem[2],
                apply_yourself_to_the_field_ministry: data.wheat,
                middle_song: data.songs[1],
                living_as_christians: data.sheep.slice(0, -1),
                congregation_bible_study: data.sheep[data.sheep.length - 1],
                closing_song: data.songs[2]
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