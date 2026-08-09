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

  // Step VI 개정: 이벤트 리스너까지 포함해 prop 반영을 updateDom 한 곳으로 통일
  updateDom(dom, {}, fiber.props)

  return dom
}

const isEvent = key => key.startsWith("on")
const isProperty = key => 
  key !== 'children' && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key => 
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    ).forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })
  
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

// Fiber tree를 돌면서 생성만 해놓은 Dom 객체를 Document에 한꺼번에 연결
// 이 사이에 브라우저 페인트가 끼어들 수 없음
function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  
  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom
  if (
    fiber.effectTag === 'PLACEMENT' &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === 'UPDATE' &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, // 이전 커밋 단계에서 DOM에 커밋했던 기존 fiber에 대한 링크
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null  // DOM에 커밋한 마지막 fiber tree에 대한 참조
let wipRoot = null
let deletions = null

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
  const isFunctionComponent = 
    fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
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

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber = 
    wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null

    const sameType = 
      oldFiber &&
      element &&
      element.type === oldFiber.type
    
    if (sameType) {
      // UPDATE
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE"
      }
    }
    if (element && !sameType) {
      // PLACEMENT
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT"
      }
    }
    if (oldFiber && !sameType) {
      // DELETE
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else if(element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

const Didact = {
  createElement,
  render,
}

function App(props) {
  return <h1>Hi {props.name}</h1>
}
const element = <App name="foo" />
const container = document.getElementById("root")
Didact.render(element, container)
