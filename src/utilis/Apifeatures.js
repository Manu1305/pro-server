
const Apifeature = ({ Product_find, req_query }) => {
  const filter = () => {
    const querycopy = { ...req_query };
    const removeField = ['page', 'keyword'];
    removeField.forEach((key) => delete querycopy[key]);
    Product_find = Product_find.find(querycopy);
    return Product_find;
  };

  const sort = (no, no1) => {
    const sellinglow = req_query.low;
    if (sellinglow !== undefined) {
      Product_find = Product_find.sort({ sellingPrice: no });
      return Product_find;
    }
    const datesort = req_query.date;
    if (datesort !== undefined) {
      Product_find = Product_find.sort({ createDate: no1 });
      return Product_find;
    }
    return Product_find;
  };

  const pagination = (width) => {
    if (Number(width) >= 1024) {
      const resultperpage = 50;
      const currentpage = Number(req_query.page) || 1;
      const skip = resultperpage * (currentpage - 1);
      Product_find = Product_find.limit(resultperpage).skip(skip);
      return Product_find;
    }
    return Product_find;
  };

  const search = () => {
    const keyword = req_query.keyword
      ? {
          title: {
            $regex: req_query.keyword,
            $options: 'i',
          },
        }
      : {};
    Product_find = Product_find.find({ ...keyword });
    console.log("Amar Ganndu")
    return Product_find;
  };

  return {
    filter,
    sort,
    pagination,
    search,
  };
};

export default Apifeature;
