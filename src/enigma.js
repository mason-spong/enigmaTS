"use strict";
var ReflectorTypes;
(function (ReflectorTypes) {
    ReflectorTypes[ReflectorTypes["A"] = 0] = "A";
    ReflectorTypes[ReflectorTypes["B"] = 1] = "B";
    ReflectorTypes[ReflectorTypes["C"] = 2] = "C";
})(ReflectorTypes || (ReflectorTypes = {}));
var RotorTypes;
(function (RotorTypes) {
    RotorTypes[RotorTypes["I"] = 0] = "I";
    RotorTypes[RotorTypes["II"] = 1] = "II";
    RotorTypes[RotorTypes["III"] = 2] = "III";
    RotorTypes[RotorTypes["IV"] = 3] = "IV";
    RotorTypes[RotorTypes["V"] = 4] = "V";
})(RotorTypes || (RotorTypes = {}));
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
// Helper function to ensure % behavior of negative numbers
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
class Reflector {
    constructor(type) {
        this.type = type;
        switch (this.type) {
            case ReflectorTypes.A: {
                this.wireMap = new WireMap("EJMZALYXVBWFCRQUONTSPIKHGD");
                break;
            }
            case ReflectorTypes.B: {
                this.wireMap = new WireMap("YRUHQSLDPXNGOKMIEBFZCWVJAT");
                break;
            }
            case ReflectorTypes.C: {
                this.wireMap = new WireMap("FVPJIAOYEDRZXWGCTKUQSBNMHL");
                break;
            }
            default: {
                throw new Error("Invalid ReflectorType given");
            }
        }
    }
    reflectorPass(absolutePosition) {
        return this.wireMap.getAtIdx(absolutePosition);
    }
}
class Rotor {
    constructor(type) {
        this.type = type;
        this.ringSetting = 0;
        this.rotorSetting = 0;
        switch (this.type) {
            case RotorTypes.I: {
                this.wireMap = new WireMap("EKMFLGDQVZNTOWYHXUSPAIBRCJ");
                this.turnoverIdx = 16;
                break;
            }
            case RotorTypes.II: {
                this.wireMap = new WireMap("AJDKSIRUXBLHWTMCQGZNPYFVOE");
                this.turnoverIdx = 4;
                break;
            }
            case RotorTypes.III: {
                this.wireMap = new WireMap("BDFHJLCPRTXVZNYEIWGAKMUSQO");
                this.turnoverIdx = 21;
                break;
            }
            case RotorTypes.IV: {
                this.wireMap = new WireMap("ESOVPZJAYQUIRHXLNFTGKDCMWB");
                this.turnoverIdx = 9;
                break;
            }
            case RotorTypes.V: {
                this.wireMap = new WireMap("VZBRGITYUPSDNHLXAWMJQOFECK");
                this.turnoverIdx = 25;
                break;
            }
            default: {
                throw new Error("Invalid RotorType given");
            }
        }
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
class Plugboard {
    constructor(wireMap) {
        if (!this.isValidPlugboardWireMap(wireMap)) {
            throw new Error("Invalid WireMap given to Plugboard!");
        }
        this.wireMap = wireMap;
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
let reflector = new Reflector(ReflectorTypes.A);
let rotors = [
    new Rotor(RotorTypes.I),
    new Rotor(RotorTypes.II),
    new Rotor(RotorTypes.III),
];
let plugboard = new Plugboard(new WireMap("ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
let enigmaModel = new EnigmaModel(reflector, rotors, plugboard);
