function h(tag, props, children) {
  let object = {};

  object["tag"] = tag;
  object["props"] = props;
  object["children"] = [];

  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === "object") {
      let newObject = h(
        children[i].tag,
        children[i].props,
        children[i].children,
      );
      object["children"].push(newObject);
    } else {
      object["children"].push(children[i]);
    }
  }

  return object;
}

function VirtualNodeToDom(virtualNode) {
  let element = document.createElement(virtualNode["tag"]);
  for (const [key, value] of Object.entries(virtualNode["props"])) {
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element[key] = value;
    }
  }

  virtualNode.children.forEach((child) => {
    if (typeof child === "object") {
      let newVNode = VirtualNodeToDom(child);
      element.appendChild(newVNode);
    } else {
      let textNode = document.createTextNode(child);
      element.appendChild(textNode);
    }
  });

  return element;
}

let patchTypes = {
  TEXT: "TEXT",
  REPLACE: "REPLACE",
  REMOVE: "REMOVE",
  ADD: "ADD",
  PROPS: "PROPS",
};

function props_diff(old_props, new_props, path) {
  let patches = [];
  let remove_props = {};
  let set_props = {};

  for (const [key, value] of Object.entries(new_props)) {
    if (Object.hasOwn(old_props, key)) {
      if (old_props[key] != new_props[key]) {
        set_props[key] = value;
      }
    } else {
      set_props[key] = value;
    }
  }

  for (const [key, value] of Object.entries(old_props)) {
    if (!Object.hasOwn(new_props, key)) {
      remove_props[key] = value;
    }
  }

  if (
    Object.keys(set_props).length !== 0 ||
    Object.keys(remove_props).length !== 0
  ) {
    return {
      type: patchTypes.PROPS,
      path: [...path],
      set: set_props,
      remove: remove_props,
    };
  } else return undefined;
}

function diff(oldTree, newTree, current_path = [], patches = []) {
  if (oldTree === undefined && newTree !== undefined) {
    patches.push({ type: patchTypes.ADD, path: [0], value: newTree });
  } else if (oldTree !== undefined && newTree === undefined) {
    patches.push({ type: patchTypes.REMOVE, path: [0], value: undefined });
  }

  if (oldTree.tag !== newTree.tag) {
    patches.push({
      type: patchTypes.REPLACE,
      path: [...current_path],
      value: newTree,
    });
    current_path.pop();
    return patches;
  }



  let props_difference = props_diff(
    oldTree["props"],
    newTree["props"],
    current_path,
  );
  if (props_difference !== undefined) {
    patches.push(props_difference);
  }

  const count = Math.max(oldTree.children.length, newTree.children.length);

  for (let i = 0; i < count; i++) {
    let oldTreeChild = oldTree["children"][i];
    let newTreeChild = newTree["children"][i];
    current_path.push(i);
      if (typeof oldTreeChild === 'number') oldTreeChild = oldTreeChild.toString();
  if (typeof newTreeChild === 'number') newTreeChild = newTreeChild.toString();

    if (oldTreeChild !== undefined && newTreeChild !== undefined) {
      if (
        (typeof oldTreeChild === "object" &&
          typeof newTreeChild === "string") ||
        (typeof newTreeChild === "object" && typeof oldTreeChild === "string")
      ) {
        patches.push({
          type: patchTypes.REPLACE,
          path: [...current_path],
          value: newTreeChild,
        });
        current_path.pop();
        continue;
      }

      if (
        typeof oldTreeChild === "string" &&
        typeof newTreeChild === "string"
      ) {
        if (oldTreeChild != newTreeChild) {
          patches.push({
            type: patchTypes.TEXT,
            path: [...current_path],
            value: newTreeChild,
          });
          current_path.pop();
          continue;
        } else {
          current_path.pop();
          continue;
        }
      }
    }

    if (oldTreeChild !== undefined && newTreeChild === undefined) {
      patches.push({
        type: patchTypes.REMOVE,
        path: [...current_path],
        value: oldTreeChild,
      });
      current_path.pop();
      continue;
    }

    if (oldTreeChild === undefined && newTreeChild !== undefined) {
      patches.push({
        type: patchTypes.ADD,
        path: [...current_path],
        value: newTreeChild,
      });
      current_path.pop();
      continue;
    }
    //  both are nodes and both exists.

    if (oldTreeChild["tag"] !== newTreeChild["tag"]) {
      patches.push({
        type: patchTypes.REPLACE,
        path: [...current_path],
        value: newTreeChild,
      });
      current_path.pop();
      continue;
    } else if (oldTreeChild["tag"] === newTreeChild["tag"]) {
      diff(oldTreeChild, newTreeChild, current_path, patches);
      current_path.pop();
    }
  }
  return patches;
}

function apply_patches(patches, tree) {
  for (const patch of patches) {
    tree = apply_change(tree, patch, patch.type);
  }
  return tree;
}

function apply_change(tree, patch, action) {
  let parent = tree;

  let isActionOnRoot = patch.path.length == 0 ? true : false;

  for (let i = 0; i < patch.path.length - 1; i++) {
    parent = parent.childNodes[patch.path[i]];
  }
  index = patch.path[patch.path.length - 1];

  switch (action) {
    case patchTypes.REPLACE:
      let newNode =
        typeof patch.value === "object"
          ? VirtualNodeToDom(patch.value)
          : document.createTextNode(patch.value);
      if (isActionOnRoot) {
        parent.replaceWith(newNode);
        return newNode;
      } else {
        parent.childNodes[index].replaceWith(newNode);
      }
      break;

    case patchTypes.TEXT:
      if (isActionOnRoot) {
        parent.nodeValue = patch.value;
      } else {
        parent.childNodes[index].nodeValue = patch.value;
      }
      break;
    case patchTypes.ADD:
      if (isActionOnRoot) {
        return VirtualNodeToDom(patch.value);
      } else {
        new_value = undefined;
        if (typeof patch.value === "object")
          new_value = VirtualNodeToDom(patch.value);
        else new_value = document.createTextNode(patch.value);

        parent.appendChild(new_value);
      }
      break;
    case patchTypes.REMOVE:
      if (isActionOnRoot) {
        parent.remove();
        return undefined;
      } else {
        parent.childNodes[index].remove();
      }
      break;
    case patchTypes.PROPS:
      node = isActionOnRoot ? parent : parent.childNodes[index];
      patchEventListeners(node, patch);
      if (Object.keys(patch.set).length !== 0) {
        for (const [key, value] of Object.entries(patch.set)) {
          node.setAttribute(key, value);
        }
      }

      if (Object.keys(patch.remove).length !== 0) {
        for (const [key, value] of Object.entries(patch.remove)) {
          node.removeAttribute(key);
        }
      }
  }
  return tree;
}

function patchEventListeners(element, patch) {
  props = undefined;
  if (patch.type === patchTypes.PROPS) props = patch.set;
  else props = patch.value.props;

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    }
  }

  for (const [key, value] of Object.entries(patch.remove)) {
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      element.removeEventListener(eventName, value);
    }
  }

  return element;
}
