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

  var fields = [{
    id: 'imageName',
    name: 'File Name'
  }, {
    id: 'subjectId',
    name: 'Subject Id'
  }, {
    id: 'imageType',
    name: 'Image Type'
  }, ];

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

  function buildButton() {
    var button = document.createElement('BUTTON');

    button.innerHTML = '\u25BC';
    button.className = 'changeType';

    return button;
  }

  function setColumnType(i, type, instance) {
    columns[i].type = type;
    instance.updateSettings({
      columns: columns
    });
    instance.validateCells(function () {
      instance.render();
    });
  }

  var Sheet = function (container) {
    var self = this;
    this.fields = [];

    this.hot = new Handsontable(container, {
      startRows: 5,
      startCols: 3,
      stretchH: 'all',
      rowHeaders: true,
      colHeaders: true,
      afterGetColHeader: function (col, TH) {
        if (col < 0) {
          return;
        }

        var instance = this,
          menu = buildMenu(self.fields[col] && self.fields[col].id),
          button = buildButton();

        addButtonMenuEvent(button, menu);

        Handsontable.Dom.addEvent(menu, 'click', function (event) {
          if (event.target.nodeName === 'LI') {
            setColumnType(col, event.target.data.colType, instance);
          }
        });
        TH.firstChild.appendChild(button);
      },
    });
  };


  Sheet.prototype.loadData = function (data) {
    console.log(data);
    this.hot.loadData(data);
  };

  Sheet.prototype.setFields = function (fields) {
    this.fields = fields;

    var colHeaders = this.fields.map(function (x) {
      return x.name;
    });

    this.hot.updateSettings({
      colHeaders: colHeaders
    });
  };

  window.Sheet = Sheet;

}(window, document, Handsontable));
