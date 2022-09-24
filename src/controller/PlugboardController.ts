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
