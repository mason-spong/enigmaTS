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
