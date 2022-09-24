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

function lettersToChar(letter: Letters): string {
  // Disregard reverse enum map num -> key
  // TODO: Cach lettersKeys
  let lettersKeys = Object.keys(Letters).filter((key) => isNaN(Number(key))); 
  return lettersKeys[letter];
}

function charToLetters(char: string): Letters {
  return Letters[char.toUpperCase() as keyof typeof Letters];
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

class ViewHelper {
  createSelectStringOptions(options: string[]): HTMLSelectElement {
    console.log(options);
    let selectElement = this.createElement("select") as HTMLSelectElement;

    for (const option of options) {
      console.log(option);
      let optionElement = this.createElement("option") as HTMLOptionElement;
      optionElement.setAttribute("value", option);
      optionElement.textContent = option;
      selectElement.appendChild(optionElement);
    }
    return selectElement;
  }

  createSelectRangeOptions(
    startIdx: number,
    endIdx: number
  ): HTMLSelectElement {
    let selectElement = this.createElement("select") as HTMLSelectElement;

    for (let i = startIdx; i < endIdx; i++) {
      let optionElement = this.createElement("option") as HTMLOptionElement;
      optionElement.setAttribute("value", i.toString());
      optionElement.textContent = i.toString();
      selectElement.appendChild(optionElement);
    }
    return selectElement;
  }

  createElement(tag: string, className?: string): HTMLElement {
    const element = document.createElement(tag);
    if (typeof className !== "undefined") element.classList.add(className);
    return element;
  }

  getElement(selector: string): HTMLElement {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) return element;
    throw new Error("Could not find specified element");
  }
}

class InputOutputView {
  view: HTMLElement;
  input: HTMLTextAreaElement;
  output: HTMLElement;

  constructor() {
    let helper = new ViewHelper();
    this.view = helper.createElement("div", "input-output-container");
    this.input = helper.createElement(
      "textarea",
      "io-textarea"
    ) as HTMLTextAreaElement;
    this.input.placeholder = "Input...";
    this.output = helper.createElement("div");
    this.output.innerHTML = "Output...";
    this.view.append(this.input, this.output);
  }

  bindInputChanged(handler: (inputText: string) => string) {
    this.input.addEventListener("input", (event) => {
      // TODO validate this somewhere
      this.output.innerHTML = handler(this.input.value);
    });
  }
}

class AlphaOrthoKeyboardView {
  view: HTMLElement;
  keys: Map<string, HTMLElement>;
  

  constructor() {
    let helper = new ViewHelper();
    this.view = helper.createElement("div", "key-container");
    this.keys = new Map();
    let charSet = "QWERTYUIOPASDFGHJKLZXCVBNM";
    for (let i = 0; i < charSet.length; i++) {
      let key = helper.createElement("div", "key");
      key.textContent = charSet[i];
      this.view.append(key);
      this.keys.set(charSet[i], key);
      if (charSet[i] === "L") {
        this.view.append(helper.createElement("div"));
      }
    }
  }

  setColor(key: string, color: string) {
    let keyElement = this.keys.get(key);
    if (keyElement !== undefined) {
      keyElement.style.backgroundColor = color;
    }
  }


  bindKeyboardClicked(handler: (key: string) => void) {
    for (let [key, value] of this.keys) {
      value.addEventListener("click", (event) => {
        if (event.target instanceof Element) {
          handler(key);
          console.log(event.target.innerHTML);
        }
      });
    }
  }
}

class RotorTypeSelectView {
  view: HTMLSelectElement;
  rotorNumber: number;

  constructor(rotorNumber: number) {
    let helper = new ViewHelper();
    this.view = helper.createSelectStringOptions([
      "I",
      "II",
      "III",
      "IV",
      "V",
    ]);
    this.view.classList.add("rotor-select");
    this.rotorNumber = rotorNumber;
  }

  bindTypeSelectChanged(handler: (inputText: string, rotorNumber: number) => void) {
    this.view.addEventListener("change", (event) => {
      handler(this.view.value, this.rotorNumber);
    });
  }
}

class RotorRingSelectView {
  view: HTMLSelectElement;
  rotorNumber: number;

  constructor(rotorNumber: number) {
    let helper = new ViewHelper();
    this.ringSelect = helper.createSelectRangeOptions(1, 27);
    this.ringSelect.classList.add("rotor-select");
    this.rotorNumber: rotorNumber;

  }

  bindRingSelectChanged(handler: (inputText: string, rotorNumber: number) => void) {
    this.view.addEventListener("change", (event) => {
      handler(this.view.value, this.rotorNumber);
    });
  }
}

class RotorPositionSelectView {
  view: HTMLSelectElement;
  rotorNumber: number;

  constructor(rotorNumber: number) {
    let helper = new ViewHelper();
    this.positionSelect = helper.createSelectRangeOptions(1, 27);
    this.positionSelect.classList.add("rotor-select");
    this.rotorNumber = rotorNumber;

  }

  bindPositionSelectChanged(handler: (inputText: string, rotorNumber: number) => void) {
    this.view.addEventListener("change", (event) => {
      handler(this.view.value, this.rotorNumber);
    });
  }
}

class RotorOptionsView {
  view: HTMLElement;
  typeSelectView: RotorTypeSelectView();
  ringSelectView: RotorRingSelectView();
  positionSelectView: RotorPositionSelectView();
  rotorNumber: number

  constructor(rotorNumber: number) {
    let helper = new ViewHelper();
    this.view = helper.createElement("div");
    this.view.classList.add("rotor-options-container");
    this.typeSelect = new RotorTypeSelectView();
    this.ringSelect = new RotorRingSelectView();
    this.positionSelect = new RotorPositionSelectView();
    this.view.append(
      this.typeSelect,
      this.ringSelect,
      this.positionSelect
    );
    this.rotorNumber = rotorNumber;
  }
  
  bindRotorChanged(handler: (inputText: string, rotorNumber: number) => void) {
    this.view.addEventListener("change", (event) => {
      handler(this.view.value, this.rotorNumber);
    });
  }
}

class ReflectorOptionsView {
  view: HTMLSelectElement;

  constructor() {
    let helper = new ViewHelper();
    // TODO don't hard code ABC
    this.view = helper.createSelectStringOptions(["A", "B", "C"]);
  }

  bindReflectorChanged(handler: (inputText: string) => void) {
    this.view.addEventListener("change", (event) => {
      // TODO validate this somewhere
      handler(this.view.value);
    });
  }

}

class EnigmaOptionsView {
  reflectorOptionsView: ReflectorOptionsView;
  rotorOptionsViews: RotorOptionsView[];
  rotorOptionsHolder: HTMLElement;
  view: HTMLElement;

  constructor() {
    let helper = new ViewHelper();
    this.rotorOptionsHolder = helper.createElement(
      "div",
      "rotor-options-holder"
    );
    this.view = helper.createElement("div", "enigma-options-holder");
    this.reflectorOptionsView = new ReflectorOptionsView();
    this.rotorOptionsViews = [];
    for (let i = 0; i < 3; i++) {
      let view = new RotorOptionsView(i);
      this.rotorOptionsHolder.append(view.container);
      this.rotorOptionsViews.push(view);
    }
    this.view.append(this.reflectorOptionsView.view, this.rotorOptionsHolder);
  }
}

class EnigmaView {
  app: HTMLElement;
  title: HTMLElement;
  enigmaOptionsView: EnigmaOptionsView;
  plugboardView: AlphaOrthoKeyboardView;
  ioView: InputOutputView;

  constructor() {
    let helper = new ViewHelper();
    this.app = helper.getElement("#root");

    this.title = helper.createElement("h1");
    this.title.textContent = "enigma machine";
    this.enigmaOptionsView = new EnigmaOptionsView();
    this.plugboardView = new AlphaOrthoKeyboardView();
    this.ioView = new InputOutputView();

    this.app.append(
      this.title,
      this.enigmaOptionsView.view,
      this.plugboardView.view,
      this.ioView.view
    );
  }
}

class PlugboardController {
  model: EnigmaModel;
  view: AlphaOrthoKeyboardView;
  plugboardColors = [
    "#332288",
    "#117733",
    "#44AA99",
    "#88CCEE",
    "#DDCC77",
    "#CC6677",
    "#AA4499",
    "#882255",
    "#648FFF",
    "#785EF0",
    "#DC267F",
    "#FE6100",
    "#FFB000",
  ];
  colorIdx = 0;
  // Hard coding colors is probably bad
  backgroundColor = "#b05b00";
  
  constructor(model: EnigmaModel, view: AlphaOrthoKeyboardView) {
    this.model = model;
    this.view = view;
    this.view.bindKeyboardClicked(this.handleKeyClicked);
      
  }

  handleKeyClicked  = (keyClicked: string): Letters => {
    let letter = charToLetters(keyClicked);
    console.log(this);
    console.log(this.model);
    if (this.model.plugboard.currentSelection !== null) {
      // This is second click
      console.log("second click")
      if (this.model.plugboard.wireMap.getAtIdx(letter) === letter) {
        // The clicked key has not been swapped
        if (this.model.plugboard.wireMap.getAtIdx(letter) === this.model.plugboard.currentSelection) {
          // The second clicked key is the same as the first clicked key
          this.model.plugboard.currentSelection = null;
          this.view.setColor(lettersToChar(letter), this.backgroundColor);
        } else {
          // The second clicked key is different than the first clicked key
          this.model.plugboard.wireMap.swap(this.model.plugboard.currentSelection, letter);
          this.view.setColor(lettersToChar(letter), this.plugboardColors[this.colorIdx]);
          this.colorIdx = (this.colorIdx + 1) % this.plugboardColors.length
          this.model.plugboard.currentSelection = null;
        }
      }
    } else {
      // This is the first click
      console.log("first click");
      if (this.model.plugboard.wireMap.getAtIdx(letter) !== letter) {
        // the clicked key has been swapped
        this.view.setColor(lettersToChar(letter), this.backgroundColor);
        this.view.setColor(lettersToChar(this.model.plugboard.wireMap.getAtIdx(letter)), this.backgroundColor)
        this.model.plugboard.wireMap.swap(letter, this.model.plugboard.wireMap.getAtIdx(letter));
      } else {
        // the clicked key has not been swapped
        this.model.plugboard.currentSelection = letter;
        this.view.setColor(lettersToChar(letter), this.plugboardColors[this.colorIdx]);
      }
    }

    return Letters.A;
  }
}

class InputOutputController {
  model: EnigmaModel;
  view: InputOutputView;
  lettersKeys: string[];

  constructor(model: EnigmaModel, view: InputOutputView) {
    this.model = model;
    this.view = view;
    this.view.bindInputChanged(this.handleInputChanged);
    this.lettersKeys = Object.keys(Letters).filter((key) => isNaN(Number(key)));
  }

  handleInputChanged = (inputText: string): string => {
    this.model.resetSettings();
    let output: string[] = [];

    for (let i = 0; i < inputText.length; i++) {
      let char = inputText[i];
      if (this.lettersKeys.includes(char.toUpperCase())) {
        char = lettersToChar(
          this.model.pressKey(charToLetters(char))
        );
      }
      output.push(char);
    }
    return output.join("");
  };
}

class ReflectorOptionsController {
  model: EnigmaModel;
  view: ReflectorOptionsView;
  reflectors = {
    A: new Reflector(new ReflectorConfig("EJMZALYXVBWFCRQUONTSPIKHGD")),
    B: new Reflector(new ReflectorConfig("YRUHQSLDPXNGOKMIEBFZCWVJAT")),
    C: new Reflector(new ReflectorConfig("FVPJIAOYEDRZXWGCTKUQSBNMHL"))
  }

  constructor(model: EnigmaModel, view: ReflectorOptionsView) {
    this.model = model;
    this.view = view;
    this.view.bindReflectorChanged(this.handleReflectorChanged);
  }

  handleReflectorChanged = (selectionChar: string): void => {
    if (Object.keys(this.reflectors).includes(selectionChar)) {
      this.model.changeReflector(this.reflectors[selectionChar as keyof typeof this.reflectors]);
    }
    
  }
}

class RotorOptionsController {
  model: EnigmaModel;
  view: RotorOptionsView;
  rotors = {
    I: new Rotor(new RotorConfig("EKMFLGDQVZNTOWYHXUSPAIBRCJ", 16)),
    II: new Rotor(new RotorConfig("AJDKSIRUXBLHWTMCQGZNPYFVOE", 4)),
    III: new Rotor(new RotorConfig("BDFHJLCPRTXVZNYEIWGAKMUSQO", 21)),
    IV: new Rotor(new RotorConfig("ESOVPZJAYQUIRHXLNFTGKDCMWB", 9)),
    V: new Rotor(new RotorConfig("VZBRGITYUPSDNHLXAWMJQOFECK", 25))
  }
  ringPosMin = 1;
  ringPosMax = 27;


  constructor(model: EnigmaModel, view: RotorOptionsView) {
    this.model = model;
    this.view = view;
    this.view.typeSelectView.bindTypeSelectChanged(this.handleTypeSelectChanged);
    this.view.ringSelectView.bindRingSelectChanged(this.handleRingSelectChanged);
    this.view.positionSelectView.bindPositionSelectChanged(this.handlePositionSelectChanged);
  }

  handleTypeSelectChanged = (selectionChar: string, rotorNumber: number): void => {
    if (Object.keys(this.rotors).includes(selectionChar)) {
      this.model.changeRotor(this.rotors[selectionChar as keyof typeof this.rotors], rotorNumber);
      
    }
  }

  handleRingSelectChanged = (selectionChar: string, rotorNumber: number): void => {
    const selectionNum = +selectionChar;
    if (selectionNum >= this.ringPosMin || selectionNum < this.ringPosMax) {
      
    }
  }

  handlePositionSelectChanged = (selectionChar: string, rotorNUmber: number): void => {

  }
}

class Controller {
  model: EnigmaModel;
  view: EnigmaView;
  inputOutputController: InputOutputController;
  plugboardController: PlugboardController;
  reflectorOptionsController: ReflectorOptionsController;
  rotorOptionsController: RotorOptionsController;

  constructor(model: EnigmaModel, view: EnigmaView) {
    this.model = model;
    this.view = view;
    this.plugboardController = new PlugboardController(this.model, this.view.plugboardView);
    this.inputOutputController = new InputOutputController(
      this.model,
      this.view.ioView
    );
    this.reflectorOptionsController = new ReflectorOptionsController(this.model, this.view.enigmaOptionsView.reflectorOptionsView);
    this.rotorOptionsController = new RotorOptionsController(this.model, this.view.enigmaOptionsView.rotorOptionsView);


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

let app = new Controller(enigmaModel, new EnigmaView());
