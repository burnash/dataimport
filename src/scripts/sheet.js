/*global window, document, Handsontable */

(function (window, document, Handsontable) {
  'use strict';

  function addButtonMenuEvent(button, menu) {
    Handsontable.Dom.addEvent(button, 'click', function (event) {
      var changeTypeMenu, position, removeMenu, i, len;

      document.body.appendChild(menu);

      event.preventDefault();
      event.stopImmediatePropagation();

      changeTypeMenu = document.querySelectorAll('.changeTypeMenu');

      for (i = 0, len = changeTypeMenu.length; i < len; i += 1) {
        changeTypeMenu[i].style.display = 'none';
      }
      menu.style.display = 'block';
      position = button.getBoundingClientRect();

      menu.style.top = (position.top +
        (window.scrollY || window.pageYOffset)) + 2 + 'px';
      menu.style.left = (position.left) + 'px';

      removeMenu = function (event) {
        if (event.target.nodeName === 'LI' &&
          event
          .target
          .parentNode.className.indexOf('changeTypeMenu') !== -1) {
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
      types = ['text', 'numeric', 'date'],
      item,
      len,
      i;

    menu.className = 'changeTypeMenu';

    for (i = 0, len = types.length; i < len; i += 1) {
      item = document.createElement('LI');
      item.innerText = types[i];
      item.data = {
        'colType': types[i]
      };

      if (activeCellType === types[i]) {
        item.className = 'active';
      }
      menu.appendChild(item);
    }

    return menu;
  }

  // function buildButton() {
  //   var button = document.createElement('BUTTON');

  //   button.innerHTML = '\u25BC';
  //   button.className = 'changeType';

  //   return button;
  // }

  /** Handsontable magic
  function boldRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.TextCell.renderer.apply(this, arguments);
    $(td).css({
      'font-weight': 'bold'
    });
  };
  */

  var boldRenderer = function (
    instance, td, row, col, prop, value, cellProperties) { // jshint ignore:line

    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.fontWeight = 'bold';
  };


  function setColumnType(i, type, instance) {
    console.log(i, type, instance);
    // columns[i].type = type;
    // instance.updateSettings({
    //   columns: columns
    // });
    // instance.validateCells(function () {
    //   instance.render();
    // });

  }

  var Sheet = function (container, opts) {
    opts = opts || {};
    this.data = opts.data;
    this.fields = opts.fields;

    var self = this;

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
          menu = buildMenu(self.fields[col] && self.fields[col].id);

        addButtonMenuEvent(TH.firstChild.firstChild.firstChild, menu);

        Handsontable.Dom.addEvent(menu, 'click', function (event) {
          if (event.target.nodeName === 'LI') {
            setColumnType(col, event.target.data.colType, instance);
          }
        });
      },
      cells: function (r) {
        if (r === 0) this.renderer = boldRenderer;
      },

    });
  };


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
