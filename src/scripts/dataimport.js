/*global window, Sheet, Fuse*/

(function (window, Sheet) {
  'use strict';

  var DataImport = function (containerElement, options) {
    options = options || {};
    this.data = options.data;
    this.fields = options.fields;

    function mapFields(fields, data) {
      var fuse = new Fuse(fields, {
          keys: ['name']
        }),

        mapping = data[0].map(function (x) {
          var result = fuse.search(x);
          console.log(x, result);

          if (result.length) {
            return result[0].id;
          }

          return null;
        });

      return mapping;
    }

    this.mapping = mapFields(this.fields, this.data);

    this.sheet = new Sheet(containerElement, {
      mapping: this.mapping,
      fields: this.fields,
      data: this.data
    });
  };

  DataImport.prototype.validate = function (options) {
    options = options || {};

    var data = this.sheet.getData();

    if (data) {
      options.complete(data);
    } else {
      options.fail(['no data']);
    }
  };

  DataImport.prototype.destroy = function () {
    this.sheet.destroy();
  };

  window.DataImport = DataImport;

}(window, Sheet, Fuse));
