const parts = document.querySelectorAll('p.so');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === 'getSource') {
        const opening_talk = getText('p6');
        const closing_song = Array.from(parts).pop();

        const living_as_christians = [];
        for (let i = 9; i < parts.length; i++) {
            if(living_as_christians.length > 0) {
                if(living_as_christians.reduce((n, {time}) => n + time, 0) == 15) {
                    break;
                }
            }
            const part = getFormatted(parts[i].id);
            living_as_christians.push({
                theme: part.label,
                time: part.time,
                speaker: ''
            });
        }

        const initial_call = getFormatted('p14');
        const return_visit = getFormatted('p15');

        const meeting = {
            date: getText('p1'),
            theme: getText('p2'),
            chairman: '',
            spiritual_gems: '',
            opening_song: getNumber('p3'),
            opening_talk: {
                speaker: '',
                theme: opening_talk.substring(0, opening_talk.indexOf(':'))
            },
            bible_reading: {
                reader: '',
                assignment: querySelector('p12', 'a.b')
            },
            initial_call: getStudentObject(initial_call),
            return_visit: getStudentObject(return_visit),
            middle_song: getNumber('p18'),
            living_as_christians,
            congregation_bible_study: {
                conductor: '',
                reader: ''
            },
            closing_song: getDigit(closing_song.textContent),
            closing_prayer: ''
        }

        const studyOrTalk = getFormatted('p16');
        const talk = /(.*)\s*\—\s*\w*\:\s*(.*)\s*$/g.exec(studyOrTalk.description);
        meeting[talk ? 'talk' : 'bible_study'] = talk ? {
            theme: talk[2].trim(),
            student: ''
        } : getStudentObject(studyOrTalk);

        sendResponse(meeting);
    }
});

function getStudentObject(part) {
    let object = {
        label: part.label
    }
    if(part.advice) {
        object['student'] = '';
        object['assistant'] = '';
    }
    return object;
}

function getFormatted(element) {
    const line = getText(element);
    const match = /^(.*)\:\s*\((\d*).*?\)\s*(?:|(?:(.*)\((.*)\)(?!.*\1)|.*$))$/g.exec(line);
    return {
        label: match[1],
        time: +match[2],
        description: match[3],
        advice: match[4]
    }
}

function querySelector(element, query) {
    return getElementById(element).querySelector(query).textContent
}

function getNumber(element) {
    return getDigit(getText(element))
}

function getText(element) {
    return getElementById(element).textContent
}

function getElementById(id) {
    return document.getElementById(id);
}

function getDigit(string) {
    return +string.replace(/\D/g, '')
}