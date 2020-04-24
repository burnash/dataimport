/*global document, jQuery, DataImport, dropFile, Papa, Fuse */

(function ($) {
  "use strict";

  var is = DataImport.is;

  $(document).ready(function () {
    var containerEl = document.getElementById("hot");
    var dataimport;

    var fields = [
      {
        id: "fullName",
        name: "Full Name",
        required: true,
      },
      {
        id: "birthday",
        name: "Birthday",
        required: false,
      },
      {
        id: "contactType",
        name: "Contact Type",
        required: true,
        choices: ["work", "home"],
        validate: [is.anyOf(["work", "home"], "Wrong value")],
      },
      {
        id: "email",
        name: "Email",
        required: true,
        validate: [
          is.unique(),
          is.matchingRegex(["[^@]+@[^.]+..+"], "Incorrect Email Address"),
        ],
      },
    ];

    var matchFields = function (fields, data) {
      var fuse = new Fuse(data[0]),
        mapping = [],
        obj = {},
        result,
        len,
        i;

      for (i = 0, len = fields.length; i < len; i += 1) {
        result = fuse.search(fields[i].id);
        if (result.length && !obj.hasOwnProperty(result[0])) {
          obj[result[0]] = fields[i].id;
        }
      }

      for (i = 0, len = data[0].length; i < len; i += 1) {
        mapping.push(obj[i] || null);
      }

      return mapping;
    };

    function complete(results) {
      if (results.errors) {
        console.log(results.errors);
      }

      if (dataimport) {
        dataimport.destroy();
      }

      dataimport = new DataImport(containerEl, {
        fields: fields,
        data: results.data,
        sheetHeight: 200,
        matchFields: matchFields,
      });
    }

    function parse(file) {
      Papa.parse(file, {
        complete: complete,
      });
    }

    function displayErrors(errors) {
      var $errors = $(".errors"),
        len = errors.length,
        i;
      for (i = 0; i < len; i += 1) {
        $errors.append("<li>" + errors[i].msg + "</li>");
      }
      $(".validation-errors").show();
    }

    function displayResult(result) {
      $(".result pre").html(JSON.stringify(result, null, " "));
      $(".result").show();
    }

    dropFile({
      target: document.getElementById("drop"),
      onload: parse,
    });

    $(".use-example-csv").click(function () {
        parse(window._dataimportExampleCSV);
        return false;
    });

    $(".btn-submit").click(function () {
      $(".errors").empty();
      $(".validation-errors").hide();
      $(".result").hide();
      $(".result pre").empty();

      dataimport.validate({
        complete: function (result) {
          displayResult(result);
        },
        fail: function (errors) {
          displayErrors(errors);
        },
      });
    });
  });
})(jQuery);
