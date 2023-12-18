

export type JSXSingleResult = Record<string, any>
export type JSXResult = JSXSingleResult | JSXSingleResult[]
export type RSingleResult = {data: JSXSingleResult}
export type RResult = {data: JSXResult}


export function __t(...args) {
  let txt = "";
  for(let i = 0; i < args.length; i ++ ) {
    if (typeof args[i] === "string" || typeof  args[i] === "number") {
      txt += args[i]
    }
  }
  return txt;
}

export function  __s(txt) {
  return txt
}

function InnerR(child, R) {
  const [id, props, children] = child;
  R[id] = props

  for(let i = 0; i < children.length; i ++) {
    const child = children[i]
    if (child.jsxId !== undefined
        || child.length === 0
        || (typeof child[0] === 'object' && child[0].jsxId !== undefined)
    ) {
      R[id + "_c" + i] = child;
    } else {
      InnerR(children[i], R)
    }
  }
}

export function __r(id: string, props: Record<string, any>, children: Array<any>): JSXResult {
  const R = {} as JSXSingleResult

  R.jsxId = id;
  R._0_0 = props // myself

  for(let i = 0; i < children.length; i ++) {
    const child = children[i]
    if (child.jsxId !== undefined
        || child.length === 0
        || (typeof child[0] === 'object' && child[0].jsxId !== undefined)
    ) {
      R["_0_0_c" + i] = child;
    } else {
      InnerR(child, R)
    }
  }
  console.log("R:", JSON.stringify(R))
  return R;
}
