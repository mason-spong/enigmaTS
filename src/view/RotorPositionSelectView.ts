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
