var { transform } = require("node-json-transform");

var data = {
  title: "title1",
  description: "description1",
  blog: "This is a blog.",
  date: "11/4/2013",
  extra: {
    link: "http://goo.cm",
  },
  list1: [
    {
      name: "mike",
    },
  ],
  list2: [
    {
      item: "thing",
    },
  ],
  clearMe: "text",
};

var map = {
  item: {
    name: "title",
    info: "description",
    text: "blog",
    date: "date",
    link: "extra.link",
    item: "list1.0.name",
    clearMe: "",
    fieldGroup: ["title", "extra"],
  },
  operate: [
    {
      run: "Date.parse",
      on: "date",
    },
    {
      run: function (val) {
        return val + " more info";
      },
      on: "info",
    },
  ]
};

var transform = require("node-json-transform").transform;
var result = transform(data, map);
console.log(result);