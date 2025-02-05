export const RegisterHandlebars = function () {
  Handlebars.registerHelper("isLowerThan", function (value, compare) {
    if (value < compare) return true;
    return false;
  });

  Handlebars.registerHelper("isLargerThan", function (value, compare) {
    if (value > compare) return true;
    return false;
  });

  Handlebars.registerHelper("isNotEmptyString", function (value) {
    if (value === null) return false;
    if (value === "") return false;
    return true;
  });

  Handlebars.registerHelper("isZeroOrEmptyString", function (value) {
    if (value === null) return false;
    if (value === "") return false;
    if (parseFloat(value) === 0) return false;
    return true;
  });

  Handlebars.registerHelper("isAValueOf", function (value, dict) {
    for(var i in dict)
      if(dict[i] == value) return true;
    return false;
  });

  Handlebars.registerHelper("isAKeyOf", function (value, dict) {
    for(var i in dict)
      if(i == value) return true;
    return false;
  });

};
