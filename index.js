const app = document.getElementById("app");

let count = 0;


let rootTree = h("div", { id: "root" }, [
    {tag: "button", props: {onClick: handleClick}, children: ["Click"]},
    {tag: "h3", props: {}, children: [count]}
]);

let root = VirtualNodeToDom(rootTree);
app.appendChild(root);


function handleClick() {
    count++;
const newTree = h("div", { id: "root" }, [
    {tag: "button", props: {onClick: handleClick2}, children: ["Click"]},
    {tag: "h3", props: {}, children: [count]}
]);

    const patches = diff(rootTree, newTree);
    root = apply_patches(patches, root)
    rootTree = newTree;
}

function handleClick2() {
    count+=2;
const newTree = h("div", { id: "root" }, [
    {tag: "button", props: {onClick: handleClick2}, children: ["Click"]},
    {tag: "h3", props: {}, children: [count]}
]);

    const patches = diff(rootTree, newTree);
    root = apply_patches(patches, root)
    rootTree = newTree;
}