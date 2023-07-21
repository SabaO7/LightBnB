SELECT
  properties.id,
  properties.title,
  properties.cost_per_night,
  AVG(property_reviews.rating) AS average_rating
FROM
  properties
JOIN
  reservations ON properties.id = reservations.property_id
JOIN
  property_reviews ON reservations.id = property_reviews.reservation_id
WHERE
  properties.city LIKE '%ancouv%'
GROUP BY
  properties.id
HAVING
  AVG(property_reviews.rating) >= 4
ORDER BY
  properties.cost_per_night
LIMIT 10;