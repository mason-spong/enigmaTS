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

  swap(letter1: Letters, letter2: Letters) {
    [this.map[letter1], this.map[letter2]] = [this.map[letter2], this.map[letter1]]
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
