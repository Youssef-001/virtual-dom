# Virtual DOM from Scratch

A small virtual DOM implementation written in vanilla JavaScript to explore how UI trees become DOM nodes and how updates can change existing nodes. Includes an interactive counter and a separate page for manual patch experiments.

## Run locally

Open `index.html` in a modern browser, or serve the project folder with a local server such as VS Code Live Server. No dependencies, installation, or build step are required.

Click the **Click** button to increment the counter. Each click creates a new virtual tree, compares it with the previous tree, applies the resulting patches to the DOM, and saves the new tree for the next update.

## Features

- `h(tag, props, children)` creates virtual nodes as plain JavaScript objects.
- `VirtualNodeToDom(tree)` renders nested elements, text, and numeric children into DOM nodes.
- `diff(oldTree, newTree)` recursively compares trees and produces patches with child-index paths.
- `apply_patches(patches, root)` applies text, replacement, addition, removal, and prop patches to the rendered DOM and returns the current root reference.
- Function-valued event props such as `onClick` and `onMouseEnter` register DOM listeners. Changing a handler detaches the old function and attaches the new one; removing an event prop or setting it to `null` detaches the old listener.
- The counter demonstrates state changes and repeated rendering without rebuilding the entire DOM tree.

## Example

Load `vdom.js` before your application script, then create and mount a tree:

```js
function handleClick() {
  console.log("Clicked!");
}

let oldTree = h("div", { id: "example" }, [
  h("button", { onClick: handleClick }, ["Click"]),
  h("p", {}, ["Before"]),
]);

let root = VirtualNodeToDom(oldTree);
document.getElementById("app").appendChild(root);

const newTree = h("div", { id: "example" }, [
  h("button", { onClick: handleClick }, ["Click"]),
  h("p", {}, ["After"]),
]);

const patches = diff(oldTree, newTree);
root = apply_patches(patches, root);
oldTree = newTree;
```

The paragraph's text changes while the existing button stays in place. Event prop names use an `on` prefix; for example, `onMouseEnter` maps to the browser's `mouseenter` event.

## Files

| File | Purpose |
| --- | --- |
| `vdom.js` | Virtual node creation, rendering, diffing, patching, and event handling |
| `index.js` | Counter state and update logic |
| `index.html` | Counter demo page |
| `tests.js` | Sample trees and a manual patch scenario |
| `tests.html` | Page for running the manual scenario |

## Manual testing

Open `tests.html` and the browser's developer console. In `tests.js`, change the `oldTree` and `newTree` assignments to select a pair of sample trees, then reload the page. The console shows the generated patches; inspect the rendered DOM to check the result.

These are manual examples, not an automated test suite. The page also contains a static button and heading outside the rendered test tree.

## Inspiration

Built as a learning exercise based on [Build Your Own Virtual DOM](https://resumax.ai/projects/virtual-dom-from-scratch).
