
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
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
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
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("visionmedia-configurable.js/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Make `obj` configurable.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object} the `obj`\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj){\n\
\n\
  /**\n\
   * Mixin settings.\n\
   */\n\
\n\
  obj.settings = {};\n\
\n\
  /**\n\
   * Set config `name` to `val`, or\n\
   * multiple with an object.\n\
   *\n\
   * @param {String|Object} name\n\
   * @param {Mixed} val\n\
   * @return {Object} self\n\
   * @api public\n\
   */\n\
\n\
  obj.set = function(name, val){\n\
    if (1 == arguments.length) {\n\
      for (var key in name) {\n\
        this.set(key, name[key]);\n\
      }\n\
    } else {\n\
      this.settings[name] = val;\n\
    }\n\
\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Get setting `name`.\n\
   *\n\
   * @param {String} name\n\
   * @return {Mixed}\n\
   * @api public\n\
   */\n\
\n\
  obj.get = function(name){\n\
    return this.settings[name];\n\
  };\n\
\n\
  /**\n\
   * Enable `name`.\n\
   *\n\
   * @param {String} name\n\
   * @return {Object} self\n\
   * @api public\n\
   */\n\
\n\
  obj.enable = function(name){\n\
    return this.set(name, true);\n\
  };\n\
\n\
  /**\n\
   * Disable `name`.\n\
   *\n\
   * @param {String} name\n\
   * @return {Object} self\n\
   * @api public\n\
   */\n\
\n\
  obj.disable = function(name){\n\
    return this.set(name, false);\n\
  };\n\
\n\
  /**\n\
   * Check if `name` is enabled.\n\
   *\n\
   * @param {String} name\n\
   * @return {Boolean}\n\
   * @api public\n\
   */\n\
\n\
  obj.enabled = function(name){\n\
    return !! this.get(name);\n\
  };\n\
\n\
  /**\n\
   * Check if `name` is disabled.\n\
   *\n\
   * @param {String} name\n\
   * @return {Boolean}\n\
   * @api public\n\
   */\n\
\n\
  obj.disabled = function(name){\n\
    return ! this.get(name);\n\
  };\n\
\n\
  return obj;\n\
};//@ sourceURL=visionmedia-configurable.js/index.js"
));
require.register("component-stack/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `stack()`.\n\
 */\n\
\n\
module.exports = stack;\n\
\n\
/**\n\
 * Return the stack.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
function stack() {\n\
  var orig = Error.prepareStackTrace;\n\
  Error.prepareStackTrace = function(_, stack){ return stack; };\n\
  var err = new Error;\n\
  Error.captureStackTrace(err, arguments.callee);\n\
  var stack = err.stack;\n\
  Error.prepareStackTrace = orig;\n\
  return stack;\n\
}//@ sourceURL=component-stack/index.js"
));
require.register("jkroso-type/index.js", Function("exports, require, module",
"\n\
/**\n\
 * refs\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(v){\n\
  // .toString() is slow so try avoid it\n\
  return typeof v === 'object'\n\
    ? types[toString.call(v)]\n\
    : typeof v\n\
};\n\
\n\
var types = {\n\
  '[object Function]': 'function',\n\
  '[object Date]': 'date',\n\
  '[object RegExp]': 'regexp',\n\
  '[object Arguments]': 'arguments',\n\
  '[object Array]': 'array',\n\
  '[object String]': 'string',\n\
  '[object Null]': 'null',\n\
  '[object Undefined]': 'undefined',\n\
  '[object Number]': 'number',\n\
  '[object Boolean]': 'boolean',\n\
  '[object Object]': 'object',\n\
  '[object Text]': 'textnode',\n\
  '[object Uint8Array]': '8bit-array',\n\
  '[object Uint16Array]': '16bit-array',\n\
  '[object Uint32Array]': '32bit-array',\n\
  '[object Uint8ClampedArray]': '8bit-array',\n\
  '[object Error]': 'error'\n\
}\n\
\n\
if (typeof window != 'undefined') {\n\
  for (var el in window) if (/^HTML\\w+Element$/.test(el)) {\n\
    types['[object '+el+']'] = 'element'\n\
  }\n\
}\n\
\n\
module.exports.types = types\n\
//@ sourceURL=jkroso-type/index.js"
));
require.register("jkroso-equals/index.js", Function("exports, require, module",
"\n\
var type = require('type')\n\
\n\
/**\n\
 * assert all values are equal\n\
 *\n\
 * @param {Any} [...]\n\
 * @return {Boolean}\n\
 */\n\
\n\
module.exports = function(){\n\
\tvar i = arguments.length - 1\n\
\twhile (i > 0) {\n\
\t\tif (!compare(arguments[i], arguments[--i])) return false\n\
\t}\n\
\treturn true\n\
}\n\
\n\
// (any, any, [array]) -> boolean\n\
function compare(a, b, memos){\n\
\t// All identical values are equivalent\n\
\tif (a === b) return true\n\
\tvar fnA = types[type(a)]\n\
\tif (fnA !== types[type(b)]) return false\n\
\treturn fnA ? fnA(a, b, memos) : false\n\
}\n\
\n\
var types = {}\n\
\n\
// (Number) -> boolean\n\
types.number = function(a){\n\
\t// NaN check\n\
\treturn a !== a\n\
}\n\
\n\
// (function, function, array) -> boolean\n\
types['function'] = function(a, b, memos){\n\
\treturn a.toString() === b.toString()\n\
\t\t// Functions can act as objects\n\
\t  && types.object(a, b, memos) \n\
\t\t&& compare(a.prototype, b.prototype)\n\
}\n\
\n\
// (date, date) -> boolean\n\
types.date = function(a, b){\n\
\treturn +a === +b\n\
}\n\
\n\
// (regexp, regexp) -> boolean\n\
types.regexp = function(a, b){\n\
\treturn a.toString() === b.toString()\n\
}\n\
\n\
// (DOMElement, DOMElement) -> boolean\n\
types.element = function(a, b){\n\
\treturn a.outerHTML === b.outerHTML\n\
}\n\
\n\
// (textnode, textnode) -> boolean\n\
types.textnode = function(a, b){\n\
\treturn a.textContent === b.textContent\n\
}\n\
\n\
// decorate `fn` to prevent it re-checking objects\n\
// (function) -> function\n\
function memoGaurd(fn){\n\
\treturn function(a, b, memos){\n\
\t\tif (!memos) return fn(a, b, [])\n\
\t\tvar i = memos.length, memo\n\
\t\twhile (memo = memos[--i]) {\n\
\t\t\tif (memo[0] === a && memo[1] === b) return true\n\
\t\t}\n\
\t\treturn fn(a, b, memos)\n\
\t}\n\
}\n\
\n\
types['arguments'] =\n\
types.array = memoGaurd(compareArrays)\n\
\n\
// (array, array, array) -> boolean\n\
function compareArrays(a, b, memos){\n\
\tvar i = a.length\n\
\tif (i !== b.length) return false\n\
\tmemos.push([a, b])\n\
\twhile (i--) {\n\
\t\tif (!compare(a[i], b[i], memos)) return false\n\
\t}\n\
\treturn true\n\
}\n\
\n\
types.object = memoGaurd(compareObjects)\n\
\n\
// (object, object, array) -> boolean\n\
function compareObjects(a, b, memos) {\n\
\tvar ka = getEnumerableProperties(a)\n\
\tvar kb = getEnumerableProperties(b)\n\
\tvar i = ka.length\n\
\n\
\t// same number of properties\n\
\tif (i !== kb.length) return false\n\
\n\
\t// although not necessarily the same order\n\
\tka.sort()\n\
\tkb.sort()\n\
\n\
\t// cheap key test\n\
\twhile (i--) if (ka[i] !== kb[i]) return false\n\
\n\
\t// remember\n\
\tmemos.push([a, b])\n\
\n\
\t// iterate again this time doing a thorough check\n\
\ti = ka.length\n\
\twhile (i--) {\n\
\t\tvar key = ka[i]\n\
\t\tif (!compare(a[key], b[key], memos)) return false\n\
\t}\n\
\n\
\treturn true\n\
}\n\
\n\
// (object) -> array\n\
function getEnumerableProperties (object) {\n\
\tvar result = []\n\
\tfor (var k in object) if (k !== 'constructor') {\n\
\t\tresult.push(k)\n\
\t}\n\
\treturn result\n\
}\n\
\n\
// expose compare\n\
module.exports.compare = compare\n\
//@ sourceURL=jkroso-equals/index.js"
));
require.register("component-assert/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var stack = require('stack');\n\
var equals = require('equals');\n\
\n\
/**\n\
 * Assert `expr` with optional failure `msg`.\n\
 *\n\
 * @param {Mixed} expr\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
module.exports = exports = function (expr, msg) {\n\
  if (expr) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is weak equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.equal = function (actual, expected, msg) {\n\
  if (actual == expected) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not weak equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notEqual = function (actual, expected, msg) {\n\
  if (actual != expected) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is deep equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.deepEqual = function (actual, expected, msg) {\n\
  if (equals(actual, expected)) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not deep equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notDeepEqual = function (actual, expected, msg) {\n\
  if (!equals(actual, expected)) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is strict equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.strictEqual = function (actual, expected, msg) {\n\
  if (actual === expected) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not strict equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notStrictEqual = function (actual, expected, msg) {\n\
  if (actual !== expected) return;\n\
  throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `block` throws an `error`.\n\
 *\n\
 * @param {Function} block\n\
 * @param {Function} [error]\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.throws = function (block, error, msg) {\n\
  var err;\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    err = e;\n\
  }\n\
  if (!err) throw new Error(msg || message());\n\
  if (error && !(err instanceof error)) throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Assert `block` doesn't throw an `error`.\n\
 *\n\
 * @param {Function} block\n\
 * @param {Function} [error]\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.doesNotThrow = function (block, error, msg) {\n\
  var err;\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    err = e;\n\
  }\n\
  if (error && (err instanceof error)) throw new Error(msg || message());\n\
  if (err) throw new Error(msg || message());\n\
};\n\
\n\
/**\n\
 * Create a message from the call stack.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function message() {\n\
  if (!Error.captureStackTrace) return 'assertion failed';\n\
  var callsite = stack()[2];\n\
  var fn = callsite.getFunctionName();\n\
  var file = callsite.getFileName();\n\
  var line = callsite.getLineNumber() - 1;\n\
  var col = callsite.getColumnNumber() - 1;\n\
  var src = getScript(file);\n\
  line = src.split('\\n\
')[line].slice(col);\n\
  var m = line.match(/assert\\((.*)\\)/);\n\
  return m && m[1].trim();\n\
}\n\
\n\
/**\n\
 * Load contents of `script`.\n\
 *\n\
 * @param {String} script\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function getScript(script) {\n\
  var xhr = new XMLHttpRequest;\n\
  xhr.open('GET', script, false);\n\
  xhr.send(null);\n\
  return xhr.responseText;\n\
}\n\
//@ sourceURL=component-assert/index.js"
));
require.register("tengine/index.js", Function("exports, require, module",
"/**\n\
 * Module dependence\n\
 */\n\
\n\
\n\
var domify       = require('domify')\n\
  , Configurable = require('configurable.js');\n\
\n\
Configurable(Tengine.prototype);\n\
\n\
function Tengine (data){\n\
  if(typeof data !== 'object' && null !== data) throw new TypeError('object expected.');\n\
  this._data = data;\n\
}\n\
\n\
Tengine.prototype.compile = function(doc){\n\
  this.reg = this.get('symble') || /.*{{\\s*|\\s*}}.*/g; \n\
  doc = typeof doc === 'string' ? domify(doc) : doc;\n\
  compile.call(this,doc);\n\
  return doc;\n\
};\n\
\n\
\n\
\n\
/**\n\
 * compile dom\n\
 * @param {dom} doc\n\
 * @return null\n\
 * @api private\n\
 */\n\
function compile(doc) {\n\
  checkChildren.call(this,doc);\n\
}\n\
\n\
function checkText(doc) {\n\
  var key = doc.nodeValue\n\
                .replace(/\\r|\\n\
/g,'') // remove link-breaking symble\n\
                .replace(this.reg, ''); // get key\n\
\n\
  //replace nodeValue with the data\n\
  doc.nodeValue = doc.nodeValue.replace(/\\r|\\n\
/g,'').replace(/{{.*}}/, this._data[key]);\n\
}\n\
\n\
function checkChildren(doc) {\n\
  if (!doc.childNodes.length) {\n\
    checkText.call(this,doc);\n\
    return;\n\
  } \n\
  for (var i = 0, len = doc.childNodes.length; i < len; i++) {\n\
    compile.call(this,doc.childNodes[i]);\n\
  }\n\
}\n\
\n\
exports = module.exports = Tengine\n\
\n\
//@ sourceURL=tengine/index.js"
));








require.alias("component-domify/index.js", "tengine/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("visionmedia-configurable.js/index.js", "tengine/deps/configurable.js/index.js");
require.alias("visionmedia-configurable.js/index.js", "configurable.js/index.js");

require.alias("component-assert/index.js", "tengine/deps/assert/index.js");
require.alias("component-assert/index.js", "assert/index.js");
require.alias("component-stack/index.js", "component-assert/deps/stack/index.js");

require.alias("jkroso-equals/index.js", "component-assert/deps/equals/index.js");
require.alias("jkroso-type/index.js", "jkroso-equals/deps/type/index.js");

require.alias("tengine/index.js", "tengine/index.js");