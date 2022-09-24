class AlphaOrthoKeyboardView {
  view: HTMLElement;
  keys: Map<string, HTMLElement>;
  

  constructor() {
    let helper = new ViewHelper();
    this.view = helper.createElement("div", "key-container");
    this.keys = new Map();
    let charSet = "QWERTYUIOPASDFGHJKLZXCVBNM";
    for (let i = 0; i < charSet.length; i++) {
      let key = helper.createElement("div", "key");
      key.textContent = charSet[i];
      this.view.append(key);
      this.keys.set(charSet[i], key);
      if (charSet[i] === "L") {
        this.view.append(helper.createElement("div"));
      }
    }
  }

  setColor(key: string, color: string) {
    let keyElement = this.keys.get(key);
    if (keyElement !== undefined) {
      keyElement.style.backgroundColor = color;
    }
  }


  bindKeyboardClicked(handler: (key: string) => void) {
    for (let [key, value] of this.keys) {
      value.addEventListener("click", (event) => {
        if (event.target instanceof Element) {
          handler(key);
          console.log(event.target.innerHTML);
        }
      });
    }
  }
}
