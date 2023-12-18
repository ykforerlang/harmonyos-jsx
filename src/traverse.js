const traverse = require('@babel/traverse').default
const t = require("@babel/types");

const hComponentConfig = require('./harmonyos-component.config')

const whiteSpace = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t"
const jsxBaseTab = `\t\t\t\t`


module.exports = function (ast) {
    let componentClass = "";
    const allArtsPart = []
    const allArtsPart2 = []

    traverse(ast, {
        enter: path => {
            if (path.node.type === "ClassDeclaration"
                && path.node?.decorators
                && path.node.decorators.some((item) => (item.expression.type === "Identifier" && item.expression.name === "Component"))
            ) {
                componentClass = path.node.id.name
            }

            if (path.node.type === "JSXElement") {
                let jsxReplaceName = "";
                let currentIndependentJSX;
                if (path.parent.type !== "JSXElement") {
                    currentIndependentJSX = {
                        artsPart: "",
                        jsxDepth: 0,
                    }
                    allArtsPart.push(currentIndependentJSX)
                    jsxReplaceName = "_0_0"
                } else {
                    currentIndependentJSX = allArtsPart[allArtsPart.length - 1]
                    currentIndependentJSX.jsxDepth ++;
                    jsxReplaceName = `_${currentIndependentJSX.jsxDepth}_${getNodeIndex(path)}`
                }
                const jsxDepth = currentIndependentJSX.jsxDepth
                const jsxName = path.node.openingElement.name.name

                path.node.jsxReplaceName = jsxReplaceName

                const artsPartPrefix = `${jsxBaseTab}${whiteSpace.substr(0, jsxDepth)}${jsxName}`

                const optionsArtPart = generateArkConstructOptions(path);

                if (jsxName === "Text") {
                    if (path.node.children.length === 0) {
                        //no-op
                    } else if (path.node.children.length === 1 && path.node.children[0].type === "JSXText") {
                        currentIndependentJSX.artsPart += `${artsPartPrefix}("${path.node.children[0].value}")\n`
                    } else {
                        path.node.openingElement.attributes.push(t.jsxAttribute(
                            t.jsxIdentifier("value"),
                            t.jsxExpressionContainer(t.callExpression(
                                t.identifier("__t"),
                                path.node.children.map(itemNode => {
                                    if (itemNode.type === "JSXText") {
                                        return t.stringLiteral(itemNode.value);
                                    } else if (itemNode.type === "JSXExpressionContainer") {
                                        return itemNode.expression
                                    }
                                })
                            ))
                        ))
                        path.node.children = []
                        currentIndependentJSX.artsPart += `${artsPartPrefix}($$.data.${jsxReplaceName}.value)\n`
                    }
                } else if (hasChild(path)) {
                    currentIndependentJSX.artsPart += `${artsPartPrefix}(${optionsArtPart}) {\n`
                } else {
                    currentIndependentJSX.artsPart += `${artsPartPrefix}(${optionsArtPart})\n`
                }
            }

            if (path.node.type === "JSXExpressionContainer" && path.listKey === "children") {
                if (path.node.isNew) {
                    return;
                }

                if (path.node.expression.type === "JSXEmptyExpression") {
                    return;
                }

                const currentIndependentJSX = allArtsPart[allArtsPart.length - 1]
                const jsxDepth = currentIndependentJSX.jsxDepth
                if (path.parent?.openingElement?.name?.name === "Text") {
                    // no-op
                } else {
                    currentIndependentJSX.artsPart += `${jsxBaseTab}${whiteSpace.substr(0, jsxDepth + 1)}this.D({data: $$.data.${path.parent.jsxReplaceName}_c${getNodeIndex(path)}})\n`
                }
            }


        },
        exit(path) {
            if (path.node.type === "JSXElement") {
                const currentIndependentJSX = allArtsPart[allArtsPart.length - 1]

                const jsxDepth = currentIndependentJSX.jsxDepth
                const jsxName = path.node.openingElement.name.name

                if (jsxName === "Text") {
                    // no-op
                } else if (hasChild(path)) {
                    currentIndependentJSX.artsPart += `${jsxBaseTab}${whiteSpace.substr(0, jsxDepth)}}\n`
                } else {
                    // no-op
                }

                const jsxReplaceName = path.node.jsxReplaceName

                path.node.openingElement.attributes.forEach(itemNode => {
                    if (itemNode.type !== "JSXAttribute") {
                        return
                    }
                    if (itemNode.name.name === "value" && jsxName === "Text") {
                        return;
                    }

                    if (hComponentConfig[jsxName]
                        && hComponentConfig[jsxName].options
                        && hComponentConfig[jsxName].options.has(itemNode.name.name)) {
                        return;
                    }



                    const attributePrefix = `${jsxBaseTab}${whiteSpace.substr(0, jsxDepth)}.${itemNode.name.name}`
                    if (itemNode.value.type === "StringLiteral") {
                        currentIndependentJSX.artsPart += `${attributePrefix}("${itemNode.value.value}")\n`
                    } else if (itemNode.value.type === "JSXExpressionContainer") {
                        if (itemNode.value.expression.type === "StringLiteral") {
                            currentIndependentJSX.artsPart += `${attributePrefix}("${itemNode.value.expression.value}")\n`;
                        } else if (itemNode.value.expression.type.endsWith("Literal")) {
                            currentIndependentJSX.artsPart += `${attributePrefix}(${itemNode.value.expression.value})\n`;
                        } else {
                            currentIndependentJSX.artsPart += `${attributePrefix}($$.data.${jsxReplaceName}.${itemNode.name.name})\n`
                        }
                    } else {
                        //no-op
                    }
                })


                if (path.parent.type !== "JSXElement") {
                    allArtsPart2.push(currentIndependentJSX);
                    allArtsPart.pop();
                } else {
                    currentIndependentJSX.jsxDepth --;
                }


                const childrenExpre = path.node.children
                    .filter(itemNode => itemNode.type === "JSXExpressionContainer" && itemNode.expression.type !== "JSXEmptyExpression")
                    .map(itemNode => itemNode.expression)

                const jsxProperty = path.node.openingElement.attributes
                    .filter(itemNode => itemNode.type === "JSXAttribute"
                        && itemNode.value.type === "JSXExpressionContainer"
                        && !itemNode.value.expression.type.endsWith("Literal")
                    )
                    .map(itemNode => {
                        return t.objectProperty(t.identifier(itemNode.name.name), itemNode.value.expression)
                    })



                if (path.parent.type !== "JSXElement") {
                    path.replaceWith(t.callExpression(
                        t.identifier("__r"),
                        [
                            t.stringLiteral("__jsx_" + (allArtsPart2.length - 1)),
                            t.objectExpression(jsxProperty),
                            t.arrayExpression(childrenExpre)
                        ]
                    ))
                } else {
                    const jsxExpre = t.jsxExpressionContainer(t.arrayExpression([
                        t.stringLiteral(jsxReplaceName),
                        t.objectExpression(jsxProperty),
                        t.arrayExpression(childrenExpre)
                    ]))
                    jsxExpre.isNew = true
                    path.replaceWith(jsxExpre)
                }
            }

            if (path.node.type === "ClassMethod" &&  componentClass && path.node.key.name === 'build') {
                path.node.key.name = "rawBuild"
            }

            // add __D, __S
            if (path.node.type === "ClassDeclaration" && componentClass) {
                componentClass = "";

                path.node.body.body.push(t.classProperty(t.identifier(`
                                
  build() {
    Column() {
      this.D({data: this.RD})
    }
      .width('100%')
      .height('100%')
  }                                
                                ______`
                )))


                path.node.body.body.push(t.classProperty(t.identifier(`
  @Builder D($$: RResult) {
    if (Array.isArray($$.data)) {
      ForEach($$.data, (item: JSXResult) => {
        this.S({data: item})
      })
    } else if (typeof $$.data === "object") {
      this.S({data: $$.data})
    }
  }
                            ______`
                )))

                let sFunc = `
  @Builder S($$: RSingleResult) {                              
                                `
                for (let i = 0; i < allArtsPart2.length; i++) {
                    if (i === 0) {
                        sFunc += `
     if ($$.data.jsxId === "__jsx_${i}") {
${allArtsPart2[i].artsPart}
     }`
                    } else {
                        sFunc += ` else if ($$.data.jsxId === "__jsx_${i}") {
${allArtsPart2[i].artsPart}
     }`
                    }
                }
                sFunc += `
  }                           
                                ______`
                path.node.body.body.push(t.classProperty(t.identifier(sFunc)));

                path.node.body.body.push(t.classProperty(t.identifier(`
  @State RD: JSXResult = this.rawBuild()
  __OC() {
    //TODO 精细化更新
    this.RD = this.rawBuild()
  }                                                             
                                ______`)))
            }


            if (path.node.type === "ClassProperty" && componentClass) {
                if (path.node.decorators
                    && path.node.decorators.length > 0
                    && path.node.decorators.some(itemNode => itemNode.expression.type === "Identifier" && itemNode.expression.name === "State")
                ) {
                    path.node.decorators.push(t.decorator(t.identifier(`Watch('__OC')`)))
                }

            }

            if (path.node.type === "Program") {
                path.node.body.unshift(
                    t.expressionStatement(t.identifier(`import { __r, __t, JSXResult, RResult, RSingleResult } from '../pages-tsx/hsx'`))
                )
            }

        }
    })

}


function getNodeIndex(astNode) {
    if (astNode.listKey !== "children") {
        return 0
    }

    let index = 0;
    const allChildren = astNode.parent.children;
    for(let i = 0; i < allChildren.length; i ++) {
        if (allChildren[i] === astNode.node) {
            return index;
        }

        if (allChildren[i].type === "JSXText" && allChildren[i].value.trim() === ""
            || allChildren[i].type === "JSXExpressionContainer" && allChildren[i].expression.type === "JSXEmptyExpression"
        ) {
            //no-op
        } else {
            index ++
        }
    }
}

function generateArkConstructOptions(path) {
    const jsxName = path.node.openingElement.name.name

    if (!hComponentConfig[jsxName]) {
        return ""
    }
    const config = hComponentConfig[jsxName]
    const jsxReplaceName = path.node.jsxReplaceName

    let optionArk = "";
    path.node.openingElement.attributes
        .filter(item => item.type === "JSXAttribute" && config.options && config.options.has(item.name.name))
        .forEach(item => {
            if (item.value.type === "StringLiteral") {
                optionArk += `${item.name.name}: "${item.value.value}", `
            } else if (item.value.type === "JSXExpressionContainer") {
                if (item.value.expression.type.endsWith("Literal")) {
                    optionArk += `${item.name.name}: ${item.value.expression.value}, `
                } else {
                    //TODO  这里应该是harmonyos的BUG，直接使用$$.data 会触发ArkTs编译错误，所以需要"" + $$.data 避免
                    optionArk += `${item.name.name}: "" + $$.data.${jsxReplaceName}.${item.name.name}, `
                }
            }
        })

    if (optionArk !== "") {
        optionArk = `{${optionArk.substring(0, optionArk.length - 2)}}`
    }
    return optionArk
}

function hasChild(path) {
    return path.node.children.filter(itemNode => !(itemNode.type === "JSXText" && itemNode.value.trim() === ""))
        .filter(itemNode => !(itemNode.type === "JSXExpressionContainer" && itemNode.expression.type === "JSXEmptyExpression"))
        .length > 0
}
