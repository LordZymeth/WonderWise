/* ═══════════════════════════════════════════════════════
   Seed Script: All 12 Bicol Destinations
   Run this in Supabase SQL Editor after creating schema
═══════════════════════════════════════════════════════ */

INSERT INTO public.destinations (name, location, category, description, image_url, gallery, activities, average_rating)
VALUES
  (
    'Farmplate',
    'Daraga, Albay',
    'Nature',
    'FarmPlate is an eco-tourism farmstay in Daraga, Albay, Philippines. Known as the "Albay version of Farmville", this destination offers visitors an authentic agricultural experience amidst the lush countryside. Guests can participate in farm activities, enjoy organic farm-to-table dining, and immerse themselves in the peaceful rural lifestyle. The farm is surrounded by stunning views of rice paddies, local flora, and the iconic Mayon Volcano in the distance.',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=800',
    '["https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=600", "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600"]',
    '["Farm activities", "Organic dining", "Rural tours", "Photography", "Relaxation"]',
    4.8
  ),
  (
    'Solong Eco Park',
    'Camalig, Albay',
    'Adventure',
    'Solong Eco Park, Caves and Mountains, is a serene natural retreat located in Camalig, Albay. This adventure destination features stunning cave formations, hiking trails through mountainous terrain, and pristine natural pools. It is perfect for nature enthusiasts, adventurers, and those seeking an escape into the wilderness. The park offers various trekking routes of varying difficulty levels and opportunities to explore underground cave systems.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", "https://images.unsplash.com/photo-1502934691857-5a4f73a6835b?w=600"]',
    '["Cave exploration", "Hiking", "Swimming", "Rock climbing", "Camping"]',
    4.7
  ),
  (
    'Subic Islands',
    'Matnog, Sorsogon',
    'Island',
    'Subic Island (often called Subic Beach) in Matnog, Sorsogon, is a tropical paradise located on Colón Island. This island destination is known for its pristine white sandy beaches, crystal-clear turquoise waters, and vibrant coral reefs. It is ideal for beach lovers, snorkeling enthusiasts, and those seeking sun, sand, and sea. The island remains relatively untouched and offers a peaceful retreat away from crowds.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600"]',
    '["Snorkeling", "Swimming", "Beach lounging", "Diving", "Island hopping"]',
    4.9
  ),
  (
    'Misibis Bay',
    'Bacacay, Albay',
    'Resort',
    'Misibis Bay is a premium, 5-hectare tropical island resort located on Cagraray Island in Bacacay, Albay. This luxury destination offers world-class amenities, stunning beachfront accommodations, and exceptional dining experiences. The resort is surrounded by pristine beaches, lush tropical gardens, and offshore islands. It is perfect for families, couples, and those seeking an upscale beach vacation with all modern comforts.',
    'https://images.unsplash.com/photo-1590523773073-7e93b5b5e6de?w=800',
    '["https://images.unsplash.com/photo-1590523773073-7e93b5b5e6de?w=600", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"]',
    '["Beach resort", "Spa treatments", "Water sports", "Dining", "Sunset views"]',
    4.9
  ),
  (
    'San Bernardino Island',
    'Bulusan, Sorsogon',
    'Island',
    'San Bernardino Island (often called the "Batanes of the South") is a tranquil, remote destination in Bulusan, Sorsogon. Known for its untouched natural beauty, this island features dramatic cliffs, unspoiled beaches, and windswept landscapes. The destination offers solitude and authentic nature experiences, making it perfect for adventurous travelers seeking off-the-beaten-path exploration and photography opportunities.',
    'https://images.unsplash.com/photo-1520583983782-51e76032e5ab?w=800',
    '["https://images.unsplash.com/photo-1520583983782-51e76032e5ab?w=600", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"]',
    '["Photography", "Hiking", "Rock formations", "Beach exploration", "Solitude"]',
    4.8
  ),
  (
    'Caramoan Island',
    'Caramoan, Camarines Sur',
    'Island',
    'Caramoan is a remote, breathtaking peninsula in Camarines Sur, Philippines, famous for its dramatically sculptured limestone cliffs, pristine beaches, and hidden lagoons. This destination gained international recognition from TV shows filmed here. Caramoan offers stunning landscapes for photography, island hopping, and adventure activities. The rugged coastline and secluded coves provide a true tropical escape.',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
    '["https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600", "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600"]',
    '["Island hopping", "Beach exploration", "Photography", "Limestone coves", "Snorkeling"]',
    4.8
  ),
  (
    'Cagsawa Ruins',
    'Daraga, Albay',
    'Adventure',
    'The Cagsawa Ruins in Daraga, Albay are the iconic, crumbling remnants of a 16th-century Franciscan church. Buried during the catastrophic 1814 eruption of Mayon Volcano, the ruins now stand as a poignant historical monument and symbol of resilience. Situated with Mayon Volcano as a dramatic backdrop, this destination offers both historical significance and stunning photography opportunities, particularly during sunrise and sunset.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600"]',
    '["Historical tours", "Photography", "Sunrise viewing", "Local history", "Volcano views"]',
    4.6
  ),
  (
    'Halea Nature Park',
    'Ticao Island, Masbate',
    'Nature',
    'Halea Nature Park is a secluded, privately owned sanctuary located on San Miguel Island near Ticao Island in Masbate. This conservation area is dedicated to preserving endemic bird species and natural habitats. The park features nature trails through pristine forests, bird watching opportunities, and encounters with wildlife in their natural environment. It is perfect for nature lovers, bird enthusiasts, and eco-tourists seeking immersive wildlife experiences.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    '["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600", "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600"]',
    '["Bird watching", "Nature trails", "Wildlife photography", "Forest walks", "Conservation"]',
    4.7
  ),
  (
    'Maribina Falls',
    'Bato, Catanduanes',
    'Nature',
    'Maribina Falls is situated in the town of Bato, and is one of the most famous and most accessible waterfalls in Catanduanes. This natural wonder features cascading water dropping over moss-covered rocks into a serene natural pool. The surrounding landscape is lush and verdant, creating a tranquil environment perfect for nature walks, swimming, and photography. The easy accessibility makes it popular with families and casual tourists.',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800',
    '["https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"]',
    '["Waterfall swimming", "Hiking", "Photography", "Picnicking", "Nature walks"]',
    4.7
  ),
  (
    'Ligñon Hill Nature Park',
    'Legazpi, Albay',
    'Adventure',
    'Ligñon Hill is a prominent hill in the city of Legazpi, Albay, Philippines. Ligñon Hill Nature Park offers recreational trails, panoramic views of Legazpi city, and a stunning backdrop of Mayon Volcano. The hill is easily accessible and popular with hikers, fitness enthusiasts, and families. Early morning hikes are particularly rewarding, with opportunities for sunrise viewing and photography of the iconic volcano.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", "https://images.unsplash.com/photo-1551481851-7c54fcf11ffe?w=600"]',
    '["Hiking", "Sunrise viewing", "Photography", "Fitness", "Volcano views"]',
    4.6
  ),
  (
    'Albay Park & Wildlife',
    'Legazpi, Albay',
    'Nature',
    'Located at the foot of Ligñon Hill in Legazpi City, is a 5-hectare sanctuary serving as a wildlife haven and recreational area. The park is home to various native and exotic animal species housed in naturalistic habitats. It combines education, conservation, and recreation, offering visitors opportunities to observe wildlife, enjoy nature trails, and participate in environmental learning programs.',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
    '["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600"]',
    '["Wildlife viewing", "Educational tours", "Nature trails", "Photography", "Family activities"]',
    4.5
  ),
  (
    'Donsol Visitor Center',
    'Donsol, Sorsogon',
    'Adventure',
    'The Donsol Visitor Center (officially managed by the Donsol Municipal Tourism Office) is the gateway to one of the world\'s most accessible whale shark encounters. During the peak season (November to June), visitors can swim alongside these gentle giants in their natural habitat. The center provides information, guides, and facilities for this unique eco-tourism experience. It represents responsible wildlife tourism and marine conservation efforts.',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    '["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"]',
    '["Whale shark swimming", "Snorkeling", "Eco-tourism", "Marine education", "Photography"]',
    4.9
  );
