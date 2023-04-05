export const RegisterHandlebars = function () {
  Handlebars.registerHelper("isLowerThan", function (value, compare) {
    if (value < compare) return true;
    return false;
  });

  Handlebars.registerHelper("isNotEmptyString", function (value) {
    if (value === null) return false;
    if (value === "") return false;
    return true;
  });
};
