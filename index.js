/**
 * Module dependence
 */


var domfy        = require('domfy')
  , Configurable = require('configurable');

Configuable(Tenginee.prototype);

function Tenginee (doc,data){
  if(typeof data !== 'object' && null !== data) throw new RangeError('object expected.');

  this._eom  = 'string' === typeof doc ? domfy(doc) : doc;
  this._data = data;
}

Tenginee.prototype.compile = function(){
  var reg = this.get('symble') || /.*{{\s*|\s*}}.*/g; 
  checkText.bind(this);
  compile(this._eom);
};



/**
 * compile dom
 * @param {dom} doc
 * @return null
 * @api private
 */
function compile(doc) {
  checkText(doc);
  checkChildren(doc);
}

function checkText(doc) {
  var key = doc.nodeValue
                .replace(/\r|\n/g,'') // remove link-breaking symble
                .replace(this.reg, ''); // get key

  //replace nodeValue with the data
  doc.nodeValue = doc.nodeValue.replace(/\r|\n/g,'').replace(/{{.*}}/, this._data[key]);
}

function checkChildren(doc) {
  if (!doc.childNodes) return; 
  for (var i = 0, len = childNodes.length; i < len; i++) {
    compile(childNodes[i]);
  }
}

