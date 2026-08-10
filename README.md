# didact-study

React의 렌더링 동작을 이해해보려고, 아주 작은 React 구현체(Didact)를 직접 손으로 따라 작성해본 학습용 저장소입니다.

## 출처

이 저장소의 코드는 **Rodrigo Pombo**가 쓴 글 [Build your own React](https://pomb.us/build-your-own-react/)를 보고 단계별로 따라 작성했습니다. 설계와 진행 순서, `Didact`라는 이름 모두 원글에서 왔습니다. 훌륭한 글을 무료로 공개해준 저자에게 감사를 전합니다.

## 구성

`src/main.jsx` 한 파일에 전체 구현이 들어 있고, 커밋이 곧 진행 단계입니다. `git log`를 역순으로 따라가면 어떤 순서로 쌓아 올렸는지 볼 수 있습니다.

- `createElement` — JSX를 `{ type, props }` 형태의 객체로
- `render` / `createDom` — 엘리먼트를 실제 DOM 노드로
- Concurrent Mode — `requestIdleCallback`으로 작업을 잘게 쪼개 브라우저에 양보
- Fibers — child / sibling / parent 링크로 트리를 순회 가능한 자료구조로
- Render와 Commit 단계 분리 — 중간에 페인트가 끼어들어 UI가 반쯤 그려지는 걸 방지
- Reconciliation — 이전 fiber 트리와 비교해 PLACEMENT / UPDATE / DELETION 판정
- Function Components
- Hooks — `useState`

## 실행

```bash
npm install
npm run dev
```

## 원글과 다른 점

빌드 도구로 Vite 8을 씁니다. JSX를 `React.createElement` 대신 `Didact.createElement` 호출로 변환해야 해서 `vite.config.js`에서 classic runtime과 pragma를 지정합니다. 원글이 나온 시점과 도구 체인이 달라 생긴 차이일 뿐, 구현 내용 자체는 원글을 따릅니다.
