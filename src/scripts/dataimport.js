/*global window, Sheet*/

(function (window, Sheet) {
  'use strict';

  var DataImport = function (containerElement, options) {
    options = options || {};
    this.data = options.data;
    this.fields = options.fields;

    function mapFields(fields, data) {
      var mapping = data[0].map(function () {
        return null;
      });
      mapping[0] = 'imageName';
      mapping[1] = 'subjectId';
      mapping[2] = 'imageType';

      console.log(fields);
      return mapping;
    }

    this.mapping = mapFields(this.fields, this.data);

    this.sheet = new Sheet(containerElement, {
      mapping: this.mapping,
      fields: this.fields,
      data: this.data
    });
  };

  DataImport.prototype.destroy = function () {
    this.sheet.destroy();
  };

  window.DataImport = DataImport;

}(window, Sheet));
