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
