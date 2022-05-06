enum ReflectorTypes {
  A,
  B,
  C,
}

enum RotorTypes {
  I,
  II,
  III,
  IV,
  V,
}

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

// Helper function to ensure % behavior of negative numbers
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

class Reflector {
  type: ReflectorTypes;
  wireMap: WireMap;

  constructor(type: ReflectorTypes) {
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

  reflectorPass(absolutePosition: Letters): Letters {
    return this.wireMap.getAtIdx(absolutePosition);
  }
}

class Rotor {
  type: RotorTypes;
  wireMap: WireMap;
  turnoverIdx: number;
  ringSetting: number;
  rotorSetting: number;

  constructor(type: RotorTypes) {
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

class Plugboard {
  wireMap: WireMap;

  constructor(wireMap: WireMap) {
    if (!this.isValidPlugboardWireMap(wireMap)) {
      throw new Error("Invalid WireMap given to Plugboard!");
    }
    this.wireMap = wireMap;
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

let reflector = new Reflector(ReflectorTypes.A);
let rotors = [
  new Rotor(RotorTypes.I),
  new Rotor(RotorTypes.II),
  new Rotor(RotorTypes.III),
];
let plugboard = new Plugboard(new WireMap("ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
let enigmaModel = new EnigmaModel(reflector, rotors, plugboard);
