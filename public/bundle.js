var app = (function () {
'use strict';

function noop() {}

function assign(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = this.get = noop;

	if (detach !== false) this._fragment.u();
	this._fragment.d();
	this._fragment = this._state = null;
}

function destroyDev(detach) {
	destroy.call(this, detach);
	this.destroy = function() {
		console.warn('Component was already destroyed');
	};
}

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function init(component, options) {
	component._observers = { pre: blankObject(), post: blankObject() };
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function observeDev(key, callback, options) {
	var c = (key = '' + key).search(/[^\w]/);
	if (c > -1) {
		var message =
			'The first argument to component.observe(...) must be the name of a top-level property';
		if (c > 0)
			message += ", i.e. '" + key.slice(0, c) + "' rather than '" + key + "'";

		throw new Error(message);
	}

	return observe.call(this, key, callback, options);
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function onDev(eventName, handler) {
	if (eventName === 'teardown') {
		console.warn(
			"Use component.on('destroy', ...) instead of component.on('teardown', ...) which has been deprecated and will be unsupported in Svelte 2"
		);
		return this.on('destroy', handler);
	}

	return on.call(this, eventName, handler);
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) return;
	this.root._lock = true;
	callAll(this.root._beforecreate);
	callAll(this.root._oncreate);
	callAll(this.root._aftercreate);
	this.root._lock = false;
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign({}, oldState, newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
		this._fragment.p(changed, this._state);
		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
	}
}

function setDev(newState) {
	if (typeof newState !== 'object') {
		throw new Error(
			this._debugName + '.set was called without an object of data key-values to update.'
		);
	}

	this._checkReadOnly(newState);
	set.call(this, newState);
}

function callAll(fns) {
	while (fns && fns.length) fns.pop()();
}

function _mount(target, anchor) {
	this._fragment.m(target, anchor);
}

function _unmount() {
	if (this._fragment) this._fragment.u();
}

var protoDev = {
	destroy: destroyDev,
	get: get,
	fire: fire,
	observe: observeDev,
	on: onDev,
	set: setDev,
	teardown: destroyDev,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount
};

/* src/App.html generated by Svelte v1.51.0 */
function data() {
  return {
    firstName: '',
    lastName: ''
  };
}

var methods = {
  submit() {
    console.log('submitting');
    console.log(
      'our data: ', this.get()
    );
  }
};

function oncreate() {
  window.mdc.autoInit();
}

function create_main_fragment(state, component) {
	var main, h1, text_1, form, div, div_1, div_2, input, input_updating = false, text_2, label, text_4, div_3, text_7, div_4, div_5, input_1, input_1_updating = false, text_8, label_1, text_10, div_6, text_14, button, text_17, p;

	function input_input_handler() {
		input_updating = true;
		component.set({ firstName: input.value });
		input_updating = false;
	}

	function input_1_input_handler() {
		input_1_updating = true;
		component.set({ lastName: input_1.value });
		input_1_updating = false;
	}

	function click_handler(event) {
		component.submit();
	}

	return {
		c: function create() {
			main = createElement("main");
			h1 = createElement("h1");
			h1.textContent = "Testing";
			text_1 = createText("\n\n  ");
			form = createElement("form");
			div = createElement("div");
			div_1 = createElement("div");
			div_2 = createElement("div");
			input = createElement("input");
			text_2 = createText("\n          ");
			label = createElement("label");
			label.textContent = "First Name";
			text_4 = createText("\n          ");
			div_3 = createElement("div");
			text_7 = createText("\n\n      ");
			div_4 = createElement("div");
			div_5 = createElement("div");
			input_1 = createElement("input");
			text_8 = createText("\n          ");
			label_1 = createElement("label");
			label_1.textContent = "Last Name";
			text_10 = createText("\n          ");
			div_6 = createElement("div");
			text_14 = createText("\n\n    ");
			button = createElement("button");
			button.textContent = "Print Greeting";
			text_17 = createText("\n\n  \n  ");
			p = createElement("p");
			this.h();
		},

		h: function hydrate() {
			h1.className = "mdc-typography--display1";
			addListener(input, "input", input_input_handler);
			input.id = "firstname";
			input.type = "text";
			input.className = "mdc-text-field__input";
			label.htmlFor = "firstname";
			label.className = "mdc-text-field__label";
			div_3.className = "mdc-text-field__bottom-line";
			div_2.className = "mdc-text-field";
			div_2.dataset.mdcAutoInit = "MDCTextField";
			div_1.className = "mdc-form-field";
			addListener(input_1, "input", input_1_input_handler);
			input_1.id = "lastname";
			input_1.type = "text";
			input_1.className = "mdc-text-field__input";
			label_1.htmlFor = "lastname";
			label_1.className = "mdc-text-field__label";
			div_6.className = "mdc-text-field__bottom-line";
			div_5.className = "mdc-text-field";
			div_5.dataset.mdcAutoInit = "MDCTextField";
			div_4.className = "mdc-form-field";
			button.type = "submit";
			button.className = "mdc-button mdc-button--raised mdc-ripple-surface";
			button.dataset.mdcAutoInit = "MDCRipple";
			addListener(button, "click", click_handler);
			form.action = "#";
			form.id = "greeting-form";
			p.className = "mdc-typography--headline";
			p.id = "greeting";
		},

		m: function mount(target, anchor) {
			insertNode(main, target, anchor);
			appendNode(h1, main);
			appendNode(text_1, main);
			appendNode(form, main);
			appendNode(div, form);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			appendNode(input, div_2);

			input.value = state.firstName;

			appendNode(text_2, div_2);
			appendNode(label, div_2);
			appendNode(text_4, div_2);
			appendNode(div_3, div_2);
			appendNode(text_7, div);
			appendNode(div_4, div);
			appendNode(div_5, div_4);
			appendNode(input_1, div_5);

			input_1.value = state.lastName;

			appendNode(text_8, div_5);
			appendNode(label_1, div_5);
			appendNode(text_10, div_5);
			appendNode(div_6, div_5);
			appendNode(text_14, form);
			appendNode(button, form);
			appendNode(text_17, main);
			appendNode(p, main);
		},

		p: function update(changed, state) {
			if (!input_updating) input.value = state.firstName;
			if (!input_1_updating) input_1.value = state.lastName;
		},

		u: function unmount() {
			detachNode(main);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input_1, "input", input_1_input_handler);
			removeListener(button, "click", click_handler);
		}
	};
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data(), options.data);
	if (!('firstName' in this._state)) console.warn("<App> was created without expected data property 'firstName'");
	if (!('lastName' in this._state)) console.warn("<App> was created without expected data property 'lastName'");

	var _oncreate = oncreate.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._oncreate);
	}
}

assign(App.prototype, methods, protoDev);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

var app = new App({
  target: document.body,
  data: {}
});

return app;

}());
//# sourceMappingURL=bundle.js.map
