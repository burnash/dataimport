/*global window, Sheet*/

(function (window, Sheet) {
  'use strict';

  var DataImport = function (containerElement, options) {
    options = options || {};
    this.data = options.data;
    this.fields = options.fields;

    this.mapping = options.data[0].map(function () {
      return null;
    });

    this.mapping[0] = 'imageName';
    this.mapping[1] = 'subjectId';
    this.mapping[2] = 'imageType';

    this.sheet = new Sheet(containerElement, {
      mapping: this.mapping,
      fields: this.fields,
      data: this.data
    });
  };

  window.DataImport = DataImport;

}(window, Sheet));
