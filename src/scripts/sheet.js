/*global window, document, Handsontable */

(function (window, document, Handsontable) {
  'use strict';

  function Sheet(container, options) {
    options = options || {};
    this.data = options.data;
    this.fields = options.fields;

    var self = this;

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

    function buildMenu(activeCellType) {
      var
        menu = document.createElement('UL'),
        items,
        item,
        len,
        i;

      items = self.fields;

      menu.className = 'columnDropdownMenu';

      for (i = 0, len = items.length; i < len; i += 1) {
        item = document.createElement('LI');
        item.innerText = items[i].name;
        item.data = {
          'fieldId': items[i].id
        };

        if (activeCellType === items[i]) {
          item.className = 'active';
        }

        menu.appendChild(item);
      }

      return menu;
    }

    function setColumnName(i, type, instance) {
      console.log(i, type, instance);
      // TODO: create this.matchedFields holding currently selected fields
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
      data: self.data,

      width: 600,
      height: 400,

      // colHeaders: self.fields.map(function (x) {
      //   return x.name + '▼';
      // }),

      colHeaders: function (col) {
        var name = '<span style="color: gray;">None</span>';

        if (self.fields[col] && self.fields[col].id) {
          name = self.fields[col].name;
        }

        return '<button class="btn btn-default dropdown-toggle"' +
          ' type="button" id="dropdownMenu1" data-toggle="dropdown"' +
          ' aria-expanded="true">' + name +
          ' <span class="caret"></span></button>';
      },

      afterGetColHeader: function (col, TH) {
        var instance = this,
          menu = buildMenu(self.fields[col]);

        addButtonMenuEvent(TH.firstChild.firstChild.firstChild, menu);

        Handsontable.Dom.addEvent(menu, 'click', function (event) {
          if (event.target.nodeName === 'LI') {
            setColumnName(col, event.target.data.fieldId, instance);
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


  Sheet.prototype.setFields = function (fields) {
    this.fields = fields;

    var colHeaders = this.fields.map(function (x) {
      return x.name;
    });

    this.hot.updateSettings({
      colWidths: 200,

      colHeaders: function (col) {
        var txt = '',
          colName = colHeaders[col];

        console.log(col, colHeaders[col]);

        if (col >= 0 && colName) {
          txt = colName + ' <button class="changeType">▼</button>';
        }
        return txt;
      }
    });

    // var hot = this.hot;
    // hot.validateCells(function () {
    //    hot.render();
    // });

  };

  window.Sheet = Sheet;

}(window, document, Handsontable));
