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


  function getColumnValues(data, columnIndex) {
    var columnValues = [],
      len,
      i;
    for (i = 1, len = data.length; i < len; i += 1) {
      columnValues.push(data[i][columnIndex]);
    }
    return columnValues;
  }

  function getDuplicateValues(duplicateItems) {
    var result = [],
      len,
      i;
    for (i = 0, len = duplicateItems.length; i < len; i += 1) {
      result.push(duplicateItems[i][0]);
    }
    return result;
  }

  function pluralizeEn(num, singular, plural) {
    return (num !== 1) ? plural : singular;
  }


  function isEmpty(obj) {
    var prop;
    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true;
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

  /**
   * Check for unique values in columns
   *
   * @param {Array} data
   * @param {Array} fields
   */
  function checkUniqueValues(data, fields) {
    var fieldById = fields.toObject(),
      duplicates = {},
      items = [],
      columnDuplicates,
      firstRow,
      columnValues,
      field,
      msg,
      len,
      i;

    if (!data.length) {
      return;
    }

    firstRow = data[0];

    for (i = 0, len = firstRow.length; i < len; i += 1) {
      field = fieldById[firstRow[i]];
      if (field && field.unique) {
        columnValues = getColumnValues(data, i);
        columnDuplicates = findDuplicateItems(columnValues);
        if (columnDuplicates.length) {
          duplicates[field.id] = columnDuplicates;
        }
      }
    }

    if (!isEmpty(duplicates)) {
      msg = 'Duplicate values in ';

      for (field in duplicates) {
        if (duplicates.hasOwnProperty(field)) {
          items.push('"' + field + '": ' +
            getDuplicateValues(duplicates[field]).join(', '));
        }
      }

      msg += ' ' + items.join('; in ');

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
      value = columnValues[i];
      if (!value.match(regex)) {
        noMatch.push(value);
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

  /**
   * Check for values matching regex
   *
   * @param {Array} data
   * @param {Array} fields
   */
  function checkValuesMatchRegex(data, fields) {
    var fieldById = fields.toObject(),
      exceptions = {},
      items = [],
      firstRow,
      columnValues,
      matchExceptions,
      field,
      len,
      msg,
      i;

    if (!data.length) {
      return;
    }

    firstRow = data[0];

    for (i = 0, len = firstRow.length; i < len; i += 1) {
      field = fieldById[firstRow[i]];
      if (field && field.matchRegex) {
        columnValues = getColumnValues(data, i);
        matchExceptions = findRegexMatchExceptions(
          new RegExp(field.matchRegex[0], field.matchRegex[1]),
          columnValues
        );
        if (matchExceptions.length) {
          exceptions[field.id] = matchExceptions;
        }
      }
    }

    if (!isEmpty(exceptions)) {
      msg = 'Wrong value format in ';

      for (field in exceptions) {
        if (exceptions.hasOwnProperty(field)) {
          items.push('"' + field + '": ' +
            exceptions[field].join(', '));
        }
      }

      msg += ' ' + items.join('; in ');

      return {
        msg: msg
      };
    }
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
   * @param {Array} data
   * @param {Array} fields
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
  validators.push(checkUniqueValues);
  validators.push(checkValuesMatchRegex);

  DataImport.validators = validators;

}(DataImport));
