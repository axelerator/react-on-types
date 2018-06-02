/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/** @jsx Component.createElement */\nclass VTree {\n    constructor() {\n        this.domNode = null;\n    }\n    ancestors() {\n        if (this.parent) {\n            return [this.parent].concat(this.parent.ancestors());\n        }\n        else {\n            return [];\n        }\n    }\n}\nclass VNode extends VTree {\n    constructor(elemName, children) {\n        super();\n        this.elemName = elemName;\n        this.children = children;\n        this.eventHandlers = [];\n        for (let child of children) {\n            child.parent = this;\n        }\n    }\n    createDOM() {\n        this.domNode = document.createElement(this.elemName);\n        for (let child of this.children) {\n            this.domNode.appendChild(child.createDOM());\n        }\n        for (let eventType in this.eventHandlers) {\n            this.eventHandlers.forEach((eventAndHandler) => {\n                const [eventType, handler] = eventAndHandler;\n                this.domNode.addEventListener(eventType, (e) => {\n                    handler(e);\n                    const closestComponent = this.ancestors().filter((a) => (a instanceof Component))[0];\n                    closestComponent.rerender();\n                });\n            });\n        }\n        const element = this.domNode;\n        for (let key in this.attributes) {\n            const value = this.attributes[key];\n            if (!key.startsWith('on')) {\n                element.setAttribute(key, value);\n            }\n        }\n        return this.domNode;\n    }\n    setEventHandler(eventType, handler) {\n        this.eventHandlers.push([eventType, handler]);\n    }\n}\nclass VText extends VTree {\n    constructor(content) {\n        super();\n        this.content = content;\n    }\n    createDOM() {\n        return this.domNode = document.createTextNode(this.content);\n    }\n}\nclass Component extends VTree {\n    constructor(props) {\n        super();\n        this._props = props;\n        this._state = this.defaultState();\n        this.vTree = this.render();\n        this.vTree.parent = this;\n    }\n    createDOM() {\n        return this.domNode = this.vTree.createDOM();\n    }\n    rerender() {\n        this.vTree = this.render();\n        this.vTree.parent = this;\n        const domParent = this.domNode.parentNode;\n        const oldDomNode = this.domNode;\n        const newDOMNode = this.createDOM();\n        domParent.replaceChild(this.domNode, oldDomNode);\n    }\n    static createElement(elemName, attributes, ...children) {\n        const childrenAsNodes = [].concat(...children).map(Component.wrapStringsInText).filter((x) => x);\n        let e;\n        const props = {};\n        if (attributes) {\n            for (let key in attributes) {\n                const value = attributes[key];\n                if (!key.startsWith('on')) {\n                    props[key] = value;\n                    console.log(props);\n                }\n            }\n        }\n        if (typeof elemName == 'string') {\n            e = new VNode(elemName, childrenAsNodes);\n        }\n        else {\n            e = new elemName(props);\n        }\n        e.attributes = attributes;\n        if (attributes) {\n            for (let key in attributes) {\n                const value = attributes[key];\n                if (key.startsWith('on')) {\n                    const eventType = key.slice(2).toLowerCase();\n                    const handler = value;\n                    e.setEventHandler(eventType, handler);\n                }\n                else {\n                    props[key] = value;\n                    console.log(props);\n                }\n            }\n        }\n        if (e instanceof Component) {\n            const component = e;\n            component.setProps(props);\n        }\n        return e;\n    }\n    setProps(props) {\n        this._props = props;\n    }\n    props() {\n        return this._props;\n    }\n    state() {\n        return this._state;\n    }\n    x(stateModifyingFunction) {\n        const boundF = stateModifyingFunction.bind(this);\n        return (e) => (this._state = boundF(e));\n    }\n    static wrapStringsInText(stringOrTree) {\n        if (typeof stringOrTree == 'string' || typeof stringOrTree == 'number') {\n            return new VText('' + stringOrTree);\n        }\n        return stringOrTree;\n    }\n}\nclass StatelessComponent extends Component {\n    constructor() { super({}); }\n    defaultState() {\n        return {};\n    }\n}\nclass Counter extends Component {\n    defaultState() {\n        return {\n            count: this.props().count,\n            variant: (this.props().count >= 20 ? 'danger' : 'normal')\n        };\n    }\n    increment() {\n        const newVal = this.state().count + 1;\n        return {\n            count: newVal,\n            variant: (newVal >= 20 ? 'danger' : 'normal')\n        };\n    }\n    cssClasses() {\n        return `card ${this.state().variant}`;\n    }\n    render() {\n        return Component.createElement(\"div\", { class: this.cssClasses() },\n            Component.createElement(\"p\", null,\n                \"Initialized with \",\n                this.props().count),\n            Component.createElement(\"p\", null,\n                this.state().count,\n                \" (\",\n                this.state().variant,\n                \")\"),\n            Component.createElement(\"p\", { class: \"button\", onclick: this.x(this.increment) }, \"+++\"));\n    }\n}\nclass Layout extends StatelessComponent {\n    render() {\n        const counters = 3;\n        const range = Array(counters).fill(0).map((x, i) => i);\n        return Component.createElement(\"div\", null, range.map((i) => Component.createElement(\"div\", null,\n            Component.createElement(\"p\", null,\n                \"Counter \",\n                i + 1),\n            \" \",\n            Component.createElement(Counter, { count: i * 10 }),\n            \" \")));\n    }\n}\nconst counter = new Counter({ count: 1 });\nconst layout = new Layout();\nconst n = layout.createDOM();\nconst mountPoint = document.getElementById('mount-point');\nmountPoint.appendChild(n);\n\n\n//# sourceURL=webpack:///./src/index.tsx?");

/***/ })

/******/ });