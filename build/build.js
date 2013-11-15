
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};

require.register("component-query/index.js", Function("exports, require, module",
"function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
  return exports;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matches\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("discore-closest/index.js", Function("exports, require, module",
"var matches = require('matches-selector')\n\
\n\
module.exports = function (element, selector, checkYoSelf, root) {\n\
  element = checkYoSelf ? element : element.parentNode\n\
  root = root || document\n\
\n\
  do {\n\
    if (matches(element, selector))\n\
      return element\n\
    // After `matches` on the edge case that\n\
    // the selector matches the root\n\
    // (when the root is not the document)\n\
    if (element === root)\n\
      return\n\
    // Make sure `element !== document`\n\
    // otherwise we get an illegal invocation\n\
  } while ((element = element.parentNode) && element !== document)\n\
}//@ sourceURL=discore-closest/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"var bind = (window.addEventListener !== undefined) ? 'addEventListener' : 'attachEvent',\n\
    unbind = (window.removeEventListener !== undefined) ? 'removeEventListener' : 'detachEvent',\n\
    prefix = (bind !== 'addEventListener') ? 'on' : '';\n\
\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  el[bind](prefix + type, fn, capture || false);\n\
\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  el[unbind](prefix + type, fn, capture || false);\n\
\n\
  return fn;\n\
};//@ sourceURL=component-event/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var closest = require('closest')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    var target = e.target || e.srcElement;\n\
    e.delegateTarget = closest(target, selector, true, el);\n\
    if (e.delegateTarget) fn.call(el, e);\n\
  }, capture);\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("object-dom-object-div-element/index.js", Function("exports, require, module",
"module.exports = require('./lib/object-div-element');\n\
//@ sourceURL=object-dom-object-div-element/index.js"
));
require.register("object-dom-object-div-element/lib/object-div-element.js", Function("exports, require, module",
"var ObjectElement = require('object-element');\n\
var supportProto = Object.getPrototypeOf({__proto__: null}) === null;\n\
\n\
module.exports = ObjectDivElement;\n\
\n\
function ObjectDivElement(element) {\n\
  element = element || document.createElement('div');\n\
  ObjectElement.call(this, element);\n\
}\n\
\n\
if (supportProto) {\n\
  ObjectDivElement.prototype.__proto__ = ObjectElement.prototype;\n\
} else {\n\
  ObjectDivElement.prototype = Object.create(ObjectElement.prototype);\n\
}\n\
\n\
ObjectDivElement.prototype.defineProperty('tag', {\n\
  get: function () {\n\
    return 'div';\n\
  }\n\
});\n\
//@ sourceURL=object-dom-object-div-element/lib/object-div-element.js"
));
require.register("object-dom-object-document/index.js", Function("exports, require, module",
"module.exports = require('./lib/object-document');\n\
//@ sourceURL=object-dom-object-document/index.js"
));
require.register("object-dom-object-document/lib/object-document.js", Function("exports, require, module",
"var ObjectElement = require('object-element');\n\
var ObjectDivElement = require('object-div-element');\n\
var slice = Array.prototype.slice;\n\
\n\
module.exports = ObjectDocument;\n\
\n\
function ObjectDocument() {\n\
\n\
}\n\
\n\
/**\n\
 * Wrap HTMLElement with ObjectElement\n\
 * @param  {HTMLElement | ObjectElement element}\n\
 * @return {ObjectElement}\n\
 */\n\
ObjectDocument.wrapElement = function (element) {\n\
  return element.OBJECT_ELEMENT ? element : new ObjectElement(element);\n\
}\n\
\n\
/**\n\
 * Loop through HTMLElements and wrap each of them with ObjectElement\n\
 * @param  {Array elements}\n\
 * @return {Array}\n\
 */\n\
ObjectDocument.wrapElements = function (elements) {\n\
  elements = slice.call(elements);\n\
\n\
  return elements.map(function (element, i) {\n\
    return ObjectDocument.wrapElement(element);\n\
  });\n\
}\n\
\n\
ObjectDocument.createElement = function (tag) {\n\
  if (tag) {\n\
    return this.wrapElement(document.createElement(tag));\n\
  } else {\n\
    return new ObjectDivElement;\n\
  }\n\
}\n\
//@ sourceURL=object-dom-object-document/lib/object-document.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // Note: when moving children, don't rely on el.children\n\
  // being 'live' to support Polymer's broken behaviour.\n\
  // See: https://github.com/component/domify/pull/23\n\
  if (1 == el.children.length) {\n\
    return el.removeChild(el.children[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.children.length) {\n\
    fragment.appendChild(el.removeChild(el.children[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("object-dom-object-element/index.js", Function("exports, require, module",
"module.exports = require('./lib/object-element');\n\
//@ sourceURL=object-dom-object-element/index.js"
));
require.register("object-dom-object-element/lib/events.js", Function("exports, require, module",
"var slice = Array.prototype.slice;\n\
\n\
module.exports = Events;\n\
\n\
function Events() {}\n\
\n\
Events.prototype.on = function (eventname, callback) {\n\
  if (typeof this.eventsRegistry[eventname] === 'undefined') {\n\
    this.eventsRegistry[eventname] = [];\n\
  }\n\
\n\
  return this.eventsRegistry[eventname].push(callback);\n\
}\n\
\n\
Events.prototype.off = function (eventname, callback) {\n\
  var i, callbacks = this.eventsRegistry[eventname];\n\
\n\
  if (typeof callbacks === 'undefined') {\n\
    return false;\n\
  }\n\
\n\
  for (i = 0; i < callbacks.length; i++) {\n\
    if (callbacks[i] === callback) {\n\
      return callbacks.splice(i, 1);\n\
    }\n\
  }\n\
\n\
  return false;\n\
}\n\
\n\
Events.prototype.trigger = function (eventname, args) {\n\
  args = slice.call(arguments);\n\
  eventname = args.shift();\n\
\n\
  var callbacks = this.eventsRegistry[eventname];\n\
  var host = this;\n\
\n\
  if (typeof callbacks === 'undefined') {\n\
    return this;\n\
  }\n\
\n\
  callbacks.forEach(function (callback, index) {\n\
    setTimeout(function () {\n\
      callback.apply(host, args);\n\
    }, 0);\n\
  });\n\
\n\
  return this;\n\
}\n\
\n\
Events.prototype.triggerSync = function (eventname, args) {\n\
  args = slice.call(arguments);\n\
  eventname = args.shift();\n\
\n\
  var callbacks = this.eventsRegistry[eventname];\n\
  var host = this;\n\
\n\
  if (typeof callbacks === 'undefined') {\n\
    return this;\n\
  }\n\
\n\
  callbacks.forEach(function (callback, index) {\n\
    callback.apply(host, args);\n\
  });\n\
\n\
  return this;\n\
}\n\
//@ sourceURL=object-dom-object-element/lib/events.js"
));
require.register("object-dom-object-element/lib/object-element.js", Function("exports, require, module",
"var domify = require('domify');\n\
var Events = require('./events');\n\
var slice = Array.prototype.slice;\n\
var supportProto = Object.getPrototypeOf({__proto__: null}) === null;\n\
\n\
module.exports = ObjectElement;\n\
\n\
function ObjectElement(element) {\n\
  Events.apply(this, arguments);\n\
\n\
  var eventsRegistry = {};\n\
\n\
  Object.defineProperty(this, 'eventsRegistry', {\n\
    get: function () {\n\
      return eventsRegistry\n\
    }\n\
  });\n\
\n\
  this.element = element;\n\
}\n\
\n\
if (supportProto) {\n\
  ObjectElement.prototype.__proto__ = Events.prototype;\n\
} else {\n\
  ObjectElement.prototype = Object.create(Events.prototype);\n\
}\n\
\n\
ObjectElement.prototype.defineProperty = function (name, defines) {\n\
  Object.defineProperty(this, name, defines);\n\
}\n\
\n\
ObjectElement.prototype.defineProperty('OBJECT_ELEMENT', {\n\
  get: function () {\n\
    return 1;\n\
  }\n\
});\n\
\n\
/**\n\
 * Shortcut to .element.id\n\
 */\n\
ObjectElement.prototype.defineProperty('id', {\n\
  get: function () {\n\
    return this.element.id;\n\
  },\n\
\n\
  set: function (value) {\n\
    this.element.id = value;\n\
  }\n\
});\n\
\n\
/**\n\
 * Get or set textContent of the element\n\
 */\n\
ObjectElement.prototype.defineProperty('text', {\n\
  get: function () {\n\
    return this.element.textContent;\n\
  },\n\
\n\
  set: function (value) {\n\
    this.element.textContent = value;\n\
  }\n\
});\n\
\n\
/**\n\
 * Get or set innerHTML of the element\n\
 */\n\
ObjectElement.prototype.defineProperty('html', {\n\
  get: function () {\n\
    return this.element.innerHTML;\n\
  },\n\
\n\
  set: function (htmlString) {\n\
    this.element.innerHTML = '';\n\
    this.element.appendChild(domify(htmlString));\n\
  }\n\
});\n\
\n\
/**\n\
 * Call a function on this element\n\
 * @param  {Function callback}\n\
 * @return {Null}\n\
 */\n\
ObjectElement.prototype.tie = function (callback) {\n\
  callback.call(this, this.element);\n\
}\n\
//@ sourceURL=object-dom-object-element/lib/object-element.js"
));
require.register("object-dom-object-element-style/index.js", Function("exports, require, module",
"module.exports = require('./lib/object-element-style');\n\
//@ sourceURL=object-dom-object-element-style/index.js"
));
require.register("object-dom-object-element-style/lib/object-element-style.js", Function("exports, require, module",
"var ObjectElement = require('object-element');\n\
\n\
/**\n\
 * Shortcut to .element.style\n\
 */\n\
ObjectElement.prototype.defineProperty('style', {\n\
  get: function () {\n\
    return this.element.style;\n\
  }\n\
});\n\
\n\
/**\n\
 * Get element's visibility state\n\
 */\n\
ObjectElement.prototype.defineProperty('hidden', {\n\
  get: function () {\n\
    return this.element.style.display === 'none' ? true : false;\n\
  }\n\
});\n\
\n\
/**\n\
 * Get or set element's opacity\n\
 */\n\
ObjectElement.prototype.defineProperty('opacity', {\n\
  get: function () {\n\
    return parseInt(this.element.style.opacity, 10);\n\
  },\n\
\n\
  set: function (value) {\n\
    this.element.style.opacity = value;\n\
  }\n\
});\n\
\n\
/**\n\
 * Get or set element's width\n\
 */\n\
ObjectElement.prototype.defineProperty('width', {\n\
  get: function () {\n\
    return this.element.offsetWidth;\n\
  },\n\
\n\
  set: function (value) {\n\
    this.style.width = value + 'px';\n\
  }\n\
});\n\
\n\
/**\n\
 * Get or set element's height\n\
 */\n\
ObjectElement.prototype.defineProperty('height', {\n\
  get: function () {\n\
    return this.element.offsetHeight;\n\
  },\n\
\n\
  set: function (value) {\n\
    this.style.height = value + 'px';\n\
  }\n\
});\n\
\n\
/**\n\
 * Display element in DOM\n\
 */\n\
ObjectElement.prototype.show = function () {\n\
  if (this.element.style.display === 'none') {\n\
    this.element.style.display = '';\n\
  } else {\n\
    this.element.style.display = 'block';\n\
  }\n\
}\n\
\n\
ObjectElement.prototype.displayBlock = function () {\n\
  this.element.style.display = 'block';  \n\
}\n\
\n\
ObjectElement.prototype.displayNone = function () {\n\
  this.element.style.display = 'none';  \n\
}\n\
\n\
/**\n\
 * Hide element in DOM\n\
 */\n\
ObjectElement.prototype.hide = function () {\n\
  this.element.style.display = 'none';\n\
}\n\
\n\
/**\n\
 * Get or set element's tyle\n\
 * @param  [String name]\n\
 * @param  [String value]\n\
 * @return {[type]}\n\
 */\n\
ObjectElement.prototype.css = function (name, value) {\n\
  if (arguments.length === 0) {\n\
    return this.element.style;\n\
  }\n\
\n\
  if (arguments.length === 1) {\n\
    return this.element.style[name];\n\
  }\n\
\n\
  if (arguments.length === 2) {\n\
    this.style[name] = value;\n\
  }\n\
}\n\
\n\
ObjectElement.prototype.hasClass = function (name) {\n\
  return this.element.classList.contains(name);\n\
}\n\
\n\
ObjectElement.prototype.addClass = function (name) {\n\
  this.triggerSync('add-class', name);\n\
  this.element.classList.add(name);\n\
  this.trigger('added-class', name);\n\
}\n\
\n\
ObjectElement.prototype.removeClass = function (name) {\n\
  this.triggerSync('remove-class', name);\n\
  this.element.classList.remove(name);\n\
  this.trigger('removed-class', name);\n\
}\n\
\n\
ObjectElement.prototype.toggleClass = function (name) {\n\
  this.triggerSync('toggle-class', name);\n\
\n\
  if (this.hasClass(name)) {\n\
    this.removeClass(name);\n\
  } else {\n\
    this.addClass(name);\n\
  }\n\
\n\
  this.trigger('toggled-class', name);\n\
}\n\
//@ sourceURL=object-dom-object-element-style/lib/object-element-style.js"
));
require.register("object-dom-object-element-attribute/index.js", Function("exports, require, module",
"module.exports = require('./lib/object-element-attribute');\n\
//@ sourceURL=object-dom-object-element-attribute/index.js"
));
require.register("object-dom-object-element-attribute/lib/object-element-attribute.js", Function("exports, require, module",
"var ObjectElement = require('object-element');\n\
\n\
ObjectElement.prototype.hasAttribute = function (name) {\n\
  return this.element.hasAttribute(name);\n\
}\n\
\n\
ObjectElement.prototype.hasAttributes = function () {\n\
  return this.element.hasAttributes();\n\
}\n\
\n\
ObjectElement.prototype.getAttribute = function (name) {\n\
  return this.element.getAttribute(name);\n\
}\n\
\n\
ObjectElement.prototype.setAttribute = function (name, value) {\n\
  return this.element.setAttribute(name, value);\n\
}\n\
\n\
ObjectElement.prototype.removeAttribute = function (name) {\n\
  return this.element.removeAttribute(name);\n\
}\n\
//@ sourceURL=object-dom-object-element-attribute/lib/object-element-attribute.js"
));
require.register("object-dom-object-element-selection/index.js", Function("exports, require, module",
"module.exports = require('./lib/object-element-selection');\n\
//@ sourceURL=object-dom-object-element-selection/index.js"
));
require.register("object-dom-object-element-selection/lib/object-element-selection.js", Function("exports, require, module",
"var ObjectElement = require('object-element');\n\
var ObjectDocument = require('object-document');\n\
var slice = Array.prototype.slice;\n\
\n\
/**\n\
 * Match the element against the selector\n\
 * @param  {ObjectElement | Element element}\n\
 * @param  {String selector}\n\
 * @return {Boolean}\n\
 */\n\
function match(element, selector) {\n\
  element = element.OBJECT_ELEMENT ? element.element : element;\n\
\n\
  var matchesSelector = element.webkitMatchesSelector \n\
    || element.mozMatchesSelector \n\
    || element.oMatchesSelector \n\
    || element.matchesSelector;\n\
\n\
  return matchesSelector.call(element, selector);\n\
}\n\
\n\
/**\n\
 * Loop through all elements and match theme against th selector\n\
 * @param  {Array elements}\n\
 * @param  {String selector}\n\
 * @return {Array elements}\n\
 */\n\
function matchAll(elements, selector) {\n\
  return elements.filter(function (element, i) {\n\
    return match(element, selector);\n\
  });\n\
}\n\
\n\
/**\n\
 * Loop through each element and return the first matched element\n\
 * @param  {Array elements}\n\
 * @param  {String selector}\n\
 * @return {Element | Null}\n\
 */\n\
function matchFirst(elements, selector) {\n\
  var i;\n\
\n\
  for (i = 0; i < elements.length; i++) {\n\
    if (match(elements[i], selector)) {\n\
      return elements[i];\n\
    }\n\
  }\n\
\n\
  return null;\n\
}\n\
\n\
/**\n\
 * Loop through each element and return the last matched element\n\
 * @param  {Array elements}\n\
 * @param  {String selector}\n\
 * @return {Element | Null}\n\
 */\n\
function matchLast(elements, selector) {\n\
  /**\n\
   * Clone an array of the elements reference first\n\
   */\n\
  return matchFirst(elements.slice().reverse(), selector);\n\
}\n\
\n\
/**\n\
 * Return an array containing ELEMENT_NODE from ndoes\n\
 * @param  {NodeList nodes}\n\
 * @return {Array}\n\
 */\n\
function elementNodesOf(nodes) {\n\
  return slice.call(nodes).map(function (node, i) {\n\
    if (node.nodeType === 1) {\n\
      return node;\n\
    }\n\
  });\n\
}\n\
\n\
ObjectElement.prototype.defineProperty('ancestors', {\n\
  get: function () {\n\
    var ancestors = [],\n\
        parent = this.parent;\n\
\n\
    while (parent && (parent.nodeType !== parent.DOCUMENT_NODE)) {\n\
      ancestors.push(parent);\n\
      parent = parent.parentNode;\n\
    }\n\
\n\
    return ancestors;\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('parent', {\n\
  get: function () {\n\
    return ObjectDocument.wrapElement(this.element.parentNode);\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('firstSibling', {\n\
  get: function () {\n\
    return ObjectDocument.wrapElement(this.parent).firstChild;\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('lastSibling', {\n\
  get: function () {\n\
    return ObjectDocument.wrapElement(this.parent).lastChild;\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('prevSibling', {\n\
  get: function () {\n\
    var prev;\n\
\n\
    if ('previousElementSibling' in this.element) {\n\
      prev = this.element.previousElementSibling;\n\
    } else {\n\
      prev = this.element.previousSibling;\n\
\n\
      while (prev && prev.nodeType !== prev.ELEMENT_NODE) {\n\
        prev = prev.previousSibling;\n\
      }\n\
    }\n\
\n\
    return prev ? ObjectDocument.wrapElement(prev) : null;\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('nextSibling', {\n\
  get: function () {\n\
    var next;\n\
    if ('nextElementSibling' in this.element) {\n\
      next = this.element.nextElementSibling;\n\
    } else {\n\
      next = this.element.nextSibling;\n\
\n\
      while (next && next.nodeType !== next.ELEMENT_NODE) {\n\
        next = next.nextSibling;\n\
      }\n\
    }\n\
\n\
    return next ? ObjectDocument.wrapElement(next) : null;\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('prevSiblings', {\n\
  get: function () {\n\
    var prevs = [];\n\
    var prev = this.prevSibling;\n\
\n\
    while (prev) {\n\
      prevs.push(prev);\n\
      prev = prev.prevSibling;\n\
    }\n\
\n\
    return prevs.reverse();\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('nextSiblings', {\n\
  get: function () {\n\
    var nexts = [];\n\
    var next = this.nextSibling;\n\
\n\
    while (next) {\n\
      nexts.push(next);\n\
      next = next.nextSibling;\n\
    }\n\
\n\
    return nexts;\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('siblings', {\n\
  get: function () {\n\
    return this.prevSiblings.concat(this.nextSiblings);\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('firstChild', {\n\
  get: function () {\n\
    var first;\n\
\n\
    if ('firstElementChild' in this.element) {\n\
      first = this.element.firstElementChild;\n\
    } else {\n\
      first = this.element.firstChild;\n\
\n\
      while (first && first.nodeType !== first.ELEMENT_NODE) {\n\
        first = first.nextSibling;\n\
      }\n\
    }\n\
\n\
    return first ? ObjectDocument.wrapElement(first) : null;\n\
  }\n\
});\n\
\n\
ObjectElement.prototype.defineProperty('lastChild', {\n\
  get: function () {\n\
    var last;\n\
\n\
    if ('lastElementChild' in this.element) {\n\
      last = this.element.lastElementChild;\n\
    } else {\n\
      last = this.element.lastChild;\n\
\n\
      while (last && last.nodeType !== last.ELEMENT_NODE) {\n\
        last = last.previousSibling;\n\
      }\n\
    }\n\
\n\
    return last ? ObjectDocument.wrapElement(last) : null;\n\
  }\n\
});\n\
\n\
/**\n\
 * Get the fist level child elements\n\
 * @param  {[type] element}\n\
 * @return {[type]}\n\
 */\n\
ObjectElement.prototype.defineProperty('children', {\n\
  get: function () {\n\
    var children;\n\
\n\
    if ('children' in this.element) {\n\
      children = slice.call(this.element.children);\n\
    } else {\n\
      children = slice.call(this.element.childNodes).map(function (node, i) {\n\
        if (node.nodeType === node.ELEMENT_NODE) {\n\
          return node;\n\
        }\n\
      });\n\
    }\n\
\n\
    if (children.length === 0) {\n\
      return children;\n\
    }\n\
\n\
    return ObjectDocument.wrapElements(children);\n\
  }\n\
});\n\
\n\
/** #TODO */\n\
ObjectElement.prototype.defineProperty('descendants', {\n\
  get: function () {\n\
\n\
  }\n\
});\n\
\n\
/**\n\
 * Matching the element against selector\n\
 * @param  {String selector}\n\
 * @return {Boolean}\n\
 */\n\
ObjectElement.prototype.match = function (selector) {\n\
  var matchesSelector = this.element.matchesSelector \n\
    || this.element.webkitMatchesSelector \n\
    || this.element.mozMatchesSelector \n\
    || this.element.oMatchesSelector;\n\
\n\
  return matchesSelector.call(this.element, selector);\n\
}\n\
\n\
/** Selection methods */\n\
\n\
ObjectElement.prototype.selectFirstSibling = function (selector) {\n\
  \n\
}\n\
\n\
ObjectElement.prototype.selectLastSibling = function (selector) {\n\
  \n\
}\n\
\n\
ObjectElement.prototype.selectPrevSibling = function (selector) {\n\
  var prev = matchLast(this.prevSiblings, selector);\n\
\n\
  if (prev === null) {\n\
    return prev;\n\
  }\n\
\n\
  return ObjectDocument.wrapElement(prev);\n\
}\n\
\n\
ObjectElement.prototype.selectNextSibling = function (selector) {\n\
  var next = matchFirst(this.nextSiblings, selector);\n\
\n\
  if (next === null) {\n\
    return next;\n\
  }\n\
\n\
  return ObjectDocument.wrapElement(next);\n\
}\n\
\n\
/**\n\
 * Alias of .selectPrevSibling()\n\
 */\n\
ObjectElement.prototype.prev = ObjectElement.prototype.selectPrevSibling;\n\
\n\
/**\n\
 * Alias of .selectNextSibling()\n\
 */\n\
ObjectElement.prototype.next = ObjectElement.prototype.selectNextSibling;\n\
\n\
ObjectElement.prototype.selectPrevSiblings = function (selector) {\n\
  var prevs = matchAll(this.prevSiblings, selector);\n\
\n\
  if (prevs.length === 0) {\n\
    return prevs;\n\
  }\n\
\n\
  return ObjectDocument.wrapElements(prevs);\n\
}\n\
\n\
ObjectElement.prototype.selectNextSiblings = function (selector) {\n\
  var nexts = matchAll(this.nextSiblings, selector);\n\
\n\
  if (nexts.length === 0) {\n\
    return nexts;\n\
  }\n\
\n\
  return ObjectDocument.wrapElements(nexts);\n\
}\n\
\n\
ObjectElement.prototype.selectSiblings = function (selector) {\n\
  return this.selectPrevSiblings(selector).concat(this.selectNextSiblings(selector));\n\
}\n\
\n\
/**\n\
 * Select element's child elements by selector or not\n\
 * @param  {String selector}\n\
 * @return {Array}\n\
 */\n\
ObjectElement.prototype.selectChildren = function (selector) {\n\
  var children = this.children;\n\
\n\
  if (children.length && selector) {\n\
    children = matchAll(children, selector);\n\
  }\n\
\n\
  if (children.length === 0) {\n\
    return children;\n\
  }\n\
\n\
  return ObjectDocument.wrapElements(children);\n\
}\n\
\n\
/**\n\
 * Get first child element by selector or not\n\
 * @param  {String selector}\n\
 * @return {ObjectElement}\n\
 */\n\
ObjectElement.prototype.selectFirstChild = function (selector) {\n\
  return ObjectDocument.wrapElement(matchFirst(this.children, selector));\n\
}\n\
\n\
/**\n\
 * Get last child element by the selector or not\n\
 * @param  {String selector}\n\
 * @return {ObjectElement}\n\
 */\n\
ObjectElement.prototype.selectLastChild = function (selector) {\n\
  return ObjectDocument.wrapElement(matchLast(this.children, selector));\n\
}\n\
\n\
/**\n\
 * Select all elements descended from the element that match the selector\n\
 * @param  {String selector}\n\
 * @return {Array}\n\
 */\n\
ObjectElement.prototype.select = function (selector) {\n\
  var nodeList = slice.call(this.element.querySelectorAll(selector));\n\
\n\
  if (nodeList.length === 0) {\n\
    return [];\n\
  }\n\
\n\
  return ObjectDocument.wrapElements(nodeList);\n\
}\n\
\n\
/**\n\
 * Select the first element descended from the element that matchs the selector\n\
 * @param  {String selector}\n\
 * @return {ObjectElement | null}\n\
 */\n\
ObjectElement.prototype.selectFirst = function (selector) {\n\
  var element = this.element.querySelector(selector);\n\
\n\
  if (element === null) {\n\
    return null;\n\
  }\n\
\n\
  return ObjectDocument.wrapElement(element);\n\
}\n\
\n\
/**\n\
 * Select the last element descended from the element that matchs the selector\n\
 * @param  {String selector}\n\
 * @return {ObjectElement | null}\n\
 */\n\
ObjectElement.prototype.selectLast = function (selector) {\n\
  var elements = this.select(selector);\n\
\n\
  if (elements.length === 0) {\n\
    return null;\n\
  }\n\
\n\
  return ObjectDocument.wrapElement(elements.pop());\n\
}\n\
//@ sourceURL=object-dom-object-element-selection/lib/object-element-selection.js"
));
require.register("shallker-live-data/index.js", Function("exports, require, module",
"require('object-element-attribute');\n\
require('object-element-selection');\n\
require('object-element-style');\n\
\n\
module.exports = require('./lib/live-data');\n\
//@ sourceURL=shallker-live-data/index.js"
));
require.register("shallker-live-data/lib/live-data.js", Function("exports, require, module",
"var delegate = require('delegate');\n\
var ObjectDocument = require('object-document');\n\
\n\
delegate.bind(document, '[data-click-toggle-class]', 'click', onClickToggleClass);\n\
delegate.bind(document, '[data-click-add-class]', 'click', onClickAddClass);\n\
\n\
function onClickToggleClass(click) {\n\
  var target = ObjectDocument.wrapElement(click.delegateTarget);\n\
  var className = target.getAttribute('data-click-toggle-class');\n\
\n\
  var solitary = (function () {\n\
    if (target.hasAttribute('data-behaviour')) {\n\
      if (target.getAttribute('data-behaviour') === 'solitary') {\n\
        return true;\n\
      } else {\n\
        return false;\n\
      }\n\
    } else {\n\
      return false;\n\
    }\n\
  })();\n\
\n\
  target.toggleClass(className);\n\
\n\
  if (solitary) {\n\
    target.siblings.forEach(function (sibling) {\n\
      sibling.removeClass(className);\n\
    });\n\
  }\n\
}\n\
\n\
function onClickAddClass(click) {\n\
  var target = ObjectDocument.wrapElement(click.delegateTarget);\n\
  var className = target.getAttribute('data-click-add-class');\n\
\n\
  var solitary = (function () {\n\
    if (target.hasAttribute('data-behaviour')) {\n\
      if (target.getAttribute('data-behaviour') === 'solitary') {\n\
        return true;\n\
      } else {\n\
        return false;\n\
      }\n\
    } else {\n\
      return false;\n\
    }\n\
  })();\n\
\n\
  target.addClass(className);\n\
\n\
  if (solitary) {\n\
    target.siblings.forEach(function (sibling) {\n\
      sibling.removeClass(className);\n\
    });\n\
  }\n\
}\n\
//@ sourceURL=shallker-live-data/lib/live-data.js"
));




















require.alias("shallker-live-data/index.js", "left-menu/deps/live-data/index.js");
require.alias("shallker-live-data/lib/live-data.js", "left-menu/deps/live-data/lib/live-data.js");
require.alias("shallker-live-data/index.js", "left-menu/deps/live-data/index.js");
require.alias("shallker-live-data/index.js", "live-data/index.js");
require.alias("component-delegate/index.js", "shallker-live-data/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("object-dom-object-document/index.js", "shallker-live-data/deps/object-document/index.js");
require.alias("object-dom-object-document/lib/object-document.js", "shallker-live-data/deps/object-document/lib/object-document.js");
require.alias("object-dom-object-document/index.js", "shallker-live-data/deps/object-document/index.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-document/deps/object-element/index.js");
require.alias("object-dom-object-element/lib/events.js", "object-dom-object-document/deps/object-element/lib/events.js");
require.alias("object-dom-object-element/lib/object-element.js", "object-dom-object-document/deps/object-element/lib/object-element.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-document/deps/object-element/index.js");
require.alias("component-domify/index.js", "object-dom-object-element/deps/domify/index.js");

require.alias("object-dom-object-element/index.js", "object-dom-object-element/index.js");
require.alias("object-dom-object-div-element/index.js", "object-dom-object-document/deps/object-div-element/index.js");
require.alias("object-dom-object-div-element/lib/object-div-element.js", "object-dom-object-document/deps/object-div-element/lib/object-div-element.js");
require.alias("object-dom-object-div-element/index.js", "object-dom-object-document/deps/object-div-element/index.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-div-element/deps/object-element/index.js");
require.alias("object-dom-object-element/lib/events.js", "object-dom-object-div-element/deps/object-element/lib/events.js");
require.alias("object-dom-object-element/lib/object-element.js", "object-dom-object-div-element/deps/object-element/lib/object-element.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-div-element/deps/object-element/index.js");
require.alias("component-domify/index.js", "object-dom-object-element/deps/domify/index.js");

require.alias("object-dom-object-element/index.js", "object-dom-object-element/index.js");
require.alias("object-dom-object-div-element/index.js", "object-dom-object-div-element/index.js");
require.alias("object-dom-object-document/index.js", "object-dom-object-document/index.js");
require.alias("object-dom-object-element/index.js", "shallker-live-data/deps/object-element/index.js");
require.alias("object-dom-object-element/lib/events.js", "shallker-live-data/deps/object-element/lib/events.js");
require.alias("object-dom-object-element/lib/object-element.js", "shallker-live-data/deps/object-element/lib/object-element.js");
require.alias("object-dom-object-element/index.js", "shallker-live-data/deps/object-element/index.js");
require.alias("component-domify/index.js", "object-dom-object-element/deps/domify/index.js");

require.alias("object-dom-object-element/index.js", "object-dom-object-element/index.js");
require.alias("object-dom-object-element-style/index.js", "shallker-live-data/deps/object-element-style/index.js");
require.alias("object-dom-object-element-style/lib/object-element-style.js", "shallker-live-data/deps/object-element-style/lib/object-element-style.js");
require.alias("object-dom-object-element-style/index.js", "shallker-live-data/deps/object-element-style/index.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-element-style/deps/object-element/index.js");
require.alias("object-dom-object-element/lib/events.js", "object-dom-object-element-style/deps/object-element/lib/events.js");
require.alias("object-dom-object-element/lib/object-element.js", "object-dom-object-element-style/deps/object-element/lib/object-element.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-element-style/deps/object-element/index.js");
require.alias("component-domify/index.js", "object-dom-object-element/deps/domify/index.js");

require.alias("object-dom-object-element/index.js", "object-dom-object-element/index.js");
require.alias("object-dom-object-element-style/index.js", "object-dom-object-element-style/index.js");
require.alias("object-dom-object-element-attribute/index.js", "shallker-live-data/deps/object-element-attribute/index.js");
require.alias("object-dom-object-element-attribute/lib/object-element-attribute.js", "shallker-live-data/deps/object-element-attribute/lib/object-element-attribute.js");
require.alias("object-dom-object-element-attribute/index.js", "shallker-live-data/deps/object-element-attribute/index.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-element-attribute/deps/object-element/index.js");
require.alias("object-dom-object-element/lib/events.js", "object-dom-object-element-attribute/deps/object-element/lib/events.js");
require.alias("object-dom-object-element/lib/object-element.js", "object-dom-object-element-attribute/deps/object-element/lib/object-element.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-element-attribute/deps/object-element/index.js");
require.alias("component-domify/index.js", "object-dom-object-element/deps/domify/index.js");

require.alias("object-dom-object-element/index.js", "object-dom-object-element/index.js");
require.alias("object-dom-object-element-attribute/index.js", "object-dom-object-element-attribute/index.js");
require.alias("object-dom-object-element-selection/index.js", "shallker-live-data/deps/object-element-selection/index.js");
require.alias("object-dom-object-element-selection/lib/object-element-selection.js", "shallker-live-data/deps/object-element-selection/lib/object-element-selection.js");
require.alias("object-dom-object-element-selection/index.js", "shallker-live-data/deps/object-element-selection/index.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-element-selection/deps/object-element/index.js");
require.alias("object-dom-object-element/lib/events.js", "object-dom-object-element-selection/deps/object-element/lib/events.js");
require.alias("object-dom-object-element/lib/object-element.js", "object-dom-object-element-selection/deps/object-element/lib/object-element.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-element-selection/deps/object-element/index.js");
require.alias("component-domify/index.js", "object-dom-object-element/deps/domify/index.js");

require.alias("object-dom-object-element/index.js", "object-dom-object-element/index.js");
require.alias("object-dom-object-document/index.js", "object-dom-object-element-selection/deps/object-document/index.js");
require.alias("object-dom-object-document/lib/object-document.js", "object-dom-object-element-selection/deps/object-document/lib/object-document.js");
require.alias("object-dom-object-document/index.js", "object-dom-object-element-selection/deps/object-document/index.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-document/deps/object-element/index.js");
require.alias("object-dom-object-element/lib/events.js", "object-dom-object-document/deps/object-element/lib/events.js");
require.alias("object-dom-object-element/lib/object-element.js", "object-dom-object-document/deps/object-element/lib/object-element.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-document/deps/object-element/index.js");
require.alias("component-domify/index.js", "object-dom-object-element/deps/domify/index.js");

require.alias("object-dom-object-element/index.js", "object-dom-object-element/index.js");
require.alias("object-dom-object-div-element/index.js", "object-dom-object-document/deps/object-div-element/index.js");
require.alias("object-dom-object-div-element/lib/object-div-element.js", "object-dom-object-document/deps/object-div-element/lib/object-div-element.js");
require.alias("object-dom-object-div-element/index.js", "object-dom-object-document/deps/object-div-element/index.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-div-element/deps/object-element/index.js");
require.alias("object-dom-object-element/lib/events.js", "object-dom-object-div-element/deps/object-element/lib/events.js");
require.alias("object-dom-object-element/lib/object-element.js", "object-dom-object-div-element/deps/object-element/lib/object-element.js");
require.alias("object-dom-object-element/index.js", "object-dom-object-div-element/deps/object-element/index.js");
require.alias("component-domify/index.js", "object-dom-object-element/deps/domify/index.js");

require.alias("object-dom-object-element/index.js", "object-dom-object-element/index.js");
require.alias("object-dom-object-div-element/index.js", "object-dom-object-div-element/index.js");
require.alias("object-dom-object-document/index.js", "object-dom-object-document/index.js");
require.alias("object-dom-object-element-selection/index.js", "object-dom-object-element-selection/index.js");
require.alias("shallker-live-data/index.js", "shallker-live-data/index.js");
