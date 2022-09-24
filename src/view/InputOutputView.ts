class InputOutputView {
  view: HTMLElement;
  input: HTMLTextAreaElement;
  output: HTMLElement;

  constructor() {
    let helper = new ViewHelper();
    this.view = helper.createElement("div", "input-output-container");
    this.input = helper.createElement(
      "textarea",
      "io-textarea"
    ) as HTMLTextAreaElement;
    this.input.placeholder = "Input...";
    this.output = helper.createElement("div");
    this.output.innerHTML = "Output...";
    this.view.append(this.input, this.output);
  }

  bindInputChanged(handler: (inputText: string) => string) {
    this.input.addEventListener("input", (event) => {
      // TODO validate this somewhere
      this.output.innerHTML = handler(this.input.value);
    });
  }
}
