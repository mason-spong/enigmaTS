"use strict";
const numEncipherableChars = 26;
var Letters;
(function (Letters) {
    Letters[Letters["A"] = 0] = "A";
    Letters[Letters["B"] = 1] = "B";
    Letters[Letters["C"] = 2] = "C";
    Letters[Letters["D"] = 3] = "D";
    Letters[Letters["E"] = 4] = "E";
    Letters[Letters["F"] = 5] = "F";
    Letters[Letters["G"] = 6] = "G";
    Letters[Letters["H"] = 7] = "H";
    Letters[Letters["I"] = 8] = "I";
    Letters[Letters["J"] = 9] = "J";
    Letters[Letters["K"] = 10] = "K";
    Letters[Letters["L"] = 11] = "L";
    Letters[Letters["M"] = 12] = "M";
    Letters[Letters["N"] = 13] = "N";
    Letters[Letters["O"] = 14] = "O";
    Letters[Letters["P"] = 15] = "P";
    Letters[Letters["Q"] = 16] = "Q";
    Letters[Letters["R"] = 17] = "R";
    Letters[Letters["S"] = 18] = "S";
    Letters[Letters["T"] = 19] = "T";
    Letters[Letters["U"] = 20] = "U";
    Letters[Letters["V"] = 21] = "V";
    Letters[Letters["W"] = 22] = "W";
    Letters[Letters["X"] = 23] = "X";
    Letters[Letters["Y"] = 24] = "Y";
    Letters[Letters["Z"] = 25] = "Z";
})(Letters || (Letters = {}));
// Helper function to ensure % does not produce negative numbers
function mod(n, m) {
    return ((n % m) + m) % m;
}
class WireMap {
    constructor(mapString) {
        if (!this.isValidMapString(mapString)) {
            throw new Error("invalid mapString given to WireMap!");
        }
        this.map = [];
        for (let i = 0; i < mapString.length; i++) {
            this.map.push(Letters[mapString[i]]);
        }
        this.length = this.map.length;
    }
    getAtIdx(idx) {
        return this.map[idx];
    }
    indexOf(letter) {
        return this.map.indexOf(letter);
    }
    isValidMapString(mapString) {
        let lettersKeys = Object.keys(Letters).filter((key) => isNaN(Number(key))); // Disregard reverse enum map num -> key
        if (mapString.length !== lettersKeys.length) {
            return false;
        }
        let seen = new Map();
        for (let i = 0; i < mapString.length; i++) {
            let letter = mapString[i];
            if (!lettersKeys.includes(letter)) {
                return false;
            }
            if (seen.get(letter) === undefined) {
                seen.set(letter, true);
            }
            else {
                return false;
            }
        }
        return true;
    }
}
class ReflectorConfig {
    constructor(wireMapSeed) {
        this.wireMapSeed = wireMapSeed;
    }
}
class Reflector {
    constructor(reflectorConfig) {
        let map = new WireMap(reflectorConfig.wireMapSeed);
        if (!this.isValidReflectorWireMap(map)) {
            throw new Error("Invalid wireMapSeed given to reflector!");
        }
        this.wireMap = map;
    }
    reflectorPass(absolutePosition) {
        return this.wireMap.getAtIdx(absolutePosition);
    }
    isValidReflectorWireMap(wireMap) {
        for (let i = 0; i < wireMap.length; i++) {
            let letterAtIdx = wireMap.getAtIdx(i);
            if (i === letterAtIdx ||
                i !== wireMap.getAtIdx(letterAtIdx)) {
                return false;
            }
        }
        return true;
    }
}
class RotorConfig {
    constructor(wireMapSeed, turnoverIdx) {
        this.wireMapSeed = wireMapSeed;
        this.turnoverIdx = turnoverIdx;
    }
}
class Rotor {
    constructor(rotorConfig) {
        this.wireMap = new WireMap(rotorConfig.wireMapSeed);
        this.turnoverIdx = rotorConfig.turnoverIdx;
        this.ringSetting = 0;
        this.rotorSetting = 0;
    }
    rotorForwardPass(absolutePosition) {
        let relativePosition = mod(absolutePosition + this.rotorSetting - this.ringSetting, numEncipherableChars);
        let relativeOutput = this.wireMap.getAtIdx(relativePosition);
        let absoluteOutput = mod(relativeOutput - this.rotorSetting + this.ringSetting, numEncipherableChars);
        return absoluteOutput;
    }
    rotorBackwardPass(absolutePosition) {
        let relativePosition = mod(absolutePosition + this.rotorSetting - this.ringSetting, numEncipherableChars);
        let relativeOutput = this.wireMap.indexOf(relativePosition);
        let absoluteOutput = mod(relativeOutput - this.rotorSetting + this.ringSetting, numEncipherableChars);
        return absoluteOutput;
    }
}
class PlugboardConfig {
    constructor(wireMapSeed) {
        this.wireMapSeed = wireMapSeed;
    }
}
class Plugboard {
    constructor(plugboardConfig) {
        let map = new WireMap(plugboardConfig.wireMapSeed);
        if (!this.isValidPlugboardWireMap(map)) {
            throw new Error("Invalid WireMap given to Plugboard!");
        }
        this.wireMap = map;
    }
    plugboardPass(letter) {
        return this.wireMap.getAtIdx(letter);
    }
    isValidPlugboardWireMap(wireMap) {
        for (let i = 0; i < wireMap.length; i++) {
            let letterAtIdx = wireMap.getAtIdx(i);
            if (i !== letterAtIdx &&
                i !== wireMap.getAtIdx(letterAtIdx)) {
                return false;
            }
        }
        return true;
    }
}
class EnigmaModel {
    constructor(reflector, rotors, plugboard) {
        if (rotors.length === 0) {
            throw new Error("0 rotors given to EnigmaModel!");
        }
        this.reflector = reflector;
        this.rotors = rotors;
        this.plugboard = plugboard;
    }
    pressKey(key) {
        // Rotate rotors
        this.updateRotors();
        // Pass signal through plugboard
        key = this.plugboard.plugboardPass(key);
        // Pass signal through all rotors
        for (let i = 0; i < this.rotors.length; i++) {
            key = this.rotors[i].rotorForwardPass(key);
        }
        // Reflect signal through reflector
        key = this.reflector.reflectorPass(key);
        // Pass signal through all rotors in reverse order
        for (let i = this.rotors.length - 1; i >= 0; i--) {
            key = this.rotors[i].rotorBackwardPass(key);
        }
        // Pass signal through plugboard
        key = this.plugboard.plugboardPass(key);
        return key;
    }
    calcNextRotorPos(rotor) {
        return (rotor.rotorSetting + 1) % rotor.wireMap.length;
    }
    updateRotors() {
        // Always update 0th Rotor
        this.rotors[0].rotorSetting = this.calcNextRotorPos(this.rotors[0]);
        if (this.rotors.length === 1) {
            return;
        }
        // Used to let next rotor in loop know if previous rotor rotated
        let rotated = false;
        if (this.rotors[0].rotorSetting === this.rotors[0].turnoverIdx + 1) {
            // Rotor 0 passed turnover index, rotate rotor 1
            this.rotors[1].rotorSetting = this.calcNextRotorPos(this.rotors[1]);
            rotated = true;
        }
        // Loop to rotate idx 2 Rotor through rest of Rotors
        for (let i = 2; i < this.rotors.length; i++) {
            if (this.rotors[i - 1].rotorSetting === this.rotors[i - 1].turnoverIdx &&
                rotated === false) {
                this.rotors[i].rotorSetting = this.calcNextRotorPos(this.rotors[i]);
                this.rotors[i - 1].rotorSetting = this.calcNextRotorPos(this.rotors[i - 1]);
                rotated = true;
            }
            else {
                rotated = false;
            }
        }
    }
}
class ViewHelper {
    createSelectStringOptions(options) {
        console.log(options);
        let selectElement = this.createElement("select");
        for (const option of options) {
            console.log(option);
            let optionElement = this.createElement("option");
            optionElement.setAttribute("value", option);
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        }
        return selectElement;
    }
    createSelectRangeOptions(startIdx, endIdx) {
        let selectElement = this.createElement("select");
        for (let i = startIdx; i < endIdx; i++) {
            let optionElement = this.createElement("option");
            optionElement.setAttribute("value", i.toString());
            optionElement.textContent = i.toString();
            selectElement.appendChild(optionElement);
        }
        return selectElement;
    }
    createElement(tag, className) {
        const element = document.createElement(tag);
        if (typeof className !== 'undefined')
            element.classList.add(className);
        return element;
    }
    getElement(selector) {
        const element = document.querySelector(selector);
        if (element)
            return element;
        throw new Error("Could not find specified element");
    }
}
class AlphaOrthoKeyboardView {
    constructor() {
        let helper = new ViewHelper();
        this.view = helper.createElement("div", "key-container");
        let charSet = "QWERTYUIOPASDFGHJKLZXCVBNM";
        for (let i = 0; i < charSet.length; i++) {
            let key = helper.createElement("div", "key");
            key.textContent = charSet[i];
            this.view.append(key);
            if (charSet[i] === "L") {
                this.view.append(helper.createElement("div"));
            }
        }
    }
}
class RotorOptionsView {
    constructor() {
        let helper = new ViewHelper();
        this.container = helper.createElement("div");
        this.container.classList.add("rotor-options-container");
        this.typeSelect = helper.createSelectStringOptions(["I", "II", "III", "IV", "V"]);
        this.typeSelect.classList.add("rotor-select");
        this.ringSelect = helper.createSelectRangeOptions(1, 27);
        this.ringSelect.classList.add("rotor-select");
        this.positionSelect = helper.createSelectRangeOptions(1, 27);
        this.positionSelect.classList.add("rotor-select");
        this.container.append(this.typeSelect, this.ringSelect, this.positionSelect);
    }
}
class View {
    constructor() {
        let helper = new ViewHelper();
        this.app = helper.getElement("#root");
        this.title = helper.createElement('h1');
        this.title.textContent = "enigma machine";
        this.reflectorSelect = helper.createSelectStringOptions(["A", "B", "C"]);
        this.rotorOptionsView = helper.createElement("div", "rotor-options-holder");
        this.plugboardView = new AlphaOrthoKeyboardView().view;
        for (let i = 0; i < 3; i++) {
            let view = new RotorOptionsView();
            this.rotorOptionsView.append(view.container);
        }
        this.app.append(this.title, this.reflectorSelect, this.rotorOptionsView, this.plugboardView);
    }
}
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }
}
const reflectorA = new ReflectorConfig("EJMZALYXVBWFCRQUONTSPIKHGD");
const reflectorB = new ReflectorConfig("YRUHQSLDPXNGOKMIEBFZCWVJAT");
const reflectorC = new ReflectorConfig("FVPJIAOYEDRZXWGCTKUQSBNMHL");
const rotorI = new RotorConfig("EKMFLGDQVZNTOWYHXUSPAIBRCJ", 16);
const rotorII = new RotorConfig("AJDKSIRUXBLHWTMCQGZNPYFVOE", 4);
const rotorIII = new RotorConfig("BDFHJLCPRTXVZNYEIWGAKMUSQO", 21);
const rotorIV = new RotorConfig("ESOVPZJAYQUIRHXLNFTGKDCMWB", 9);
const rotorV = new RotorConfig("VZBRGITYUPSDNHLXAWMJQOFECK", 25);
const emptyPlugboard = new PlugboardConfig("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
let reflector = new Reflector(reflectorA);
let rotors = [new Rotor(rotorI), new Rotor(rotorII), new Rotor(rotorIII)];
let plugboard = new Plugboard(emptyPlugboard);
let enigmaModel = new EnigmaModel(reflector, rotors, plugboard);
let app = new Controller(enigmaModel, new View());
