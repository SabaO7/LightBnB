const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// Getting user with email address
const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error(err.message);
    });
};

// Getting user with ID
const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error(err.message);
    });
};

// Add User 
const addUser = function(user) {
  return pool
    .query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [user.name, user.email, user.password]
    )
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error(err.message);
    });
};

const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `
    SELECT properties.*, reservations.*, avg(rating) as average_rating
    FROM reservations
    JOIN properties ON properties.id = reservations.property_id
    JOIN property_reviews ON property_reviews.property_id = properties.id
    WHERE reservations.guest_id = $1
    GROUP BY properties.id, reservations.id
    ORDER BY start_date
    LIMIT $2;
  `;

  return pool
    .query(queryString, [guest_id, limit])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error fetching reservations:", err.message);
      throw new Error("Database error");
    });
};


/// Properties

const getAllProperties = (options, limit = 10) => {
  const queryParams = [];

  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    LEFT JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.length === 0 ? queryString += `WHERE ` : queryString += `AND `;
    queryParams.push(options.owner_id);
    queryString += `owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.length === 0 ? queryString += `WHERE ` : queryString += `AND `;
    queryParams.push(options.minimum_price_per_night * 100); // Convert to cents as required
    queryString += `cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.length === 0 ? queryString += `WHERE ` : queryString += `AND `;
    queryParams.push(options.maximum_price_per_night * 100); // Convert to cents as required
    queryString += `cost_per_night <= $${queryParams.length} `;
  }

  queryString += `
    GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  return pool.query(queryString, queryParams).then((res) => res.rows);
};



const addProperty = function(property) {
  const queryString = `
    INSERT INTO properties (
      title, 
      description, 
      owner_id, 
      price_per_night, 
      thumbnail_photo_url, 
      cover_photo_url, 
      number_of_bathrooms, 
      number_of_bedrooms, 
      country, 
      street, 
      city, 
      province, 
      post_code
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
    RETURNING *;
  `;

  const values = [
    property.title,
    property.description,
    property.owner_id,
    property.price_per_night,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
    property.country,
    property.street,
    property.city,
    property.province,
    property.post_code
  ];

  return pool
    .query(queryString, values)
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error(err.message);
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
