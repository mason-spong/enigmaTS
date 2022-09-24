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
