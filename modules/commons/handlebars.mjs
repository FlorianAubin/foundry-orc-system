export const RegisterHandlebars = function () {
  Handlebars.registerHelper("isLowerThan", function (value, compare) {
    let result = false;

    if (value < compare) result = true;

    return result;
  });
};
