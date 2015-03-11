/*global window, document, Handsontable */

(function (window, document, Handsontable) {
  'use strict';

  function Sheet(container, options) {
    options = options || {};
    this.mapping = options.mapping;
    this.fields = options.fields;
    this.data = options.data;

    var _this = this;

    function addButtonMenuEvent(button, menu) {
      Handsontable.Dom.addEvent(button, 'click', function (event) {
        var columnDropdownMenu, position, removeMenu, i, len;

        document.body.appendChild(menu);

        event.preventDefault();
        event.stopImmediatePropagation();

        columnDropdownMenu = document.querySelectorAll('.columnDropdownMenu');

        for (i = 0, len = columnDropdownMenu.length; i < len; i += 1) {
          columnDropdownMenu[i].style.display = 'none';
        }

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
          }
        };

        Handsontable.Dom.removeEvent(document, 'click', removeMenu);
        Handsontable.Dom.addEvent(document, 'click', removeMenu);
      });
    }

    function buildMenu(items, activeId) {
      var
        menu = document.createElement('UL'),
        li,
        id;

      menu.className = 'columnDropdownMenu';

      for (id in items) {
        li = document.createElement('LI');
        li.innerText = items[id].name;
        li.data = {
          'fieldId': id
        };

        if (activeId === id) {
          li.className = 'active';
        }

        menu.appendChild(li);
      }

      return menu;
    }

    function setColumnMapping(columnIndex, fieldId, instance) {
      _this.mapping[columnIndex] = fieldId;
      instance.render();

      // instance.validateCells(function () {
      // });

      // columns[i].type = type;
      // instance.updateSettings({
      //   columns: columns
      // });
      // instance.validateCells(function () {
      //   instance.render();
      // });
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

      width: 600,
      height: 400,

      contextMenu: true,

      colHeaders: function (col) {
        var fieldId = _this.mapping[col],
          name = '<span style="color: gray;">None</span>';

        if (fieldId) {
          name = _this.fields[fieldId].name;
        }

        return '<button class="btn btn-default dropdown-toggle"' +
          ' type="button" id="dropdownMenu1" data-toggle="dropdown"' +
          ' aria-expanded="true">' + name +
          ' <span class="caret"></span></button>';
      },

      afterGetColHeader: function (col, TH) {
        var instance = this,
          menu = buildMenu(_this.fields, _this.mapping[col]);

        addButtonMenuEvent(TH.firstChild.firstChild.firstChild, menu);

        Handsontable.Dom.addEvent(menu, 'click', function (event) {
          if (event.target.nodeName === 'LI') {
            setColumnMapping(col, event.target.data.fieldId, instance);
          }
        });
      },

      cells: function (r) {
        if (r === 0) {
          this.renderer = boldRenderer;
        }
      }
    });
  }

  window.Sheet = Sheet;

}(window, document, Handsontable));
