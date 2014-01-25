
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
require.register("tengine/index.js", Function("exports, require, module",
"/**\n\
 * Module dependence\n\
 */\n\
\n\
\n\
var domfy        = require('domfy')\n\
  , Configurable = require('configurable');\n\
\n\
Configuable(Tenginee.prototype);\n\
\n\
function Tenginee (doc,data){\n\
  if(typeof data !== 'object' && null !== data) throw new RangeError('object expected.');\n\
\n\
  this._eom  = 'string' === typeof doc ? domfy(doc) : doc;\n\
  this._data = data;\n\
}\n\
\n\
Tenginee.prototype.compile = function(){\n\
  var reg = this.get('symble') || /.*{{\\s*|\\s*}}.*/g; \n\
  checkText.bind(this);\n\
  compile(this._eom);\n\
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
  checkText(doc);\n\
  checkChildren(doc);\n\
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
  if (!doc.childNodes) return; \n\
  for (var i = 0, len = childNodes.length; i < len; i++) {\n\
    compile(childNodes[i]);\n\
  }\n\
}\n\
\n\
//@ sourceURL=tengine/index.js"
));
require.register("tengine/template.js", Function("exports, require, module",
"module.exports = '';//@ sourceURL=tengine/template.js"
));




require.alias("visionmedia-configurable.js/index.js", "tengine/deps/configurable.js/index.js");
require.alias("visionmedia-configurable.js/index.js", "configurable.js/index.js");

require.alias("component-domify/index.js", "tengine/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("tengine/index.js", "tengine/index.js");