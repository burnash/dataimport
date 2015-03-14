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

  function findDuplicates(array) {
    var len = array.length,
      obj = {},
      result = [],
      indexList,
      item,
      i;

    for (i = 0; i < len; i += 1) {
      indexList = obj[array[i]];
      if (!indexList) {
        obj[array[i]] = indexList = [];
      }
      indexList.push(i);
    }

    for (item in obj) {
      if (obj.hasOwnProperty(item)) {
        indexList = obj[item];
        if (indexList.length > 1) {
          result.push([item, indexList]);
        }
      }
    }

    return result;
  }

  DataImport.prototype.validate = function (options) {
    options = options || {};

    var data = mergeHeaders(this.sheet.getData(), this.sheet.getMapping()),
      errors = [],
      duplicates,
      msg,
      i;

    // Check duplicate columns
    duplicates = findDuplicates(data[0]);
    if (duplicates.length) {
      if (duplicates.length === 1) {
        msg = 'Duplicate field ';
      } else {
        msg = 'Duplicate fields ';
      }

      for (i = 0; i < duplicates.length; i += 1) {
        msg += '"' + duplicates[i][0] + '"';
      }

      errors.push({msg: msg});
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

  window.DataImport = DataImport;

}(window, Sheet, Fuse));
