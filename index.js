/**
 * Module dependence
 */


var domify       = require('domify')
  , Configurable = require('configurable.js');

Configurable(Tengine.prototype);

function Tengine (data){
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
  checkChildren.call(this,doc);
}

function checkText(doc) {
  var key = doc.nodeValue
                .replace(/\r|\n/g,'') // remove link-breaking symble
                .replace(this.reg, ''); // get key

  //replace nodeValue with the data
  doc.nodeValue = doc.nodeValue.replace(/\r|\n/g,'').replace(/{{.*}}/, this._data[key]);
}

function checkChildren(doc) {
  if (!doc.childNodes.length) {
    checkText.call(this,doc);
    return;
  } 
  for (var i = 0, len = doc.childNodes.length; i < len; i++) {
    compile.call(this,doc.childNodes[i]);
  }
}

exports = module.exports = Tengine

