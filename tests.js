const out = h("div", { id: "greeting" }, [
  {
    tag: "span",
    props: {},
    children: ["test"],
  },
  {
    tag: "span",
    props: {},
    children: ["Hello world", " test"],
  },
]);

const tree1 = h("div", {}, [
  { tag: "span", props: {}, children: [] },
  { tag: "p", props: {}, children: [] },
]);

const tree2 = h("div", {}, [
  { tag: "span", props: {}, children: [] },
  { tag: "p", props: {}, children: [] },
  { tag: "div", props: {}, children: [] },
]);

const tree3 = h("div", {}, [
  { tag: "span", props: {}, children: ["Test"] },
  { tag: "span", props: {}, children: ["Hello", "test"] },
]);

const tree4 = h("div", {}, [
  { tag: "span", props: {}, children: ["Test"] },
  { tag: "span", props: {}, children: ["Hii", "test"] },
]);

const tree5 = h("div", {}, [
  { tag: "span", props: {}, children: ["Test"] },
  { tag: "span", props: {}, children: ["Hello", "/test"] },
]);

const tree6 = h("div", {}, [
  { tag: "span", props: {}, children: ["Hello", "/test"] },
]);

const tree7 = h("span", {}, [
  { tag: "span", props: { id: "heading1", ref: "test" }, children: ["span 1"] },
  { tag: "button", props: { onMouseEnter: handleMouseHover}, children: [" span 2"] },
]);

const tree8 = h("span", { }, [
  { tag: "span", props: { id: "heading2", class: "S1" }, children: [" span 3"] },
  { tag: "button", props: {onClick: handleClick, }, children: ["span 1"] },
  // {tag: "button", props: {onClick: handleClick}, children: ["click me"]}
]);

function handleClick()
{
  console.log("Clicked!");
}
function handleMouseHover()
{
  console.log("Entered!");
}

// Change these two trees to try a different patch scenario.
const oldTree = tree7;
const newTree = tree8;
const testContainer = document.getElementById("app");
let testRoot = VirtualNodeToDom(oldTree);
testContainer.appendChild(testRoot);

const testPatches = diff(oldTree, newTree);
console.log("Patches:", testPatches);
testRoot = apply_patches(testPatches, testRoot);
