define([], function() {
  "use strict";

  // Shim jasmine. jasmine.js creates the `window.jasmineRequire` global. jasmine-html.js adds additional properties to that global.
  require.config({
    baseUrl: "..",
    paths: {
      "jasmineRequire": "tests/lib/jasmine-2.0.0/jasmine",
      "jasmineRequireHtml": "tests/lib/jasmine-2.0.0/jasmine-html",
      "amd": "tests/lib/jasmine-2.0.0/amd"
    },
    shim: {
      "jasmineRequire": {
        exports: "jasmineRequire"
      },
      "jasmineRequireHtml": {
        deps: ["jasmineRequire"],
        exports: "jasmineRequire"
      }
    }
  });

  // Load the HTML bootloader and all of the specs
  require(["tests/spec/amdSpecList", "amd/boot"], function (amdSpecList, boot) {
    require(amdSpecList, function() {
      // All of the specs have been loaded. Initialize the HTML Reporter and execute the environment.
      boot.initializeHtmlReporter();
      boot.execute();
    });
  });
});
