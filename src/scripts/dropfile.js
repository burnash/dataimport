/* global Papa,$ */
'use strict';

var DropFile = function DropFile(opts) {

    function handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer.files;
        var f = files[0];
        // parse first file
        //       debugger;
        function complete(results, file) {
            if (results.errors) {
                console.log(results.errors);
            }
            opts.on.drawsheet(results.data, results.meta.fields);
        }
        Papa.parse(f, {
            header: true,
            complete: complete
        });
        // draw
    }

    function handleDragover(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setTimeout(function() {
            $(e.target).css('border-color', '#0000ff');
        }, 10);
    }

    function handleDragleave(e) {
        e.stopPropagation();
        e.preventDefault();
        setTimeout(function() {
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

