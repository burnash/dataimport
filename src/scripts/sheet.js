/*global window, document, Handsontable */

(function (window, document, Handsontable) {
  'use strict';

  function Sheet(container, options) {
    options = options || {};
    this.mapping = options.mapping;
    this.fields = options.fields;
    this.data = options.data;
    this.afterColumnChange = options.afterColumnChange;

    var _this = this,
      boldRenderer,
      validationRenderer,
      dummyEditor,
      markedCells = {};

    this.fieldById = options.fields.toObject();

    this.markCell = function (row, column) {
      markedCells[row + ',' + column] = true;
    };

    this.markCellsInColumn = function (column, rows) {
      var len,
        i;
      for (i = 0, len = rows.length; i < len; i += 1) {
        this.markCell(rows[i] + 1, column);
      }
    };

    this.clearMarkedCellsInColumn = function (column) {
      var len,
        i;
      for (i = 0, len = this.data.length; i < len; i += 1) {
        this.clearMark(i, column);
      }
    };

    this.clearMark = function (row, column) {
      delete markedCells[row + ',' + column];
    };

    this.clearMarkedCells = function () {
      markedCells = {};
    };

    function addButtonMenuEvent(button, menu) {

      Handsontable.Dom.addEvent(button, 'click', function (event) {
        var columnDropdownMenu, position, removeMenu, i, len;

        document.body.appendChild(menu);

        event.preventDefault();
        event.stopImmediatePropagation();

        if (menu.style.display === 'block') {
          menu.style.display = 'none';
          return;
        }

        columnDropdownMenu = document.querySelectorAll('.columnDropdownMenu');

        // Hide other menus
        for (i = 0, len = columnDropdownMenu.length; i < len; i += 1) {
          columnDropdownMenu[i].style.display = 'none';
        }

        // Show this menu
        menu.style.display = 'block';
        position = button.getBoundingClientRect();

        menu.style.top = (position.top +
          (window.scrollY || window.pageYOffset)) + 12 + 'px';
        menu.style.left = (position.left) + 'px';

        removeMenu = function (event) {
          if (event.target.nodeName === 'LI' && event.target.parentNode
            .className.indexOf('columnDropdownMenu') !== -1) {
            if (menu.parentNode) {
              menu.parentNode.removeChild(menu);
            }
          } else {
            columnDropdownMenu = document
              .querySelectorAll('.columnDropdownMenu');
            for (i = 0, len = columnDropdownMenu.length; i < len; i += 1) {
              columnDropdownMenu[i]
                .parentNode
                .removeChild(columnDropdownMenu[i]);
            }
          }
        };

        Handsontable.Dom.removeEvent(document, 'click', removeMenu);
        Handsontable.Dom.addEvent(document, 'click', removeMenu);
      });
    }

    function createListItem(options) {
      var li = document.createElement('LI');
      li.className = options.className;
      li.innerHTML = options.innerHTML;
      li.data = options.data;

      return li;
    }

    function buildMenu(items, activeId) {
      var
        menu = document.createElement('UL'),
        id;

      menu.className = 'columnDropdownMenu';

      for (id in items) {
        if (items.hasOwnProperty(id)) {
          menu.appendChild(createListItem({
            innerHTML: items[id].name,
            className: (activeId === id) ? 'active' : '',
            data: {
              'fieldId': id
            }
          }));
        }
      }

      menu.appendChild(createListItem({
        className: 'divider'
      }));

      menu.appendChild(createListItem({
        innerHTML: 'Reset Field',
        className: activeId ? '' : 'disabled',
        data: {
          'fieldId': null
        }
      }));

      return menu;
    }

    function setColumnMapping(columnIndex, fieldId, instance) {
      _this.mapping[columnIndex] = fieldId;

      instance.render();
    }

    /*jslint unparam: true */
    boldRenderer = function (instance, td, row, col, prop,
      value, cellProperties) {
      //jshint unused:false

      Handsontable.renderers.TextRenderer.apply(this, arguments);
      td.style.fontWeight = 'bold';
    };

    /*jslint unparam: true */
    validationRenderer = function (instance, td, row, col, prop,
      value, cellProperties) {
      //jshint unused:false

      Handsontable.renderers.TextRenderer.apply(this, arguments);

      if (markedCells[row + ',' + col]) {
        td.style.backgroundColor = '#ff4c42';
      }

      if (col === 2) {
        Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
        // Handsontable.editors.DropdownEditor.apply(instance, arguments);
        cellProperties.source = ['1', '2', '3'];
        cellProperties.editor = Handsontable.editors.DropdownEditor;
      }
    };

    dummyEditor = function () {
      console.log(arguments);
    };

    function getHeaderTitle(columnIndex, mapping, data) {
      var fieldId = mapping[columnIndex],
        name = 'None';

      if (fieldId) {
        name = _this.fieldById[fieldId].name;
      } else {
        if (data.length && data[0].length && data[0][columnIndex]) {
          name = data[0][columnIndex];
        }
        name = '<span style="color: gray;">' + name + '</span>';
      }

      return name;
    }

    this.hot = new Handsontable(container, {
      stretchH: 'all',
      rowHeaders: true,
      data: _this.data,

      width: 700,
      height: 400,

      contextMenu: true,
      manualColumnMove: false,

      colHeaders: function (col) {
        var name = getHeaderTitle(col, _this.mapping, _this.data);

        return '<button class="btn btn-default dropdown-toggle"' +
          ' type="button" id="dropdownMenu1" data-toggle="dropdown"' +
          ' aria-expanded="true">' + name +
          ' <span class="caret"></span></button>';
      },

      afterChange: function (changes, source) {
        if (source !== 'loadData') {
          var obj = {},
            col,
            len,
            i;

          for (i = 0, len = changes.length; i < len; i += 1) {
            obj[changes[i][1]] = true;
          }

          for (col in obj) {
            if (obj.hasOwnProperty(col)) {
              _this.afterColumnChange(col);
            }
          }
        }
      },

      afterGetColHeader: function (col, TH) {
        if (col < 0) {
          return;
        }

        var instance = this,
          menu = buildMenu(_this.fieldById, _this.mapping[col]);
        addButtonMenuEvent(TH.firstChild.firstChild.firstChild, menu);

        Handsontable.Dom.addEvent(menu, 'click', function (event) {
          if (event.target.nodeName === 'LI') {
            setColumnMapping(col, event.target.data.fieldId, instance);
          }
        });
      },

      afterCreateCol: function (index, amount) {
        if (amount === 1) {
          _this.mapping.splice(index, 0, null);
        } else {
          var args = [index, 0],
            i;

          for (i = 0; i < amount; i += 1) {
            args.push(null);
          }

          _this.mapping.splice.apply(_this.mapping, args);
        }
      },

      afterRemoveCol: function (index, amount) {
        _this.mapping.splice(index, amount);
      },

      // afterColumnMove: function (oldIndex, newIndex) {
      //   console.log('afterColumnMove', oldIndex, newIndex);
      //   if (oldIndex === newIndex) {
      //     return;
      //   }
      //   var temp = _this.mapping.splice(oldIndex, 1);
      //   _this.mapping.splice(newIndex, 0, temp[0]);
      // },

      cells: function (r) {
        if (r === 0) {
          this.renderer = boldRenderer;
        } else {
          this.renderer = validationRenderer;
        }
      }
    });
  }

  Sheet.prototype.render = function () {
    return this.hot.render();
  };

  Sheet.prototype.getData = function () {
    return this.hot.getData();
  };

  Sheet.prototype.getMapping = function () {
    return this.mapping;
  };

  Sheet.prototype.destroy = function () {
    this.hot.destroy();
  };

  window.Sheet = Sheet;

}(window, document, Handsontable));
