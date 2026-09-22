/**
 * A small set of well-known landmarks per supported city, with real
 * approximate coordinates. Used only to auto-calculate a straight-line-based
 * distance estimate between a pickup and destination the traveler picks —
 * this is a convenience, not a routing engine. For anything not in this
 * list, the Fair Price Checker falls back to manual distance entry.
 */
export const CITY_LANDMARKS = {
  Mumbai: [
    { name: 'Chhatrapati Shivaji Airport (T2)', lat: 19.0896, lng: 72.8656 },
    { name: 'Andheri', lat: 19.1197, lng: 72.8464 },
    { name: 'Bandra', lat: 19.0596, lng: 72.8295 },
    { name: 'Dadar', lat: 19.0178, lng: 72.8478 },
    { name: 'Colaba', lat: 18.9067, lng: 72.8147 },
    { name: 'Powai', lat: 19.1176, lng: 72.9060 },
    { name: 'Juhu', lat: 19.1076, lng: 72.8263 },
    { name: 'Worli', lat: 19.0176, lng: 72.8162 },
    { name: 'CST Station', lat: 18.9401, lng: 72.8352 },
  ],
  Delhi: [
    { name: 'IGI Airport (T3)', lat: 28.5562, lng: 77.1000 },
    { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
    { name: 'Karol Bagh', lat: 28.6519, lng: 77.1909 },
    { name: 'Saket', lat: 28.5245, lng: 77.2066 },
    { name: 'Cyber City, Gurgaon', lat: 28.4949, lng: 77.0890 },
  ],
  Bengaluru: [
    { name: 'Kempegowda Airport', lat: 13.1986, lng: 77.7066 },
    { name: 'MG Road', lat: 12.9758, lng: 77.6045 },
    { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
    { name: 'Electronic City', lat: 12.8452, lng: 77.6602 },
    { name: 'Koramangala', lat: 12.9352, lng: 77.6146 },
  ],
  Pune: [
    { name: 'Pune Airport', lat: 18.5822, lng: 73.9197 },
    { name: 'Shivajinagar', lat: 18.5308, lng: 73.8475 },
    { name: 'Hinjewadi', lat: 18.5908, lng: 73.7397 },
    { name: 'Koregaon Park', lat: 18.5362, lng: 73.8938 },
  ],
  Nagpur: [
    { name: 'Dr. Ambedkar Airport', lat: 21.0922, lng: 79.0472 },
    { name: 'Sitabuldi', lat: 21.1498, lng: 79.0806 },
    { name: 'Civil Lines', lat: 21.1560, lng: 79.0700 },
    { name: 'Dharampeth', lat: 21.1372, lng: 79.0629 },
  ],
  Jaipur: [
    { name: 'Jaipur Airport', lat: 26.8242, lng: 75.8122 },
    { name: 'MI Road', lat: 26.9124, lng: 75.7873 },
    { name: 'Malviya Nagar', lat: 26.8535, lng: 75.8039 },
    { name: 'C-Scheme', lat: 26.9082, lng: 75.8017 },
  ],
  Goa: [
    { name: 'Dabolim Airport', lat: 15.3808, lng: 73.8314 },
    { name: 'Panaji', lat: 15.4909, lng: 73.8278 },
    { name: 'Calangute', lat: 15.5439, lng: 73.7553 },
    { name: 'Margao', lat: 15.2832, lng: 73.9862 },
  ],
}
