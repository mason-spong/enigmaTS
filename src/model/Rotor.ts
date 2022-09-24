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
  lockRotorSetting: number;

  constructor(rotorConfig: RotorConfig) {
    this.wireMap = new WireMap(rotorConfig.wireMapSeed);
    this.turnoverIdx = rotorConfig.turnoverIdx;
    this.ringSetting = 0;
    this.rotorSetting = 0;
    this.lockRotorSetting = this.rotorSetting;
  }

  resetRotorSettings() {
    this.rotorSetting = this.lockRotorSetting;
  }

  setRingSetting(ringSetting: number) {
    this.ringSetting = ringSetting; 
  }

  setRotorPosition(rotorSetting: number) {
    this.rotorSetting = rotorSetting;
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
