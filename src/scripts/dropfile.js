/*global window */

(function (window) {
  'use strict';

  var DropFile = function DropFile(opts) {

    function handleDrop(e) {
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files,
        f = files[0];

      opts.onload(f);
    }

    function handleDragover(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setTimeout(function () {
        $(e.target).css('border-color', '#0000ff');
      }, 10);
    }

    function handleDragleave(e) {
      e.stopPropagation();
      e.preventDefault();
      setTimeout(function () {
        $(e.target).css('border-color', '#bbb');
      }, 10);
    }

    if (opts.drop.addEventListener) {
      opts.drop.addEventListener('dragenter', handleDragover, false);
      opts.drop.addEventListener('dragover', handleDragover, false);
      opts.drop.addEventListener('dragleave', handleDragleave, false);
      opts.drop.addEventListener('drop', handleDrop, false);
    }
  };

  window.DropFile = DropFile;

}(window));
