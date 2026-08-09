export default {
  // Vite 8(Rolldown 기반)은 esbuild 대신 oxc로 변환한다.
  // JSX를 automatic runtime(react/jsx-runtime import) 대신
  // classic 방식의 Didact.createElement 호출로 변환하도록 지정.
  oxc: {
    jsx: {
      runtime: "classic",
      pragma: "Didact.createElement",
      // dev 모드가 props에 __source(디버그 정보)를 주입하지 않도록 끔
      // — 글의 코드와 동일한 {type, props} 모양을 유지하기 위해
      development: false,
    },
  },
}
