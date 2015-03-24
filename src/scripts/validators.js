/*global DataImport */

(function (DataImport) {
  'use strict';
  var validators = [];

  function findDuplicateItems(array) {
    var obj = {},
      result = [],
      indexList,
      value,
      len,
      i;

    for (i = 0, len = array.length; i < len; i += 1) {
      indexList = obj[array[i]];
      if (!indexList) {
        obj[array[i]] = indexList = [];
      }
      indexList.push(i);
    }

    for (value in obj) {
      if (obj.hasOwnProperty(value)) {
        indexList = obj[value];
        len = indexList.length;
        if (len > 1) {
          for (i = 0; i < len; i += 1) {
            result.push({
              value: value,
              row: indexList[i]
            });
          }
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

  function getColumnValues(data, columnIndex) {
    var columnValues = [],
      len,
      i;
    for (i = 1, len = data.length; i < len; i += 1) {
      columnValues.push(data[i][columnIndex]);
    }
    return columnValues;
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

  function arrayToSet(array) {
    var obj = {},
      len,
      i;

    for (i = 0, len = array.length; i < len; i += 1) {
      obj[array[i]] = true;
    }

    return obj;
  }

  function substractSet(setA, setB) {
    var result = [],
      value;

    for (value in setA) {
      if (setA.hasOwnProperty(value) && setB[value] === undefined) {
        result.push(value);
      }
    }

    return result;
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
   * @param {Array} fields
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

  function findRegexMatchExceptions(regex, columnValues) {
    var noMatch = [],
      value,
      len,
      i;

    for (i = 0, len = columnValues.length; i < len; i += 1) {
      value = columnValues[i] || '';
      if (!value.match(regex)) {
        noMatch.push({
          value: value,
          row: i
        });
      }
    }

    return noMatch;
  }

  function findStringMatchExceptions(array, columnValues) {
    var noMatch = [],
      value,
      len,
      i;

    for (i = 0, len = columnValues.length; i < len; i += 1) {
      value = columnValues[i];
      if (array.indexOf(value) === -1) {
        noMatch.push({
          value: value,
          row: i
        });
      }
    }

    return noMatch;
  }

  function pluck(collection, key) {
    return collection.map(function (obj) {
      return obj[key];
    });
  }

  function range(end) {
    var result = [],
      i;

    for (i = 0; i <= end; i += 1) {
      result.push(i);
    }

    return result;
  }

  DataImport.is = {};

  /**
   * Check for unique values in columns
   *
   * @param {String} message
   */

  DataImport.is.unique = function (message) {
    message = message || 'Duplicate values';

    function validate(data, field, columnIndex) {
      var columnValues = getColumnValues(data, columnIndex),
        duplicates = findDuplicateItems(columnValues);

      if (duplicates.length) {
        return {
          msg: message,
          rows: pluck(duplicates, 'row')
        };
      }
    }

    return validate;
  };

  /**
   * Check for values matching regex
   *
   * @param {Array} regExpAndFlags
   * @param {String} message
   */

  DataImport.is.matchingRegex = function (regExpAndFlags, message) {
    message = message || 'Wrong value format';

    var regex = new RegExp(regExpAndFlags[0], regExpAndFlags[1]);

    function validate(data, field, columnIndex) {
      var columnValues = getColumnValues(data, columnIndex),
        matchExceptions = findRegexMatchExceptions(
          regex,
          columnValues
        );

      if (matchExceptions.length) {
        return {
          msg: message,
          rows: pluck(matchExceptions, 'row')
        };
      }
    }

    return validate;
  };

  /**
   * Check is column values are subset of a specific set
   *
   * @param {Array} arrayOfArrays
   * @param {String} message
   */

  DataImport.is.belongsToAnyOfSets = function (arrayOfArrays, message) {
    function validate(data, field, columnIndex) {
      var columnValues = getColumnValues(data, columnIndex),
        valueSet = arrayToSet(columnValues),
        optionSet,
        missingValues,
        len,
        i;

      for (i = 0, len = arrayOfArrays.length; i < len; i += 1) {
        optionSet = arrayToSet(arrayOfArrays[i]);
        missingValues = substractSet(valueSet, optionSet);
        if (!missingValues.length) {
          break;
        }
      }

      if (missingValues.length) {
        return {
          msg: message,
          rows: range(columnValues.length)
        };
      }
    }

    return validate;
  };

  /**
   * Check for values matching any of given string in a set.
   *
   * @param {Array} array
   * @param {String} message
   */

  DataImport.is.anyOf = function (array, message) {
    function validate(data, field, columnIndex) {
      var columnValues = getColumnValues(data, columnIndex),
        matchExceptions = findStringMatchExceptions(
          array,
          columnValues
        );

      if (matchExceptions.length) {
        return {
          msg: message,
          rows: pluck(matchExceptions, 'row')
        };
      }
    }

    return validate;
  };

  validators.push(checkDuplicates);
  validators.push(checkMissingFields);
  validators.push(checkMissingValues);

  DataImport.validators = validators;

}(DataImport));
