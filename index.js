const app = document.getElementById("app");

const rootTree = h("div", { id: "root" }, ["Hello world"]);
let root = VirtualNodeToDom(rootTree);
app.appendChild(root);
