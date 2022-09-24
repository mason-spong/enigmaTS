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
