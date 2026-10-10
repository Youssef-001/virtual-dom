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


function check_props(old_props, new_props)
{
    
}

function diff(oldTree, newTree)
{

let patches = []

const count = Math.max(
  oldNode.children.length,
  newNode.children.length
);

if (oldTree === undefined && newTree !== undefined)
{
    patches.push({type: PROPS.ADD, path: [0], value: newTree})
}

else if (oldTree !== undefined && newTree === undefined)
{
    patches.push({type: PROPS.REMOVE, path: [0], value: undefined})
}
let current_path = [0]



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
            patches.push({type: PROPS.REPLACE, path: current_path, value: newTreeChild})
        }
    }

    else if (oldTreeChild !== undefined && newTreeChild === undefined)
    {
        patches.push({type: PROPS.REMOVE, path:current_path, value: undefined})
    }

    else if (oldTreeChild === undefined && newTreeChild !== undefined)
    {
        patches.push({type: PROPS.ADD, path:current_path, value: newTreeChild})
    }
    //  both are nodes and both exists.
    else {

        if (oldTreeChild['tag'] !== newTreeChild['tag'])
        {
            patches.push({type: PROPS.REPLACE, path:current_path, value: newTreeChild})
        }

        else if (oldTreeChild['tag'] === newTreeChild['tag'])
        {
            // array of props changes.
            let props_difference = check_props(oldTreeChild['props'], newTreeChild['props'])
            diff(oldTreeChild, newTreeChild)


        }

    }
}
    


}


out = h("div", { id: "greeting" }, [
  {
    tag: "span", props: {}, children: [
       "test"]
  },
  {
    tag: "span", props: {}, children: ["Hello world", " test"]
  },
  
])


console.log(out)
console.log(VirtualNodeToDom(out))