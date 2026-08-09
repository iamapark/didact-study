function createElement(type, props, ...children) {
  return {
    type,
    props: { 
      ...props, 
      children: children.map(child => 
        typeof child === 'object'
          ? child
          : createTextElement(child)
      )
    },
  }
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createDom(fiber) {
  const dom = 
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })
​
  return dom
}

// Fiber tree를 돌면서 생성만 해놓은 Dom 객체를 Document에 한꺼번에 연결
// 이 사이에 브라우저 페인트가 끼어들 수 없음
function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    }
  }
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let wipRoot = null

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

  // 더 이상 처리할 게 없는 상태인 경우
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

/**
 * 각 fiber에는 첫번째 child, 다음 sibling, 그리고 parent로 가는 링크가 있음
 */

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  if (fiber.child) {    // 규칙 1: 자식이 있으면 자식으로
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {    // 규칙 2: 형제가 있으면 형제로
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent  // 규칙 3: 없으면 한 칸 올라가서 다시 형제 찾기
  }
  // root까지 올라와도 형제가 없으면 while 종료 → undefined 반환
}

const Didact = {
  createElement,
  render,
}

const element = (
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>
)
const container = document.getElementById("root")
Didact.render(element, container)
