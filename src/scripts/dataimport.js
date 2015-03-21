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
      dataCopy = data.slice(1);

    dataCopy.unshift(newHeaders);

    return dataCopy;
  }

  function forMappedFields(data, fields, fn) {
    var fieldById = fields.toObject(),
      firstRow = data[0],
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

  function hightlightCellsAtColumn(sheet, columnIndex, rows) {
    var len,
      i;
    for (i = 0, len = rows.length; i < len; i += 1) {
      sheet.invalidateCell(rows[i] + 1, columnIndex);
    }
  }

  DataImport.prototype.validate = function (options) {
    options = options || {};

    var data = mergeHeaders(this.sheet.getData(), this.sheet.getMapping()),
      _this = this,
      errors = [],
      validators = DataImport.validators,
      validate,
      error,
      len,
      i;

    this.sheet.clearInvalidCells();
    this.sheet.render();

    for (i = 0, len = validators.length; i < len; i += 1) {
      error = validators[i](data, this.fields);
      if (error) {
        errors.push(error);
      }
    }

    if (!errors.length) {
      forMappedFields(data, this.fields, function (field, columnIndex) {
        validate = field.validate;
        if (validate) {
          for (i = 0, len = validate.length; i < len; i += 1) {
            error = validate[i](data, field, columnIndex);
            if (error) {
              errors.push({
                msg: error.msg + ' in field "' + field.id + '"'
              });
              hightlightCellsAtColumn(_this.sheet, columnIndex, error.rows);
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
