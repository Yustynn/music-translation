const TIME_INTERVAL = 0.6
const NUM_SELECTS = 5

window.addEventListener('load', main)

const TONE_VALUE_MAP = {
    'A': 0,
    'A#': 1,
    'B': 2,
    'C': 3,
    'C#': 4,
    'D': 5,
    'D#': 6,
    'E': 7,
    'F': 8,
    'F#': 9,
    'G': 10,
    'G#': 11,
}

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

const COLOR1 = [128, 128, 255]
const COLOR2 = [202, 120, 5]
const COLOR3 = [238, 41, 187]

const BASE_NOTE = 'C3'
const SELECTS = []

function uniformRange(lo, hi, exclude) {
    const val =  Math.floor(Math.random() * (hi-lo) + lo + 0.5)

    // if should be excluded, try again
    if (exclude && exclude.includes(val)) return uniformRange(lo, hi, exclude)

    return val
}

function mkSelect(idx) {
    const select = document.createElement('select')
    select.id = `option-${idx}`
    SELECTS.push(select)

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

function noteToToneOctave(note) {
    const tone = note.match(/\D+/)[0].toUpperCase()
    const octave = +note.match(/\d+/)[0]

    return [tone, octave]
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

function main() {
    const btn = document.querySelector('#play')
    for (let i = 0; i < NUM_SELECTS; i++) mkSelect(i)

    btn.onclick = play
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function play() {
    // start animation
    document.querySelector('h1').style.animation = `rotation ${TIME_INTERVAL}s infinite linear`

    const synth = new Tone.PolySynth().toDestination();

    // make notes
    const notes = [BASE_NOTE]
    let currNote = BASE_NOTE
    SELECTS.forEach(s => {
        const interval = FEELINGS[s.value]
        currNote = shiftNote(currNote, interval)
        notes.push(currNote)
    })
    
    // play notes, change background
    for (let i = 0; i < notes.length; i++) {

        const note = notes[i]
        const [tone, _] = noteToToneOctave(note)
        
        // change background
        document.querySelector('body').style.backgroundColor = valToColor(TONE_VALUE_MAP[tone])

        // play
        synth.triggerAttack(note, Tone.now())
        await timeout(TIME_INTERVAL*1000)
        synth.triggerRelease(note, Tone.now())
    }

    play()
}
