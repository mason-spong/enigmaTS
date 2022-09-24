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
