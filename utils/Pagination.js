class Pagination {
  page = 1;
  pageSize = 10;
  offset() {
    return (this.page - 1) * this.pageSize;
  }
  totalPages(count) {
    return Math.ceil(count / this.pageSize);
  }

  constructor(page, pageSize) {
    this.page = page;
    this.pageSize = pageSize;
  }
}

module.exports = Pagination;
