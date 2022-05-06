const numEncipherableChars = 26;
enum Letters {
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,
}

// Helper function to ensure % does not produce negative numbers
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

class WireMap {
  map: Letters[];
  length: number;

  constructor(mapString: string) {
    if (!this.isValidMapString(mapString)) {
      throw new Error("invalid mapString given to WireMap!");
    }

    this.map = [];
    for (let i = 0; i < mapString.length; i++) {
      this.map.push(Letters[mapString[i] as keyof typeof Letters]);
    }
    this.length = this.map.length;
  }

  getAtIdx(idx: number): Letters {
    return this.map[idx];
  }

  indexOf(letter: Letters): Letters {
    return this.map.indexOf(letter);
  }

  private isValidMapString(mapString: string): boolean {
    let lettersKeys = Object.keys(Letters).filter((key) => isNaN(Number(key))); // Disregard reverse enum map num -> key
    if (mapString.length !== lettersKeys.length) {
      return false;
    }
    let seen = new Map<string, boolean>();
    for (let i = 0; i < mapString.length; i++) {
      let letter = mapString[i];
      if (!lettersKeys.includes(letter)) {
        return false;
      }
      if (seen.get(letter) === undefined) {
        seen.set(letter, true);
      } else {
        return false;
      }
    }
    return true;
  }
}

class ReflectorConfig {
  wireMapSeed: string;

  constructor(wireMapSeed: string) {
    this.wireMapSeed = wireMapSeed;
  }
}

class Reflector {
  wireMap: WireMap;

  constructor(reflectorConfig: ReflectorConfig) {
    let map = new WireMap(reflectorConfig.wireMapSeed);
    if (!this.isValidReflectorWireMap(map)) {
      throw new Error("Invalid wireMapSeed given to reflector!");
    }
    this.wireMap = map;
  }

  reflectorPass(absolutePosition: Letters): Letters {
    return this.wireMap.getAtIdx(absolutePosition);
  }

  private isValidReflectorWireMap(wireMap: WireMap): boolean {
    for (let i = 0; i < wireMap.length; i++) {
      let letterAtIdx = wireMap.getAtIdx(i) as number;
      if (
        i === letterAtIdx ||
        i !== (wireMap.getAtIdx(letterAtIdx) as number)
      ) {
        return false;
      }
    }
    return true;
  }
}

class RotorConfig {
  wireMapSeed: string;
  turnoverIdx: number;

  constructor(wireMapSeed: string, turnoverIdx: number) {
    this.wireMapSeed = wireMapSeed;
    this.turnoverIdx = turnoverIdx;
  }
}

class Rotor {
  wireMap: WireMap;
  turnoverIdx: number;
  ringSetting: number;
  rotorSetting: number;

  constructor(rotorConfig: RotorConfig) {
    this.wireMap = new WireMap(rotorConfig.wireMapSeed);
    this.turnoverIdx = rotorConfig.turnoverIdx;
    this.ringSetting = 0;
    this.rotorSetting = 0;
  }

  rotorForwardPass(absolutePosition: Letters): Letters {
    let relativePosition = mod(
      absolutePosition + this.rotorSetting - this.ringSetting,
      numEncipherableChars
    );
    let relativeOutput = this.wireMap.getAtIdx(relativePosition);
    let absoluteOutput = mod(
      relativeOutput - this.rotorSetting + this.ringSetting,
      numEncipherableChars
    );
    return absoluteOutput;
  }

  rotorBackwardPass(absolutePosition: Letters): Letters {
    let relativePosition = mod(
      absolutePosition + this.rotorSetting - this.ringSetting,
      numEncipherableChars
    ) as Letters;
    let relativeOutput = this.wireMap.indexOf(relativePosition);
    let absoluteOutput = mod(
      relativeOutput - this.rotorSetting + this.ringSetting,
      numEncipherableChars
    );
    return absoluteOutput;
  }
}

class PlugboardConfig {
  wireMapSeed: string;

  constructor(wireMapSeed: string) {
    this.wireMapSeed = wireMapSeed;
  }
}

class Plugboard {
  wireMap: WireMap;

  constructor(plugboardConfig: PlugboardConfig) {
    let map = new WireMap(plugboardConfig.wireMapSeed);
    if (!this.isValidPlugboardWireMap(map)) {
      throw new Error("Invalid WireMap given to Plugboard!");
    }
    this.wireMap = map;
  }

  plugboardPass(letter: Letters): Letters {
    return this.wireMap.getAtIdx(letter);
  }

  private isValidPlugboardWireMap(wireMap: WireMap): boolean {
    for (let i = 0; i < wireMap.length; i++) {
      let letterAtIdx = wireMap.getAtIdx(i) as number;
      if (
        i !== letterAtIdx &&
        i !== (wireMap.getAtIdx(letterAtIdx) as number)
      ) {
        return false;
      }
    }
    return true;
  }
}

class EnigmaModel {
  reflector: Reflector;
  rotors: Rotor[];
  plugboard: Plugboard;

  constructor(reflector: Reflector, rotors: Rotor[], plugboard: Plugboard) {
    if (rotors.length === 0) {
      throw new Error("0 rotors given to EnigmaModel!");
    }
    this.reflector = reflector;
    this.rotors = rotors;
    this.plugboard = plugboard;
  }

  pressKey(key: Letters): Letters {
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

  private calcNextRotorPos(rotor: Rotor): number {
    return (rotor.rotorSetting + 1) % rotor.wireMap.length;
  }

  private updateRotors() {
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
      if (
        this.rotors[i - 1].rotorSetting === this.rotors[i - 1].turnoverIdx &&
        rotated === false
      ) {
        this.rotors[i].rotorSetting = this.calcNextRotorPos(this.rotors[i]);
        this.rotors[i - 1].rotorSetting = this.calcNextRotorPos(
          this.rotors[i - 1]
        );
        rotated = true;
      } else {
        rotated = false;
      }
    }
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
