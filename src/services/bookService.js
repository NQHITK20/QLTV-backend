// Lấy danh sách sách theo danh mục
let getBooksByCategory = (categoryKey) => {
    return new Promise(async (resolve, reject) => {
        try {
            let books = await db.Book.findAll({
                where: {
                    category: categoryKey,
                    showing: 1
                },
                attributes: ['id', 'bookName', 'author', 'category', 'price', 'image', 'description'],
                order: [['createdAt', 'DESC']]
            });
            if (books && books.length > 0) {
                resolve({
                    errCode: 0,
                    data: books
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Không tìm thấy sách thuộc danh mục này.'
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};
import { raw } from "body-parser";
import { where } from "sequelize";
const db = require('../models');
const { Book, FvBook, sequelize } = db;
const exceljs = require('exceljs');
const Sequelize = require('sequelize');


let createBook = (data) =>{
    return new Promise(async (resolve, reject) => {
        try {
            let check = await db.Book.findOne({
                where :{bookName:data.bookName}
            })
            if (check) {
                resolve({
                    errCode: 1,
                    errMessage: "Tên sách đã có trong kho.",
                });   
            }
            else{
                let cat = await db.Category.findOne({
                    where:{id:data.category}
                })
                await db.Book.create({
                    bookName: data.bookName,
                    author: data.author,
                    bookCode: data.bookCode,
                    category: cat.category,
                    price: data.price,
                    soLuong: data.soLuong,
                    image: data.image,
                    showing: 0,
                    description: data.description,
                }),
                resolve({
                    errCode: 0,
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getAllCategory = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Category.findAll({
                attributes:['category','id']
            })
            if (data) {
                resolve({
                    data
                })
            } else {
                resolve({
                    errCode:1,
                    errMessage:"bug sever hoặc không tìm thấy data"
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getAllBook = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode:2,
                    errMessage:"bug sever không nhận được id truyền 1 hay nhiều"
                })
            }
            if (id=="F10") {
                let data = await db.Book.findAll({
                    order: [['createdAt', 'DESC']],
                    where :{showing: 1},
                    limit: 10
                })
                if (data) {
                    resolve({
                        data
                    })
                } else {
                    resolve({
                        errCode:1,
                        errMessage:"bug sever ko load đc data"
                    })
                } 
            }
            if (id=="L12") {
                    const dataRaw = await Book.findAll({
                        where: { showing: 1 },
                        attributes: [
                            'bookName',
                            'price',
                            'category',
                            'description',
                            'image',
                            'author',
                            [sequelize.fn('COUNT', sequelize.col('favorites.idfvbook')), 'favorite_count'],
                        ],
            include: [
              {
                model: FvBook,
                as: 'favorites',
                attributes: [],
              },
            ],
            group: ['Book.id'],
            order: [[sequelize.literal('favorite_count'), 'DESC']],
            limit: 12,
            subQuery: false,
            raw: true,
          });

                    // Chỉ giữ 6 cột mong muốn (tên, giá, danh mục, description, tác giả, hình ảnh)
                    const data = (dataRaw || []).map((r) => ({
                        bookName: r.bookName,
                        price: r.price,
                        category: r.category,
                        description: r.description,
                        author: r.author,
                        image: r.image,
                    }));

          if (data && data.length > 0) {
            resolve({
              errCode: 0,
              errMessage: "Lấy danh sách sách yêu thích thành công",
              data,
            });
          } else {
            resolve({
              errCode: 1,
              errMessage: "Không có dữ liệu sách yêu thích",
            });
          }
            }
            if (id=="ALLSHOW") {
                let data = await db.Book.findAll({
                    where :{showing: 1},
                    order: [['createdAt', 'DESC']]
                })
                if (data) {
                    resolve({
                        data
                    })
                } else {
                    resolve({
                        errCode:1,
                        errMessage:"bug sever ko load đc data"
                    })
                } 
            }
            if (id=="ALL") {
                let data = await db.Book.findAll({
                    order: [['createdAt', 'DESC']]
                })
                if (data) {
                    resolve({
                        data
                    })
                } else {
                    resolve({
                        errCode:1,
                        errMessage:"bug sever ko load đc data"
                    })
                } 
            }else{
                let data = await db.Book.findOne({
                    where:{id:id},
                })
                let category =  await db.Category.findOne({
                    where:{category:data.category},
                })
                if (data) {
                    resolve({
                        data,
                        category
                    })
                } else {
                    resolve({
                        errCode:3,
                        errMessage:"không tìm thấy data của id"
                    })
                } 
            }

        } catch (e) {
            reject(e);
        }
    })
}
let getRelatedBook = (categoryBook, bookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let relatedbook = await db.Book.findAll({
                where: {
                    category: categoryBook,
                    showing: 1,
                    id: {
                        [db.Sequelize.Op.ne]: bookId  // Điều kiện loại trừ sách có id là bookId
                    }
                },
                attributes: {
                    exclude: ['showing', 'description', 'createdAt', 'updatedAt']
                },
                order: [['createdAt', 'DESC']],
                limit: 7
            });

            if (relatedbook) {
                resolve({
                    relatedbook
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Lỗi server không tìm thấy sách'
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

let editBook = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
                let book = await db.Book.findOne({
                    where: { bookCode: data.bookCode },
                    raw: false
                })
                if (book) {
                    let cat = await db.Category.findOne({
                        where:{id:data.category}
                    })
                    book.author = data.author
                    book.bookName = data.bookName
                    book.category = cat.category
                    book.description = data.description
                    book.image = data.image
                    book.soLuong = data.soLuong
                    await book.save();
                    resolve({
                        errCode: 0,
                    });
                }
                else {
                    resolve({
                        errCode: 1,
                        errMessage: ' Lỗi sever không tìm thấy sách',
                    });
                }
        } catch (error) {
            reject(error)
        }
    })
}
let deleteBook = (bookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let book = await db.Book.findOne({
                where: { id: bookId }
            })
            if (!book) {
                resolve({
                    errCode: 2,
                    errMessage: `Lối sever : Không tồn tại sách`
                })
            }
            await db.Book.destroy({
                where: { id: bookId }
            });
            resolve({
                errCode: 0,
            })
        } catch (error) {
            reject(error)
        }
    })
}
let showHideBook = (bookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let book = await db.Book.findOne({
                where: { id: bookId },
                raw: false
            })
            if (book) {
                if (book.showing == 1) {
                    book.showing = 0
                    await book.save();
                    resolve({
                        errCode: 0,
                    });
                } else {
                    book.showing = 1
                    await book.save();
                    resolve({
                        errCode: 0,
                    });
                }
            }
            else {
                resolve({
                    errCode: 1,
                    errMessage: ' Lỗi sever không tìm thấy sách',
                });
            }
        } catch (error) {
            reject(error)
        }
    })
}
let exportDataBook = async () => {
    try {
        // Lấy dữ liệu từ cơ sở dữ liệu
        let data = await db.Book.findAll({
          attributes: {
            exclude: ['showing','image'],
            order: [['createdAt', 'DESC']]
          },
          raw: true // Lấy dữ liệu ở dạng đơn giản (plain objects)
        });
    
        if (data && data.length > 0) {
          // Tạo workbook Excel
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet('Data');
    
          // Lấy các thuộc tính của model làm tiêu đề cột
          const columnHeaders = Object.keys(data[0]); // Lấy tên cột từ đối tượng đầu tiên
    
          // Thêm tiêu đề cột trực tiếp vào hàng đầu tiên của worksheet
          worksheet.addRow(columnHeaders);
    
          // Điền dữ liệu vào các hàng
          data.forEach((row) => {
            worksheet.addRow(Object.values(row)); // Thêm dữ liệu hàng vào worksheet
          });
    
          // Trả về buffer chứa dữ liệu workbook
          const buffer = await workbook.xlsx.writeBuffer();
          return buffer;
        } else {
          return {
            errCode: 1,
            errMessage: "Không tìm thấy dữ liệu hoặc có lỗi từ server"
          };
        }
      } catch (error) {
        console.error('Có lỗi khi xử lý yêu cầu:', error);
        return {
          errCode: 2,
          errMessage: "Có lỗi khi xử lý yêu cầu"
        };
      }
};
let searchBook = (tukhoa) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm tất cả các sách có tên chứa từ khóa
            let books = await db.Book.findAll({
                where: {
                    bookName: {
                        [Sequelize.Op.like]: `%${tukhoa}%`
                    }
                }
            });

            // Kiểm tra nếu có sách tìm thấy
            if (books.length > 0) {
                resolve({
                    books
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: "Tên sách bạn tìm kiếm không có. Vui lòng thử lại."
                });
            }
        } catch (error) {
            // Xử lý lỗi và từ chối Promise
            reject(error);
        }
    });
};


module.exports = {
    createBook,getAllCategory,getAllBook,getRelatedBook,searchBook,
    editBook,deleteBook,showHideBook,exportDataBook,getBooksByCategory
}