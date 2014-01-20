var path = require('path');

var flatten2d = function(arr){
  var out = [];
  var flat = true;
  for(var i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'string') {
      flat = false;
      break;
    }
    out.push(arr[i]);
  }
  if (flat) out.pop(); // last one is a file or specific dir
  return out;
};

module.exports = function(glob) {
  var cwd = (glob.options && glob.options.cwd) ? glob.options.cwd : process.cwd();
  var rules = glob.minimatch.set[0];
  var basePath = path.normalize(flatten2d(rules).join(path.sep))+path.sep;
  return basePath;
};