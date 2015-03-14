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

  function findDuplicateFields(array) {
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

  function findMissingFields(headers, fieldList) {
    var result = [],
      obj = {},
      field,
      fieldId,
      len,
      i;

    // make obj with required fields as keys
    for (i = 0, len = fieldList.length; i < len; i += 1) {
      field = fieldList[i];
      if (field.required) {
        obj[field.id] = true;
      }
    }

    for (i = 0, len = headers.length; i < len; i += 1) {
      delete obj[headers[i]];
    }

    console.log(obj);

    for (fieldId in obj) {
      if (obj.hasOwnProperty(fieldId)) {
        result.push(fieldId);
      }
    }

    return result;
  }

  function pluralizeEn(num, singular, plural) {
    return (num !== 1) ? plural : singular;
  }

  DataImport.prototype.validate = function (options) {
    options = options || {};

    var data = mergeHeaders(this.sheet.getData(), this.sheet.getMapping()),
      errors = [],
      duplicates,
      missing,
      msg,
      items,
      i;

    // Check duplicate columns
    duplicates = findDuplicateFields(data[0]);
    if (duplicates.length) {
      msg = pluralizeEn(duplicates.length, 'Duplicate field',
        'Duplicate fields');

      items = [];
      for (i = 0; i < duplicates.length; i += 1) {
        items.push('"' + duplicates[i][0] + '"');
      }

      msg += ' ' + items.join(', ');

      errors.push({
        msg: msg
      });
    }

    // Check if all required columns present
    missing = findMissingFields(data[0], this.fields);
    if (missing.length) {
      msg = pluralizeEn(missing.length, 'Missing field',
        'Missing fields');

      items = [];
      for (i = 0; i < missing.length; i += 1) {
        items.push('"' + missing[i] + '"');
      }

      msg += ' ' + items.join(', ');

      errors.push({
        msg: msg
      });
    }

    // Check for missing values in columns
    // missing = findFieldsWithMissingValues(data[0]);
    // if (missing.length) {
    //   msg = pluralizeEn(missing.length, 'Missing field',
    //     'Missing fields');

    //   items = [];
    //   for (i = 0; i < missing.length; i += 1) {
    //     items.push('"' + missing[i] + '"');
    //   }

    //   msg += ' ' + items.join(', ');

    //   errors.push({
    //     msg: msg
    //   });
    // }


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
