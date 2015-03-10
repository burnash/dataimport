/*global window, Sheet*/

(function (window, Sheet) {
  'use strict';

  var DataImport = function (containerElement, opts) {
    opts = opts || {};
    this.data = opts.data;
    this.fields = opts.fields;

    this.sheet = new Sheet(containerElement, opts);
  };

  window.DataImport = DataImport;

}(window, Sheet));
