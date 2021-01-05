export function parse(value: string) {
  let index = 0
  function sub() {
    const keywords = []
    let current = index
    function saveKeyword() {
      if (index - 1 > current) {
        // @ts-ignore
        keywords.push(value.slice(current, index - 1))
      }
    }
    while (index < value.length) {
      const c = value[index++]
      // console.log("c", c, index)
      if (c === '(') {
        // @ts-ignore
        keywords.push(sub())
        current = index
      } else if (c === ')') {
        saveKeyword()
        return keywords
      } else if (c === ' ') {
        saveKeyword()
        current = index
      }
    }
    saveKeyword()
    return keywords
  }
  return sub()[0]
}

export function unwrapList(tree: any) {
  // console.log("unwrapList", tree)
  return tree
}

export function unwrapXYList(tree: any) {
  // console.log("unwrapXYList", tree)
  return {
    x: parseInt(tree[0].substring(1)),
    y: parseInt(tree[1].substring(1)),
  }
}
