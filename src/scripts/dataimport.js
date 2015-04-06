/*global window, Sheet*/

(function (window, Sheet) {
  'use strict';

  var DataImport = function (containerElement, options) {
    options = options || {};
    this.data = options.data;
    this.fields = options.fields;
    this.sheetHeight = options.sheetHeight;
    this.matchFields = options.matchFields;

    this.fields.toObject = function () {
      var len = this.length,
        obj = {},
        i;

      for (i = 0; i < len; i += 1) {
        obj[this[i].id] = this[i];
      }

      return obj;
    };

    var mapping = this.matchFields(this.fields, this.data),
      _this = this;

    this.sheet = new Sheet(containerElement, {
      mapping: mapping,
      fields: this.fields,
      data: this.data,
      height: this.sheetHeight,
      afterColumnChange: function (columnIndex) {
        _this.sheet.clearMarkedCellsInColumn(columnIndex);
        _this.validateColumn(columnIndex);
        _this.sheet.render();
      }
    });
  };

  function mergeHeaders(firstRow, mapping) {
    var i = 0;

    return firstRow.map(function (value) {
      if (mapping[i]) {
        value = mapping[i];
      }
      i += 1;
      return value;
    });
  }

  DataImport.prototype.getFieldByColumnIndex = function (columnIndex) {
    var fieldById = this.fields.toObject(),
      headers = mergeHeaders(this.sheet.getData()[0], this.sheet.getMapping());

    return fieldById[headers[columnIndex]];
  };

  DataImport.prototype.validateColumn = function (columnIndex) {
    var field = this.getFieldByColumnIndex(columnIndex),
      errors = [],
      data,
      validate,
      error,
      len,
      i;

    if (field && field.validate) {
      validate = field.validate;
      data = this.sheet.getData();

      for (i = 0, len = validate.length; i < len; i += 1) {
        error = validate[i](data, field, columnIndex);
        if (error) {
          errors.push({
            msg: error.msg + ' in field "' + field.id + '"'
          });
          this.sheet.markCellsInColumn(columnIndex, error.rows);
        }
      }
    }

    return errors;
  };

  DataImport.prototype.validate = function (options) {
    options = options || {};

    var data = this.sheet.getData(),
      headers = mergeHeaders(data[0], this.sheet.getMapping()),
      validators = DataImport.validators,
      errors = [],
      error,
      len,
      i;

    this.sheet.clearMarkedCells();
    this.sheet.render();

    data = data.slice(1);
    data.unshift(headers);

    for (i = 0, len = validators.length; i < len; i += 1) {
      error = validators[i](data, this.fields);
      if (error) {
        errors.push(error);
      }
    }

    if (!errors.length) {
      for (i = 0, len = headers.length; i < len; i += 1) {
        errors = errors.concat(this.validateColumn(i));
      }

      this.sheet.render();
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

}(window, Sheet));
