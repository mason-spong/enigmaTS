class PlugboardConfig {
  wireMapSeed: string;

  constructor(wireMapSeed: string) {
    this.wireMapSeed = wireMapSeed;
  }
}

class Plugboard {
  wireMap: WireMap;
  currentSelection: Letters | null;

  constructor(plugboardConfig: PlugboardConfig) {
    this.currentSelection = null;
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
