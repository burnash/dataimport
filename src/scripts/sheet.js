/*global window, document, Handsontable */

(function (window, document, Handsontable) {
  'use strict';

  function Sheet(container, options) {
    options = options || {};
    this.mapping = options.mapping;
    this.fields = options.fields;
    this.data = options.data;

    var _this = this;

    function arrayToObject(array) {
      var len = array.length,
        obj = {},
        i;

      for (i = 0; i < len; i += 1) {
        obj[array[i].id] = array[i];
      }

      return obj;
    }

    this.fieldById = arrayToObject(options.fields);

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
      var mapping = _this.mapping,
        index;

      if (fieldId) {
        index = mapping.indexOf(fieldId);

        if (index > -1) {
          mapping[index] = mapping[columnIndex];
        }
      }

      _this.mapping[columnIndex] = fieldId;

      instance.render();
    }

    var boldRenderer = function (
      instance, td, row, col, prop, value, cellProperties) { // jshint ignore:line

      Handsontable.renderers.TextRenderer.apply(this, arguments);
      td.style.fontWeight = 'bold';
    };

    this.hot = new Handsontable(container, {
      stretchH: 'all',
      rowHeaders: true,
      data: _this.data,

      width: 700,
      height: 400,

      contextMenu: true,

      colHeaders: function (col) {
        var fieldId = _this.mapping[col],
          name = '<span style="color: gray;">None</span>';

        if (fieldId) {
          name = _this.fieldById[fieldId].name;
        }

        return '<button class="btn btn-default dropdown-toggle"' +
          ' type="button" id="dropdownMenu1" data-toggle="dropdown"' +
          ' aria-expanded="true">' + name +
          ' <span class="caret"></span></button>';
      },

      afterGetColHeader: function (col, TH) {
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

      cells: function (r) {
        if (r === 0) {
          this.renderer = boldRenderer;
        }
      }
    });
  }

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
