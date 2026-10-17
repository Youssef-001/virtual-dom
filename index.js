h1 = document.createElement('h1');

div = document.getElementById('app')

h1.innerText = "hello world"
div.appendChild(h1)


function h(tag, props, children) {
    let object = {}

    object["tag"] = tag
    object["props"] = props
    object["children"] = []

    for (let i = 0; i < children.length; i++)
    {
        if (typeof children[i] === 'object'){
        let newObject = h(children[i].tag, children[i].props, children[i].children)
        object["children"].push(newObject) 
        }

        else 
        {
            object["children"].push(children[i])
        }

    }

    return object

}

function VirtualNodeToDom(virtualNode) 
{
    let element = document.createElement(virtualNode['tag'])
    for (const [key,value] of Object.entries(virtualNode['props']))
    {
        element[key] = value
    }

    virtualNode.children.forEach((child) => {
        if (typeof child === 'object')
        {
            let newVNode = VirtualNodeToDom(child)
            element.appendChild(newVNode)
        }

        else 
        {
            let textNode = document.createTextNode(child)
            element.appendChild(textNode)
        }
    })

    return element

}



let patchTypes = {
    TEXT: "TEXT", 
    REPLACE: "REPLACE",
    REMOVE: "REMOVE", 
    ADD: "ADD",
    PROPS: "PROPS"
}


function props_diff(old_props, new_props, path)
{

    let patches = []
    let remove_props = {}
    let set_props = {}

for (const [key, value] of Object.entries(new_props)) {
  if (Object.hasOwn(old_props, key))
  {
    if (old_props[key] != new_props[key])
    {
        set_props[key] = value
        
    }
  }

  else {
    set_props[key] = value
  }
}

for (const [key, value] of Object.entries(old_props)) {
  if (!Object.hasOwn(new_props, key))
  {
    remove_props[key] = value
  }
}

if (Object.keys(set_props).length !== 0 || Object.keys(remove_props).length !== 0)
{
return {type: patchTypes.PROPS, path: [...path], set: set_props, remove: remove_props}}

else 
    return undefined

}
let patches = []

function diff(oldTree, newTree, current_path=[])
{


const count = Math.max(
  oldTree.children.length,
  newTree.children.length
);

if (oldTree === undefined && newTree !== undefined)
{
    patches.push({type: patchTypes.ADD, path: [0], value: newTree})
}

else if (oldTree !== undefined && newTree === undefined)
{
    patches.push({type: patchTypes.REMOVE, path: [0], value: undefined})
}



for (let i = 0; i<count; i++)
{
    let oldTreeChild = oldTree['children'][i]
    let newTreeChild = newTree['children'][i]
    current_path.push(i)
    
    if (oldTreeChild !== undefined && newTreeChild !== undefined)
    {
        if (typeof oldTreeChild === 'object' && typeof newTreeChild === 'string' || 
            typeof newTreeChild === 'object' && typeof oldTreeChild === 'string'
        )

        {
            patches.push({type: patchTypes.REPLACE, path: [...current_path], value: newTreeChild})
            current_path.pop()
            continue;
        }

        if (typeof oldTreeChild === 'string' && typeof newTreeChild === 'string')
        {
            if (oldTreeChild != newTreeChild)
            {
            patches.push({type: patchTypes.REPLACE, path: [...current_path], value: newTreeChild})
            current_path.pop()
        continue}
            else {current_path.pop()
                continue}
        }
    }

    if (oldTreeChild !== undefined && newTreeChild === undefined)
    {
        patches.push({type: patchTypes.REMOVE, path: [...current_path], value: oldTreeChild})
        current_path.pop()
        continue
    }

    if (oldTreeChild === undefined && newTreeChild !== undefined)
    {
        patches.push({type: patchTypes.ADD, path: [...current_path], value: newTreeChild})
        current_path.pop()
        continue
    }
    //  both are nodes and both exists.

        if (oldTreeChild['tag'] !== newTreeChild['tag'])
        {
            patches.push({type: patchTypes.REPLACE, path: [...current_path], value: newTreeChild})
            current_path.pop()
            continue
        }

        else if (oldTreeChild['tag'] === newTreeChild['tag'])
        {
            // array of props changes.
            let props_difference = props_diff(oldTreeChild['props'], newTreeChild['props'], current_path)
            if (props_difference !== undefined)
            {
                patches.push(props_difference)
            }
            // current_path.push(i)
            diff(oldTreeChild, newTreeChild, current_path)
            current_path.pop();

            
        }
        
 
}
return patches;

}


function apply_patches(patches, tree)
{
    patches.forEach((patch) => {
        switch (patch.type) {
            case patchTypes.REPLACE:
                apply_replace(tree, patch)
                break;
            
            case patchTypes.ADD:
                apply_add(tree, patch)
                break;
            case patchTypes.REMOVE:
                apply_remove(tree, patch)
                break;
            case patchTypes.PROPS:
                apply_props(tree, patch)
        }
        
        
    })
}

function apply_replace(tree, patch)
{
  if (patch.path.length == 0) return;
  let current_tree = tree;

    for (let i = 0; i < patch.path.length-1; i++)
    {
        current_tree = current_tree.children[patch.path[i]]

        if (i == patch.path.length - 2)
        {
            console.log(current_tree)
            current_tree.children[patch.path[i+1]] = patch.value
        }

    }

}

function apply_add(tree, patch)
{
      let current_tree = tree;

    for (let i = 0; i < patch.path.length-1; i++)
    {
        current_tree = current_tree.children[patch.path[i]]

        if (i == patch.path.length - 2)
        {
            console.log(current_tree)
            current_tree.children.push(patch.value)
        }

}}


out = h("div", { id: "greeting" }, [
  {
    tag: "span", props: {}, children: [
       "test"]
  },
  {
    tag: "span", props: {}, children: ["Hello world", " test"]
  },
  
])


tree1 = h("div", {}, [
    {tag: "span", props: {}, children:[]},
    {tag: "p", props: {}, children: []}
])



tree2 = h("div", {}, [
    {tag: "span", props: {}, children:[]},
    {tag: "p", props: {}, children: []},
    {tag: "div", props:{}, children: []}
])


const tree3 = h("div", {}, [
    { tag: "span", props: {}, children: ["Test"] },
    { tag: "span", props: {}, children: ["Hello", "test"] }
]);

const tree4 = h("div", {}, [
    { tag: "span", props: {}, children: ["Test"] },
    { tag: "span", props: {}, children: ["Hii", "test"] }
]);

const tree5 = h("div", {}, [
    { tag: "span", props: {}, children: ["Test"] },
    { tag: "span", props: {}, children: ["Hello", "/test"] }
]);

const tree6 = h("div", {}, [
    { tag: "span", props: {}, children: ["Hello", "/test"] }
]);


const tree7 = h("div", {}, [
    { tag: "span", props: { id: "heading1" }, children: [] },
    { tag: "span", props: {}, children: [] }
]);

const tree8 = h("div", {}, [
    { tag: "span", props: { id: "heading2", class: "S1" }, children: [] },
    { tag: "span", props: {}, children: [] }
]);
console.log(out)
console.log(VirtualNodeToDom(out))

patchess = diff(tree5,tree6);
console.log(patchess);


apply_patches(patches, tree5);