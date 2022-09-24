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
