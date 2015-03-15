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

          if (result.length) {
            return result[0].id;
          }

          return null;
        });

      return mapping;
    }

    this.fields.toObject = function () {
      var len = this.length,
        obj = {},
        i;

      for (i = 0; i < len; i += 1) {
        obj[this[i].id] = this[i];
      }

      return obj;
    };

    var mapping = mapFields(this.fields, this.data);

    this.sheet = new Sheet(containerElement, {
      mapping: mapping,
      fields: this.fields,
      data: this.data
    });
  };

  function mergeHeaders(data, mapping) {
    var i = 0,
      newHeaders = data[0].map(function (value) {
        if (mapping[i]) {
          value = mapping[i];
        }
        i += 1;
        return value;
      }),
      dataCopy = data.slice(0);

    dataCopy.unshift(newHeaders);

    return dataCopy;
  }


  DataImport.prototype.validate = function (options) {
    options = options || {};

    var data = mergeHeaders(this.sheet.getData(), this.sheet.getMapping()),
      errors = [],
      validators = DataImport.validators,
      error,
      len,
      i;

    for (i = 0, len = validators.length; i < len; i += 1) {
      error = validators[i](data, this.fields);
      if (error) {
        errors.push(error);
      }
    }

    if (errors.length) {
      options.fail(errors);
    } else {
      options.complete(data);
    }
  };

  DataImport.prototype.destroy = function () {
    this.sheet.destroy();
  };


  // DataImport.validators = {};

  // DataImport.validators.unique = (function () {
  //   function makeError(duplicates) {
  //     var msg = 'Duplicate values ',
  //       values = [],
  //       i;

  //     for (i = 0; i < duplicates.length; i += 1) {
  //       values.push('"' + duplicates[i][0] + '"');
  //     }

  //     msg += values.join(', ');

  //     return msg;
  //   }

  //   function validate(columnIndex, data) {
  //     var columnValues = [],
  //       duplicates,
  //       len,
  //       i;

  //     for (i = 1, len = data.length; i < len; i += 1) {
  //       columnValues.push(data[i][columnIndex]);
  //     }
  //     duplicates = findDuplicateItems(columnValues);

  //     if (duplicates.length) {
  //       return makeError(duplicates);
  //     }

  //     return null;
  //   }

  //   return validate;
  // }());


  window.DataImport = DataImport;

}(window, Sheet, Fuse));
