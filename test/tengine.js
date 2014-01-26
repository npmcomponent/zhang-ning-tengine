var Tengine = require('tengine')
  , assert  = require('assert');

describe('simple data',function(){

  var obj;
  beforeEach(function(){

  });

  it('should set simple data',function(){
    assert(Tengine({msg:'hello world'})
           .compile('<p>{{msg}}</p>').textContent == 'hello world');
  });
});
