// Music control
const BASE_NOTE = 'C4'
const TIME_INTERVAL = 0.6
const NUM_NOTES = 5

// Background color transition breakpoints
const COLOR1 = [128, 128, 255]
const COLOR2 = [202, 120, 5]
const COLOR3 = [238, 41, 187]


// Used for calculations
const TONE_VALUE_MAP = {
    'C': 0,
    'C#': 1,
    'D': 2,
    'D#': 3,
    'E': 4,
    'F': 5,
    'F#': 6,
    'G': 7,
    'G#': 8,
    'A': 9,
    'A#': 10,
    'B': 11,
}
const STATE = {
    selects: [], // select elements used in determining notes
    notes: [],
    isPlaying: false,
    synth: new Tone.PolySynth().toDestination(),
}

window.addEventListener('load', main)

function main() {
    document.querySelector('#play').onclick = togglePlaying

    for (let i = 0; i < NUM_NOTES; i++) mkSelect(i)
}


/* UTILITY FUNCTIONS */

function noteToToneOctave(note) {
    const tone = note.match(/\D+/)[0].toUpperCase()
    const octave = +note.match(/\d+/)[0]

    return [tone, octave]
}


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function uniformRange(lo, hi, exclude) {
    const val =  Math.floor(Math.random() * (hi-lo) + lo + 0.5)

    // if should be excluded, try again
    if (exclude && exclude.includes(val)) return uniformRange(lo, hi, exclude)

    return val
}

function collectNotes() {
    let currNote = BASE_NOTE
    STATE.notes.push(currNote)
    STATE.selects.forEach(s => {
        const interval = FEELINGS[s.value]
        currNote = shiftNote(currNote, interval)
        STATE.notes.push(currNote)
    })
}


/* MANIPULATION FUNCTIONS */

function valToColor(val) {
    let c1, c2
    if (val <= 4) {
        c1 = COLOR1
        c2 = COLOR2
    }
    else if (val <= 8) {
        c1 = COLOR2
        c2 = COLOR3
    }
    else {
        c1 = COLOR3
        c2 = COLOR1
    }

    x = (val % 4) / 4
    y = 1-x

    const c = c1
        .map((v, idx) => Math.round(x*v + y*c2[idx]))
        .join(',')

    return `rgb(${c})`
}

function shiftNote(note, amt) {
    const [tone, octave] = noteToToneOctave(note)

    let newVal = TONE_VALUE_MAP[tone] + amt
    const newOctave = octave + Math.floor(newVal / 12)
    while (newVal < 0) newVal += 12
    newVal %= 12

    const newNote = Object.keys(TONE_VALUE_MAP).find(k => TONE_VALUE_MAP[k] == newVal)

    return `${newNote}${newOctave}`
}


/* PROGRAM FUNCTIONS */

function mkSelect(idx) {
    const select = document.createElement('select')
    select.id = `option-${idx}`
    STATE.selects.push(select)

    const div = document.createElement('div')
    document.querySelector('#selects').appendChild(div)
    div.appendChild(select)


    Object.keys(FEELINGS).forEach(f => {
        const option = document.createElement('option')
        option.value = f
        const interval = FEELINGS[f]
        option.textContent = `(${interval > 0 ? '+' : ''}${interval}) ${f}`
        select.appendChild(option)
    })

    const intervals = Object.values(FEELINGS)
    const interval = uniformRange(Math.min(...intervals), Math.max(...intervals), [0])
    select.value = Object.keys(FEELINGS).find(f => FEELINGS[f] == interval)
}

function togglePlaying() {
    STATE.isPlaying = !STATE.isPlaying
    if (STATE.isPlaying) {
        play()
        document.querySelector('h1').style.animation = `rotation ${TIME_INTERVAL}s infinite linear`
        document.querySelector('#play').textContent = 'Stop'
    }
    else {
        // clear notes
        while (STATE.notes.length > 0) STATE.notes.pop()

        document.querySelector('#play').textContent = 'Play'
        document.querySelector('h1').style.animation = ''
    }
}

async function play() {

    // make notes
    if (STATE.notes.length == 0) {
        collectNotes()
    }

    const note = STATE.notes.shift()
    console.log(STATE.notes)
    console.log(note)
    const [tone, _] = noteToToneOctave(note)
    
    // change background
    document.querySelector('body').style.backgroundColor = valToColor(TONE_VALUE_MAP[tone])

    // play
    STATE.synth.triggerAttack(note, Tone.now())
    await timeout(TIME_INTERVAL*1000)
    STATE.synth.triggerRelease(note, Tone.now())

    if (STATE.isPlaying) play()
}
