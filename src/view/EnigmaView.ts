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
