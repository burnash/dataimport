/*global window */

(function (window) {
  'use strict';

  var dropFile = function (opts) {

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

    if (opts.target.addEventListener) {
      opts.target.addEventListener('dragenter', handleDragover, false);
      opts.target.addEventListener('dragover', handleDragover, false);
      opts.target.addEventListener('dragleave', handleDragleave, false);
      opts.target.addEventListener('drop', handleDrop, false);
    }
  };

  window.dropFile = dropFile;

}(window));
