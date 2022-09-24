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
