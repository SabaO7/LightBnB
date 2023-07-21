SELECT city, COUNT(*) AS number_of_reservations
FROM properties
JOIN reservations ON properties.id = reservations.property_id
GROUP BY city
ORDER BY number_of_reservations DESC;
