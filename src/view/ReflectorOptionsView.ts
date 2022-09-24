class ReflectorOptionsView {
  view: HTMLSelectElement;

  constructor() {
    let helper = new ViewHelper();
    // TODO don't hard code ABC
    this.view = helper.createSelectStringOptions(["A", "B", "C"]);
  }

  bindReflectorChanged(handler: (inputText: string) => void) {
    this.view.addEventListener("change", (event) => {
      // TODO validate this somewhere
      handler(this.view.value);
    });
  }

}
