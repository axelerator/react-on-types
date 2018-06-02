/** @jsx Component.createElement */
abstract class VTree {
  parent : VTree ;
  domNode : Node = null;

  abstract createDOM() : Node;

  ancestors() : Array<VTree> {
    if (this.parent) {
      return [this.parent].concat(this.parent.ancestors());
    } else {
      return [];
    }
  }
}

class VNode extends VTree {
  eventHandlers: Array<[string, Function]> = []; 
  attributes: any;
  constructor(readonly elemName: string, readonly children: Array<VTree>) { 
    super();
    for (let child of children) {
      child.parent = this;
    }

  }

  createDOM() : Node {
    this.domNode = document.createElement(this.elemName);
    for (let child of this.children) {
        this.domNode.appendChild(child.createDOM());
    }
    for (let eventType in this.eventHandlers) {
      this.eventHandlers.forEach((eventAndHandler) => {
        const [eventType, handler] = eventAndHandler;
        this.domNode.addEventListener(eventType, (e) => {
          handler(e);
          const closestComponent : Component<any, any>  = this.ancestors().filter((a) => (a instanceof Component))[0] as Component<any, any>;
          closestComponent.rerender();
        });
      });
    }
    const element : Element = this.domNode as Element;
    for (let key in this.attributes) {
      const value = this.attributes[key];
      if (!key.startsWith('on')) {
        element.setAttribute(key, value);
      }
    
    }
    return this.domNode;
  }

  setEventHandler(eventType: string, handler: Function) {
    this.eventHandlers.push([eventType, handler]);
  }
}


class VText extends VTree {
  constructor(readonly content: string) { super() }

  createDOM() : Node {
    return this.domNode = document.createTextNode(this.content); 
  }
}

declare namespace JSX {
  interface IntrinsicElements {
      div: any,
      h1: any,
      input: any,
      a: any,
      p: any
  }
}

abstract class Component<T,R> extends VTree {
  private vTree: VTree;
  private _state: T;
  private _props: R;
  constructor(props : R) { 
    super();
    this._props = props;
    this._state = this.defaultState()
    this.vTree = this.render();
    this.vTree.parent = this;
  }

  createDOM() : Node {
    return this.domNode = this.vTree.createDOM();
  }

  rerender() : void {
    this.vTree = this.render();
    this.vTree.parent = this;
    const domParent = this.domNode.parentNode;
    const oldDomNode = this.domNode;
    const newDOMNode = this.createDOM();
    domParent.replaceChild(this.domNode, oldDomNode);
  }

  static createElement(elemName: any, attributes: any, ...children: Array<any>) {
    const childrenAsNodes = [].concat(...children).map(Component.wrapStringsInText).filter((x) => x); 
    let e;
    const props : any = {}
    if (attributes) {
      for (let key in attributes) {
        const value = attributes[key];
        if (!key.startsWith('on')) {
          props[key] = value;
          console.log(props);
        }
      }
    }
    if (typeof elemName == 'string') {
      e = new VNode(elemName, childrenAsNodes);
    } else {
      e = new elemName(props);
    }
    e.attributes = attributes;
    if (attributes) {
      for (let key in attributes) {
        const value = attributes[key];
        if (key.startsWith('on')) {
          const eventType = key.slice(2).toLowerCase();
          const handler = value;
          e.setEventHandler(eventType, handler);
        } else {
          props[key] = value;
          console.log(props);
        }
      }
    }
    if (e instanceof Component) {
      const component = e as Component<any, any>;
      component.setProps(props);
    }
    return e;
  }

  setProps(props : R) : void {
    this._props = props;
  }

  protected props() : R {
    return this._props;
  }

  protected state() : T {
    return this._state;
  }

  protected x(stateModifyingFunction: Function) {
    const boundF = stateModifyingFunction.bind(this);
    return (e: any) => ( this._state = boundF(e));
  }

  static wrapStringsInText(stringOrTree : any) : VTree {
    if (typeof stringOrTree == 'string' || typeof stringOrTree == 'number') {
      return new VText('' + stringOrTree);
    }
    return stringOrTree;
  }

  abstract render() : VTree;
  abstract defaultState() : T ;

}

interface NoProps {}

class C1 extends Component<CounterState, NoProps> {

  defaultState() : CounterState {
    return {
      count: 0,
      variant: 'normal'
    }
  }

  increment() {
    return {
      count: this.state().count + 1
    }
  }

  update(e: any) {
    console.log(e.srcElement.value);
    return {
      count: 444
    }
  }

  render() : VTree {
    return <div>
      <p>{this.state().count}</p>
      <p onclick={this.x(this.increment)}>+++</p>
      <input oninput={this.x(this.update)} value={this.state().count} />
    </div>;
  }
}

interface CounterState {
  count: number
  variant: string
}

interface CounterInit {
  count: number,
}

class Counter extends Component<CounterState, CounterInit> {
 
  defaultState() : CounterState {
    return {
      count: this.props().count,
      variant: (this.props().count >= 20 ? 'danger' : 'normal')
    }
  }

  increment() {
    const newVal = this.state().count + 1 ;
    return {
      count: newVal,
      variant: (newVal >= 20 ? 'danger' : 'normal')
    }
  }

  cssClasses() {
    return `card ${this.state().variant}`;
  }

  render() : VTree {
    return <div class={this.cssClasses()}>
      <p>Initialized with {this.props().count}</p>
      <p>{this.state().count} ({this.state().variant})</p>
      <p class="button" onclick={this.x(this.increment)}>+++</p>
    </div>;
  } 
}

interface NoState {}

abstract class StatelessComponent extends Component<NoState, NoProps> {
  constructor() { super({}); }
  defaultState() {
    return {};
  }
}

interface LayoutState {
  amount: number
}

class Layout extends StatelessComponent {
  render() {
    const counters = 3;
    const range : Array<any> = Array(counters).fill(0).map((x, i) => i ) ;
    return <div>
      {range.map( (i) => <div><p>Counter {i+1}</p> <Counter count={i*10}/> </div>) }
    </div>;
  }
}

const c1 = new C1({});
const counter = new Counter({ count: 1});
const layout = new Layout();
const n = layout.createDOM();
const mountPoint = document.getElementById('mount-point');
mountPoint.appendChild(n);