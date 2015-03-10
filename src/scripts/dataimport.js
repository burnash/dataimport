/*global window, Sheet*/

(function (window, Sheet) {
  'use strict';

  var DataImport = function (containerElement, options) {
    options = options || {};
    this.data = options.data;
    this.fields = options.fields;

    this.sheet = new Sheet(containerElement, options);
  };

  window.DataImport = DataImport;

}(window, Sheet));
