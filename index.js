const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0000",
  port: 3306,
  database: "myntra",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to the Database");
});

const app = express();
let PORT = 4000;
app.use(bodyParser.json());


// GET All Users
const getAllUsers = async (req, res) => {
  try {
    const { limit, offset, sort } = req.query;
    
    if (!limit || !offset || !sort) {
      res.status(400).send({
        message: "Bad request",
      });
      return;
    }
    
    let queryString = `SELECT id, name, email, is_active, password FROM users ORDER BY id ${sort} LIMIT ? OFFSET ? `;
    const [result] = await con.promise().execute(queryString, [parseInt(limit), parseInt(offset)]);

    let countQueryString = `SELECT COUNT(id) AS count FROM users `;
    const [countResult] = await con.promise().execute(countQueryString);

    const responseBody = {
      message: "Successfully got all users",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while getting users",
      error,
    });
  }
};


// GET Specific user
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).send({
        message: "Bad request",
      });
      return;
    }
   
    let queryString = `SELECT name, email FROM users WHERE id = ?`;
    const [result] = await con.promise().execute(queryString, [id]);

    if (result.length === 0) {
      res.status(404).send({
        message: "User not found",
      });
      return;
    }
    res.status(200).send({
      message: "User found successfully!",
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error while getting user",
      error,
    });
  }
};


// POST User
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      res.status(400).send({
        message: "Bad request. Name, email, and password are required fields.",
      });
      return;
    }
    
    const queryString = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    const [result] = await con.promise().execute(queryString, [name, email, password]);

    res.status(201).send({
      message: "User created successfully",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error while creating user",
      error: error.message,
    });
  }
};


// PUT User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!id) {
      res.status(400).send({
        message: "Bad request. User ID is required.",
      });
      return;
    }

    const queryString = `UPDATE users SET name=?, email=?, password=? WHERE id=?`;
    const [result] = await con.promise().execute(queryString, [name, email, password, id]);

    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "User not found",
      });
    } else {
      res.status(200).send({
        message: "User updated successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error while updating user",
      error: error.message,
    });
  }
};


// DELETE User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({
        message: "Bad request. User ID is required.",
      });
      return;
    }

    const queryString = `DELETE FROM users WHERE id=?`;
    const [result] = await con.promise().execute(queryString, [id]);

    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "User not found",
      });
    } else {
      res.status(200).send({
        message: "User deleted successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error while deleting user",
      error: error.message,
    });
  }
};


// GET All Products
const getAllProducts = async (req, res) => {
  try {
    const { limit, offset, sort, sortType, start_price, end_price, type } = req.query;
   
    if (!limit || !offset || !sort || !sortType) {
      res.status(400).send({
        message: "Bad request",
      });
      return;
    }

    let whereArray = [];
    let whereData = [];
    let sortArray = [];

    if (start_price && end_price) {
      whereArray.push("price BETWEEN ? AND ?");
      whereData.push(start_price);
      whereData.push(end_price);
    }

    if (type) {
      whereArray.push("category = ?");
      whereData.push(type);
    }

    if (sort && sortType) {
      sortArray.push(`${sort} ${sortType}`);
    }

    let sortString = "";
    if (sortArray.length) {
      sortString = `ORDER BY ${sortArray.join(", ")}`;
    }

    let whereString = "";
    if (whereArray.length) {
      whereString = `WHERE ${whereArray.join(" AND ")}`;
    }

    let queryString = `SELECT id, name, category, description, price, gender, brand, size_id, color, material, image_URL FROM products
     ${whereString} ${sortString} LIMIT ? OFFSET ?`;

    const [result] = await con
      .promise()
      .execute(queryString, [...whereData, parseInt(limit), parseInt(offset)]);

    let countQueryString = `SELECT COUNT(id) AS count FROM products ${whereString}`;
    const [countResult] = await con.promise().execute(countQueryString, whereData);

    const responseBody = {
      message: "Successfully got all products",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error while getting products",
      error: error.message,
    });
  }
};


// GET Specific Product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).send({
        message: "Bad request",
      });
      return;
    }
    
    let queryString = `SELECT B.id AS productId,B.name AS productName,
B.description AS description,B.image_URL AS image,
B.price AS price,B.gender AS gender,B.brand AS brand,
C.name AS sizeName FROM products AS B
INNER JOIN sizes AS C ON B.size_id = C.id WHERE B.id = ?`;

    const [result] = await con.promise().execute(queryString, [id]);

    if (result.length === 0) {
      res.status(404).send({
        message: "Product not found",
      });
      return;
    }
    res.status(200).send({
      message: "Successfully found the product",
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error while getting product",
      error,
    });
  }
};


// POST Product
const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, gender, brand, size_id, color, material, image_URL } = req.body;
    
    if (!name || !category || !description || !price || !gender || !brand || !size_id || !color || !material || !image_URL) {
      res.status(400).send({
        message: "Bad request. All fields are required.",
      });
      return;
    }
    
    const queryString = `INSERT INTO products (name, category, description, price, gender, brand, size_id, color, material, image_URL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await con.promise().execute(queryString, [name, category, description, price, gender, brand, size_id, color, material, image_URL]);

    res.status(201).send({
      message: "Product created successfully",
      product_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error while creating product",
      error: error.message,
    });
  }
};


// PUT Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, gender, brand, size_id, color, material, image_URL } = req.body;

    if (!id) {
      res.status(400).send({
        message: "Bad request. Product ID is required.",
      });
      return;
    }

    const queryString = `UPDATE products SET name=?, category=?, description=?, price=?, gender=?, brand=?, size_id=?, color=?, material=?, image_URL=? WHERE id=?`;
    const [result] = await con.promise().execute(queryString, [name, category, description, price, gender, brand, size_id, color, material, image_URL, id]);

    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Product not found",
      });
    } else {
      res.status(200).send({
        message: "Product updated successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error while updating product",
      error: error.message,
    });
  }
};


// DELETE Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).send({
        message: "Bad request. Product ID is required.",
      });
      return;
    }

    const queryString = `DELETE FROM products WHERE id=?`;
    const [result] = await con.promise().execute(queryString, [id]);

    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Product not found",
      });
    } else {
      res.status(200).send({
        message: "Product deleted successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error while deleting product",
      error: error.message,
    });
  }
};



// GET Wishlist
const getWishlist = async (req, res) => {
  try {
    const { user_id } = req.headers;
    
    if (!user_id) {
      res.status(400).send({
        message: "Bad request",
      });
      return;
    }

    let queryString = `SELECT C.id AS userId, C.name AS userName, B.name AS productName, B.description AS description,
     B.image_URL AS image, B.price AS price, A.quantity AS quantity, A.is_active AS isActive 
     FROM wishlist AS A
    INNER JOIN products AS B ON B.id = A.product_id
    INNER JOIN users AS C ON C.id = A.user_id WHERE C.id = ?`;
    const [result] = await con.promise().execute(queryString, [user_id]);

    if (result.length === 0) {
      res.status(404).send({
        message: "Nothing in the wishlist",
      });
      return;
    }
    let countQueryString = `SELECT COUNT(C.id) AS count FROM wishlist AS A
    INNER JOIN products AS B ON B.id = A.product_id
    INNER JOIN users AS C ON C.id = A.user_id WHERE C.id = ?`;
    const [countResult] = await con.promise().execute(countQueryString, [user_id]);

    const responseBody = {
      message: "Successfully got wishlist",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
  } catch (error) {
    res.status(500).send({
      message: "Error while getting wishlist",
      error,
    });
  }
};


// POST wishlist
const addWishlist = async (req, res) => {
  try {
    const { user_id, product_id, is_active, quantity } = req.body;
    if (!user_id || !product_id || !is_active || !quantity) {
      res.status(400).send({
        message: "Bad request",
      });
      return;
    }

    let queryString = `INSERT INTO wishlist
    (user_id, product_id, is_active, quantity)
     VALUES (?, ?, ?, ?)`;
    const [result] = await con
      .promise()
      .execute(queryString, [user_id, product_id, is_active, quantity]);

    res.status(201).send({
      message: "Wishlist created successfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error while creating wishlist",
      error,
    });
  }
};


// PUT wishlist
const updateWishlist = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { user_id } = req.headers;

    if (!user_id || !quantity) {
      res.status(400).send({
        message: "Bad request",
      });
      return;
    }

    let queryString = `UPDATE wishlist SET quantity = ? WHERE user_id = ?`;
    const [result] = await con
    .promise()
    .execute(queryString, [quantity, user_id]);
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Nothing to update in the wishlist",
      });
      return;
    }
    let countQueryString = `SELECT COUNT(C.id) AS count FROM wishlist AS A
    INNER JOIN products AS B ON B.id = A.product_id
    INNER JOIN users AS C ON C.id = A.user_id WHERE C.id = ?`;
    const [countResult] = await con.promise().execute(countQueryString, [user_id]);
    
    const responseBody = {
      message: "Wishlist updated successfully",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
    } catch (error) {
    res.status(500).send({
    message: "Error while updating wishlist",
    error,
    });
    }
    };
    
    
// DELETE wishlist
  const deleteWishlist = async (req, res) => {
    try {
    const { is_active } = req.body;
    const { user_id } = req.headers;
    if (!user_id || is_active !== '0') {
      res.status(400).send({
        message: "Bad request",
      });
      return;
    }
    
    let queryString = `UPDATE wishlist SET is_active = ? WHERE user_id = ?`;
    const [result] = await con
      .promise()
      .execute(queryString, [is_active, user_id]);
    
    if (result.affectedRows === 0) {
      res.status(404).send({
        message: "Nothing to delete in the wishlist",
      });
      return;
    }
    let countQueryString = `SELECT COUNT(C.id) AS count FROM wishlist AS A
    INNER JOIN products AS B ON B.id = A.product_id
    INNER JOIN users AS C ON C.id = A.user_id WHERE C.id = ?`;
    const [countResult] = await con.promise().execute(countQueryString, [user_id]);
    
    const responseBody = {
      message: "Wishlist deleted successfully",
      list: result,
      count: countResult[0].count,
    };
    res.status(200).send(responseBody);
    } catch (error) {
    res.status(500).send({
    message: "Error while deleting wishlist",
    error,
    });
    }
    };
    
    
    //User routes
    app.get("/v1/users", getAllUsers);
    app.get("/v1/users/:id", getUserById);
    app.post("/v1/users", createUser);
    app.put("/v1/users/:id", updateUser);
    app.delete("/v1/users/:id", deleteUser);
    
    //Product routes
    app.get("/v1/products", getAllProducts);
    app.get("/v1/products/:id", getProductById);
    app.post("/v1/products", createProduct);
    app.put("/v1/products/:id", updateProduct);
    app.delete("/v1/products/:id", deleteProduct);
    
    //Wishlist routes
    app.get("/v1/wishlist", getWishlist);
    app.post("/v1/wishlist", addWishlist);
    app.delete("/v1/wishlist/:id", deleteWishlist);
    app.put("/v1/wishlist/:id", updateWishlist);
    
    
    app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    });