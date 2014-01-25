var tengine = require('tengine')
  , assert  = require('assert');

describe('simple data',function(){

  var obj;
  beforeEach(function(){

  });

  it('should set simple data',function(){
    var t = new tengine({msg:'hello world'});
    assert(t.compile('<p>{{msg}}</p>').textContent == 'hello world');
  });
});
