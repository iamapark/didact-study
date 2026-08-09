// ─────────────────────────────────────────────────────────────
// 환경 검증용 코드 — Day 1 시작할 때 전부 지우고 처음부터 작성할 것
// 확인 포인트: JSX가 Didact.createElement 호출로 변환되는가 (vite.config.js)
// ─────────────────────────────────────────────────────────────

// Block 2~3에서 만들었던 최소 createElement (TEXT_ELEMENT 래핑 없는 버전)
const Didact = {
  createElement: (type, props, ...children) => ({
    type,
    props: { ...props, children },
  }),
}

// 이 JSX가 Didact.createElement("div", ...) 호출로 변환되어야 함
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

console.log("JSX → Didact.createElement 변환 결과:", element)

document.getElementById("root").innerHTML = `
  <h2>didact-study 환경 준비 완료</h2>
  <p>JSX가 <code>Didact.createElement</code> 호출로 변환되어 아래 element 객체가 만들어졌습니다:</p>
  <pre>${JSON.stringify(element, null, 2)}</pre>
`
