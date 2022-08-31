const TIME_INTERVAL = 0.75
const NUM_SELECTS = 5

window.addEventListener('load', main)

const SEMITONE_MAP = {
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

const BASE_NOTE = 'C3'
const SELECTS = []

function mkSelect(idx) {
    const select = document.createElement('select')
    select.id = `option-${idx}`
    SELECTS.push(select)

    const div = document.createElement('div')
    document.querySelector('main').appendChild(div)
    div.appendChild(select)


    Object.keys(FEELINGS).forEach(f => {
        const option = document.createElement('option')
        option.value = f
        const interval = FEELINGS[f]
        option.textContent = `(${interval > 0 ? '+' : ''}${interval}) ${f}`
        select.appendChild(option)
    })

    select.value = Object.keys(FEELINGS).find(f => FEELINGS[f] == 0)
}

function shiftNote(noteWithOctave, amt) {
    const note = noteWithOctave.match(/\D+/)[0].toUpperCase()
    const octave = +noteWithOctave.match(/\d+/)[0]

    let newVal = SEMITONE_MAP[note] + amt
    const newOctave = octave + Math.floor(newVal / 12)
    while (newVal < 0) newVal += 12

    const newNote = Object.keys(SEMITONE_MAP).find(k => SEMITONE_MAP[k] == newVal)

    return `${newNote}${newOctave}`
}

function main() {
    const btn = document.querySelector('#play')
    for (let i = 0; i < NUM_SELECTS; i++) mkSelect(i)

    btn.onclick = play
}

function play() {
    const synth = new Tone.PolySynth().toDestination();
    const now = Tone.now()

    //create a synth and connect it to the main output (your speakers)
    const notes = [BASE_NOTE]
    let currNote = BASE_NOTE
    SELECTS.forEach(s => {
        const interval = FEELINGS[s.value]
        currNote = shiftNote(currNote, interval)
        notes.push(currNote)
        
    })


    notes.forEach((note, idx) => {
        synth.triggerAttack(note, now + idx*TIME_INTERVAL)
        synth.triggerRelease(note, now + (idx+1)*TIME_INTERVAL)
    })
    console.log('played?')
}
