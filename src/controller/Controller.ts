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
