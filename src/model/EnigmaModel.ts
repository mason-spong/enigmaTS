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

  changeReflector(reflector: Reflector) {
    this.reflector = reflector;
  }

  changeRotor(rotor: Rotor, rotorIdx: number) {
    const oldRotorRing = this.rotors[rotorIdx].ringSetting;
    const oldRotorPosition = this.rotors[rotorIdx].rotorSetting;
    this.rotors[rotorIdx] = rotor; 
    
  }

  changeRotorRing(ringSetting: number, rotorIdx: number) {
    this.rotors[rotorIdx].setRingSetting(ringSetting);  
  }

  changeRotorPosition(positionSetting: number, rotorIdx: number) {
    this.rotors[rotorIdx].setPositionSetting(positionSetting);
  }

  resetSettings() {
    for (const rotor of this.rotors) {
      rotor.resetRotorSettings();
    }
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
