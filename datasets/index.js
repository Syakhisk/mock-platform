import customer from "./customer.json" assert { type: "json" };
import productType from "./product-type.json" assert { type: "json" };
import productCategory from "./product-category.json" assert { type: "json" };
import unitOfMeasurement from "./unit-of-measurement.json" assert { type: "json" };
import marketingUser from "./marketing-user.json" assert { type: "json" };
import industryCategory from "./industry-category.json" assert { type: "json" };

const datasets = {
  ...customer,
  ...productType,
  ...productCategory,
  ...unitOfMeasurement,
  ...marketingUser,
  ...industryCategory,
};

export default datasets;
