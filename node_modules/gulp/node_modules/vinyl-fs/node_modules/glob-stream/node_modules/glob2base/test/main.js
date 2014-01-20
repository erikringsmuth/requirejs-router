var glob2base = require('../');
var glob = require('glob');
var path = require('path');
var should = require('should');
require('mocha');

describe('glob2base', function() {
  it('should get a base name', function(done) {
    var globber = new glob.Glob("js/*.js", {cwd: __dirname});
    glob2base(globber).should.equal("js/");
    done();
  });

  it('should get a base name from a nested glob', function(done) {
    var globber = new glob.Glob("js/**/test/*.js", {cwd: __dirname});
    glob2base(globber).should.equal("js/");
    done();
  });

  it('should get a base name from a flat file', function(done) {
    var globber = new glob.Glob("js/test/wow.js", {cwd: __dirname});
    glob2base(globber).should.equal("js/test/");
    done();
  });
});
