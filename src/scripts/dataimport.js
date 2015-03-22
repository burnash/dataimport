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

    var mapping = mapFields(this.fields, this.data),
      _this = this;

    this.sheet = new Sheet(containerElement, {
      mapping: mapping,
      fields: this.fields,
      data: this.data,
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

  function forMappedFields(firstRow, fields, fn) {
    var fieldById = fields.toObject(),
      field,
      len,
      i;

    for (i = 0, len = firstRow.length; i < len; i += 1) {
      field = fieldById[firstRow[i]];
      if (field) {
        fn(field, i);
      }
    }
  }

  DataImport.prototype.getFieldByColumnIndex = function (columnIndex) {
    var fieldById = this.fields.toObject(),
      headers = mergeHeaders(this.sheet.getData()[0], this.sheet.getMapping());

    return fieldById[headers[columnIndex]];
  };

  DataImport.prototype.validateColumn = function (columnIndex) {
    var field = this.getFieldByColumnIndex(columnIndex),
      data = this.sheet.getData(),
      errors = [],
      validate,
      error,
      len,
      i;

    if (!field || !field.validate) {
      return;
    }

    validate = field.validate;

    for (i = 0, len = validate.length; i < len; i += 1) {
      error = validate[i](data, field, columnIndex);
      if (error) {
        errors.push({
          msg: error.msg + ' in field "' + field.id + '"'
        });
        this.sheet.markCellsInColumn(columnIndex, error.rows);
      }
    }

    return errors;
  };

  DataImport.prototype.validate = function (options) {
    options = options || {};

    var data = this.sheet.getData(),
      headers = mergeHeaders(data[0], this.sheet.getMapping()),
      _this = this,
      errors = [],
      validators = DataImport.validators,

      validate,
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
      forMappedFields(headers, this.fields, function (field, columnIndex) {
        validate = field.validate;
        if (validate) {
          for (i = 0, len = validate.length; i < len; i += 1) {
            error = validate[i](data, field, columnIndex);
            if (error) {
              errors.push({
                msg: error.msg + ' in field "' + field.id + '"'
              });
              _this.sheet.markCellsInColumn(columnIndex, error.rows);
            }
          }
        }
      });

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

}(window, Sheet, Fuse));
