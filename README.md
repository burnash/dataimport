# DataImport.js

Simple JavaScript browser-based CSV importer.

Features:
 * Uses Handsontable to display data.
 * Field to property mapping.
 * Data validation.

[Demo on JSFiddle](https://jsfiddle.net/gh/get/library/pure/burnash/dataimport/tree/master/demo/)

## Example

```javascript
var is = DataImport.is;

var containerElement = document.getElementById("handsontable-element");

var dataimport = new DataImport(containerElement, {
  fields: [{
    id: "fullName",
    name: "Full Name",
    required: true
  }, {
    id: "birthday",
    name: "Birthday",
    required: false,
  }, {
    id: "contactType",
    name: "Contact Type",
    required: true,
    choices: ["work", "home"],
    validate: [
      is.anyOf(["work", "home"], "Wrong value")
    ]
  }, {
    id: "email",
    name: "Email",
    required: true,
    validate: [
      is.unique(),
      is.matchingRegex(["[^@]+@[^\.]+\..+"], "Incorrect Email Address")
    ]
  }],
});

dataimport.validate({
  complete: function (result) {
    console.log(result);
  },
  fail: function (errors) {
    console.log(errors);
  }
});
```
