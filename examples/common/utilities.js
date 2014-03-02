// Copyright (C) 2014 Erik Ringsmuth <erik.ringsmuth@gmail.com>
define([
  'prettify'
], function(prettify) {
  'use strict';

  var utilities = {
    // Format code for readability. This will look for every code block in the element and format it.
    formatCode: function formatCode(element) {
      var elements = element.querySelectorAll('pre');
      for (var el in elements) {
        if (elements.hasOwnProperty && elements.hasOwnProperty(el)) {
          elements[el].innerHTML = prettify.prettyPrintOne(elements[el].innerHTML);
        }
      }
      return element;
    },

    // Escape text being added to the DOM
    escape: function escape(string) {
      return string
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  return utilities;
});
