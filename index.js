/**
 * Module dependence
 */


var domify       = require('domify')
  , Configurable = require('configurable.js');

exports = module.exports = Tengine

Configurable(Tengine.prototype);

function Tengine (data){
  if(!(this instanceof Tengine)) return new Tengine(data);
  if(typeof data !== 'object' && null !== data) throw new TypeError('object expected.');
  this._data = data;
}

Tengine.prototype.compile = function(doc){
  this.reg = this.get('symble') || /.*{{\s*|\s*}}.*/g; 
  doc = typeof doc === 'string' ? domify(doc) : doc;
  compile.call(this,doc);
  return doc;
};



/**
 * compile dom
 * @param {dom} doc
 * @return null
 * @api private
 */
function compile(doc) {
  text.call(this,doc);
  attr.call(this,doc);
  child.call(this,doc);
}

function text(doc) {
  if(!this.reg.test(doc.nodeValue)) return;
  var key = doc.nodeValue
                .replace(/\r|\n/g,'') // remove link-breaking symble
                .replace(this.reg, ''); // get key

  //replace nodeValue with the data
  doc.nodeValue = doc.nodeValue.replace(/\r|\n/g,'').replace(/{{.*}}/, this._data[key]);
}

function child(doc) {
  if (!doc.childNodes.length) {
    return;
  } 
  for (var i = 0, len = doc.childNodes.length; i < len; i++) {
    compile.call(this,doc.childNodes[i]);
  }
}

function attr(doc){
  if(!doc.attributes) return;
  for (var i = 0, len = doc.attributes.length; i < len; i++) {
    text.call(this,doc.attributes[i]);
  }
}


