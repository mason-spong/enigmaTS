class ViewHelper {
  createSelectStringOptions(options: string[]): HTMLSelectElement {
    console.log(options);
    let selectElement = this.createElement("select") as HTMLSelectElement;

    for (const option of options) {
      console.log(option);
      let optionElement = this.createElement("option") as HTMLOptionElement;
      optionElement.setAttribute("value", option);
      optionElement.textContent = option;
      selectElement.appendChild(optionElement);
    }
    return selectElement;
  }

  createSelectRangeOptions(
    startIdx: number,
    endIdx: number
  ): HTMLSelectElement {
    let selectElement = this.createElement("select") as HTMLSelectElement;

    for (let i = startIdx; i < endIdx; i++) {
      let optionElement = this.createElement("option") as HTMLOptionElement;
      optionElement.setAttribute("value", i.toString());
      optionElement.textContent = i.toString();
      selectElement.appendChild(optionElement);
    }
    return selectElement;
  }

  createElement(tag: string, className?: string): HTMLElement {
    const element = document.createElement(tag);
    if (typeof className !== "undefined") element.classList.add(className);
    return element;
  }

  getElement(selector: string): HTMLElement {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) return element;
    throw new Error("Could not find specified element");
  }
}
