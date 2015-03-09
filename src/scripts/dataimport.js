/*global window */

(function (window) {
  'use strict';

  var DataImport = function (sheet, opts) {
    opts = opts || {};
    this.sheet = sheet;
    this.fields = opts.fields;

    this.sheet.setFields(this.fields);
  };

  DataImport.prototype.render = function (data) {
    this.sheet.loadData(data);
  };

  window.DataImport = DataImport;

}(window));
