/*global DataImport */

(function (DataImport) {
  'use strict';
  var validators = [];

  function findDuplicateItems(array) {
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

    for (i = 0, len = fieldList.length; i < len; i += 1) {
      field = fieldList[i];
      if (field.required) {
        obj[field.id] = true;
      }
    }

    for (i = 0, len = headers.length; i < len; i += 1) {
      delete obj[headers[i]];
    }

    for (fieldId in obj) {
      if (obj.hasOwnProperty(fieldId)) {
        result.push(fieldId);
      }
    }

    return result;
  }

  function findFieldsWithMissingValues(data) {
    var result = [],
      obj = {},
      leni,
      lenj,
      column,
      i,
      j;

    for (i = 0, leni = data.length; i < leni; i += 1) {
      for (j = 0, lenj = data[i].length; j < lenj; j += 1) {
        if (data[i][j] === '') {
          column = obj[j];
          if (!column) {
            obj[j] = column = [];
          }
          column.push(i);
        }
      }
    }

    for (j in obj) {
      if (obj.hasOwnProperty(j)) {
        result.push({
          id: data[0][j],
          index: j,
          emptyRows: obj[j]
        });
      }
    }

    return result;
  }


  function pluralizeEn(num, singular, plural) {
    return (num !== 1) ? plural : singular;
  }


  /**
   * Check for duplicate columns
   *
   * @param {Array} data
   */
  function checkDuplicates(data) {
    var duplicates = findDuplicateItems(data[0]),
      msg,
      items = [],
      i;

    if (duplicates.length) {
      msg = pluralizeEn(duplicates.length, 'Duplicate field',
        'Duplicate fields');

      items = [];
      for (i = 0; i < duplicates.length; i += 1) {
        items.push('"' + duplicates[i][0] + '"');
      }

      msg += ' ' + items.join(', ');

      return {
        msg: msg
      };
    }
  }

  /**
   * Check if all required columns present
   *
   * @param {Array} data
   * @param {Array} fields
   */
  function checkMissingFields(data, fields) {
    var missing = findMissingFields(data[0], fields),
      items = [],
      msg,
      i;

    if (missing.length) {
      msg = pluralizeEn(missing.length, 'Missing field',
        'Missing fields');

      for (i = 0; i < missing.length; i += 1) {
        items.push('"' + missing[i] + '"');
      }

      msg += ' ' + items.join(', ');

      return {
        msg: msg
      };
    }
  }

  /**
   * Check for missing values in columns
   *
   * @param {Array} data
   */
  function checkMissingValues(data) {
    var missing = findFieldsWithMissingValues(data),
      items = [],
      msg,
      i;

    if (missing.length) {
      msg = pluralizeEn(missing.length,
        'Missing values in field',
        'Missing values in fields');

      for (i = 0; i < missing.length; i += 1) {
        items.push('"' + missing[i].id + '"');
      }

      msg += ' ' + items.join(', ');

      return {
        msg: msg
      };
    }
  }

  validators.push(checkDuplicates);
  validators.push(checkMissingFields);
  validators.push(checkMissingValues);

  DataImport.validators = validators;

}(DataImport));
