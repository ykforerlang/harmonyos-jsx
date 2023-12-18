declare global {
  class React {}

  class Divider {
    width?: number
  }
  class Column {
    width?: number
  }

  class Row {
    width?: number
  }

  class Text {

  }
  class TextInput {

  }
  class Button {

  }

  const console: {
    log: (...args: any) => {},
    error: (...args: any) => {},
    warn: (...args: any) => {},
    info: (...args: any) => {},
    trace: () => {}
  }

  const TextDecorationType: Record<string, any>
  const Color: Record<string, any>

  function State(a: any, b: any): void;
  function BuilderParam(a: any, b: any): void;
  function Entry(a: any, b: any): void;
  function Component(a: any, b: any): void;
}

export declare class Text {}

// @ts-ignore
export default global;
