class RotorTypeSelectView {
  view: HTMLSelectElement;
  rotorNumber: number;

  constructor(rotorNumber: number) {
    let helper = new ViewHelper();
    this.view = helper.createSelectStringOptions([
      "I",
      "II",
      "III",
      "IV",
      "V",
    ]);
    this.view.classList.add("rotor-select");
    this.rotorNumber = rotorNumber;
  }

  bindTypeSelectChanged(handler: (inputText: string, rotorNumber: number) => void) {
    this.view.addEventListener("change", (event) => {
      handler(this.view.value, this.rotorNumber);
    });
  }
}
