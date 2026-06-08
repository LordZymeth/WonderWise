/* ═══════════════════════════════════════════════════════
   WanderWise — app.js  (Persistent Edition)
   All user data, session, favorites, trips and reviews
   survive refresh and browser-close via localStorage.
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   STORAGE LAYER
   Every mutable collection has its own LS key.
   Immutable seed data (destinations) is embedded here
   and never overwritten unless the admin edits it.
══════════════════════════════════════════════════════ */

const LS = {
  USERS:       'ww_users',
  REVIEWS:     'ww_reviews',
  FAVORITES:   'ww_favorites',
  TRIPS:       'ww_trips',
  DESTINATIONS:'ww_destinations',
  SESSION:     'ww_session',
  COUNTERS:    'ww_counters',
};

/* ── seed destinations (written to LS only on first load) ── */
const SEED_DESTINATIONS = [
    { id: 1, name: 'Farmplate', location: 'Daraga, Albay', category: 'Nature', description: 'FarmPlate is an eco-tourism farmstay in Daraga, Albay, Philippines. Known as "Albay version of Farmville," the 2.7-hectare destination features rolling greenery, farm-to-table food hubs, and unobstructed views of Mt. Mayon. It is famous for housing the smallest chapel in the Philippines and offering a rustic countryside escape.', imageUrl: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/12/dc/e1/a5.jpg', gallery: ['https://i.redd.it/asmsf9k08ile1.jpeg', 'https://lakwatserongirigenyo.travel.blog/wp-content/uploads/2019/11/14e95861-30c2-4be4-b3d0-f1b40afe8238.jpeg?w=952', 'https://lakwatserongirigenyo.travel.blog/wp-content/uploads/2019/11/bfbeed16-32dd-4e4e-beb6-e2d03f38ce72.jpeg?w=1024'], mapLink: '#', activities: ['Kite Flying', 'Scenic Gazing', 'Farm-to-Table Dining', 'Picnics', 'Bonfire & Live Music', 'Photography Walks'], rating: [], reviews: [], dateAdded: '2024-01-10' },
    { id: 2, name: 'Solong Eco Park', location: 'Camalig, Albay', category: 'Adventure', description: 'Solong Eco Park, Caves and Mountains, is a serene natural retreat located in Camalig, Albay, Philippines. The park is renowned for its stunning landscapes, featuring lush greenery, intriguing caves, and majestic mountains, ideal for hiking and exploration. With its diverse ecosystem, it is a great spot for nature lovers and adventure seekers.', imageUrl: 'https://bicoltravelguides.com/wp-content/uploads/2025/10/Bicol-Travel-Guides-Blog-Images-56.jpg', gallery: ['https://7641islands.ph/wp-content/uploads/2022/07/PLYGRND-308366-scaled.jpg', 'https://media-cdn.tripadvisor.com/media/photo-c/1280x250/11/f0/6f/5e/quitinday-underground.jpg', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjf6PWQLRa-SyHifLILwwXCnaKR07g4Sg_CnfRt2q4_5o_A_mX-2mscN3Jc9CXcBOfrYJVsH_G2el3kdbNrOhhEyC2sJpfiIzP1nA30P15s6IAxtbjZj3akFH1oFTJtkpi1vWXwhNKAvcrL/s1600/DSC_1388.JPG'], mapLink: '#', activities: ['Hilltop Trekking', 'Cave Spelunking', 'Picnics', 'Scenic Photography', 'Birdwatching', 'Overnight Camping'], rating: 4.9, reviews: [], dateAdded: '2024-01-12' },
    { id: 3, name: 'Subic Islands', location: 'Matnog, Sorsogon', category: 'Island', description: 'Subic Island (often called Subic Beach) in Matnog, Sorsogon, is a tropical paradise located on Calintaan Island, at the southernmost tip of Luzon. Famous for its crystal-clear turquoise waters and soft "pinkish-white" sand, it is a serene, unspoiled destination perfect for swimming and island hopping', imageUrl: 'https://i0.wp.com/joansfootprints.com/wp-content/uploads/2024/08/grouphie-5-1-1024x576.jpg?resize=1024%2C576&ssl=1', gallery: ['https://bokun.s3.amazonaws.com/7ab9a3e2-0fbe-4917-a86f-83916cd06096.jpeg', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhEIPrSA_V_k5TBYuksWe9VvpN7KhEPR0wjZ5-EBW7WKvGlI8dEL2yv9TGoDahqWbSNxta0OK3bnAz1VbSJNbUwV4v6nziOqOKCzFJcys9YAWni9muuLsjI_EY3qz7N9hOM2vdog84brO5LcjwIvVaX0OrGN8UTa_xZhPL-BzlwbsijtR-J7fUpneIc/s2688/Juan%2520Lagoon%2520Fish%2520Sanctuary%2520-%25204.JPG', 'https://freedomwall.net/files/2018/12/calintaan-cave.jpg'], mapLink: '#', activities: ['Swimming, Diving, Snorkeling', 'Island Hopping', 'Water Sports', 'Fish Feeding', 'Beach Camping & Cottage Picnics', 'Cave Exploration'], rating: 4.7, reviews: [], dateAdded: '2024-01-14' },
    { id: 4, name: 'Misibis Bay', location: 'Bacacay, Albay', category: 'Resort', description: 'Misibis Bay is a premium, 5-hectare tropical island resort located on Cagraray Island in Bacacay, Albay. Famous for its stunning views of the Mayon Volcano, the resort seamlessly blends luxurious seclusion with adventure, offering private beaches, multiple pools, an on-site spa, and water sports.', imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/02/27/63/f0/misibis-bay-aerial-shot.jpg?w=900&h=-1&s=1', gallery: ['https://cf.bstatic.com/xdata/images/hotel/max1024x768/431956171.jpg?k=c8d9d4c852ef78a67074523ab9c96507dd624936d483ab9308b13a0330aa2a58&o=', 'https://www.rappler.com/tachyon/r3-assets/8B1FE9BEE1A64BA389EEFBF025BE8048/img/6ED50B35D6314CCD9A4B2CF0E187FD17/Misibis-Bay-Resort-August-25-2017-039.jpg', 'https://gttp.images.tshiftcdn.com/369593/x/0/enjoy-breathtaking-views-and-exclusive-amenities-during-this-misibis-bay-resort-day-tour.jpg?dpr=2&height=360&quality=65'], mapLink: '#', activities: ['Windsurfing', 'Diving & Snorkeling', 'Crystal Kayaking', 'Zipline', 'Wakeboarding / Knee Boarding', 'ATV'], rating: 4.5, reviews: [], dateAdded: '2024-01-16' },
    { id: 5, name: 'San Bernardino Island', location: 'Bulusan, Sorsogon', category: 'Island', description: 'San Bernardino Island (often called the "Batanes of the South") is a tranquil, remote destination situated off the coast of Bulusan, Sorsogon. It is best known for the historic San Bernardino Lighthouse (Faro de Islote de San Bernardino) which dates back to the Spanish colonial era in 1896.', imageUrl: 'https://i.ytimg.com/vi/qUrMn5eNV-4/maxresdefault.jpg', gallery: ['https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/484539557_684767320873965_591797551770758199_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=86c6b0&_nc_eui2=AeEjG98TUWifmVgoPw0BHKzoaIF1sm6A2UxogXWyboDZTLcl3y7pCy5SO0x2LqyOke8jhFKFqIvDQF1_QMJJv-Th&_nc_ohc=rH6j5HNomhAQ7kNvwEfb11E&_nc_oc=AdrdPomAl4mr3q1ES_Ae3BEkg_V8z_08d4ak1_iQxWMy0aj5ioX6Ywdv-Obzwh8LP3U&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=3ukWUzLaQKcP3o4CsK3LpQ&_nc_ss=7b2a8&oh=00_Af8qWhm5tBQW3KNTn0ukVWnjE62YLXpU63rr8Cd5u3dChA&oe=6A25BAC4', 'https://outoftownblog.com/wp-content/uploads/2023/09/Lighthouse-on-the-cliff-of-San-Bernardino-Island-in-Sorsogon-by-Ron-Camara.jpeg', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj605QJPsW0eSVekSYsl5pg78EJroWxCGd1aUBYp4b7CF-Tw1XoDgnrVeJMqhQJeB9m5ilMiZ3lgAaC256GBoivQLItix__GALcAQ4nPMM3KFC0A_MN7H2fMDBbSDc1_GNO5J8ZCJorixk/s1600/P1080384.JPG'], mapLink: '#', activities: ['Lighthouse Exploration', 'Scenic Photgraphy', 'Scuba Diving & Snorkeling', 'Island Hopping', 'Camping & Stargazing', 'Birdwatching'], rating: 4.8, reviews: [], dateAdded: '2024-01-18' },
    { id: 6, name: 'Caramoan Island', location: 'Caramoan, Camarines Sur', category: 'Island', description: 'Caramoan is a remote, breathtaking peninsula in Camarines Sur, Philippines, famous for its dramatic limestone cliffs, secret lagoons, and pristine white-sand beaches. Widely known as the filming location for multiple international seasons of the reality show Survivor.', imageUrl: 'https://www.vacationhive.com/images/hives/22/22-caramoan-lahos-island.jpg', gallery: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80', 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&q=80'], mapLink: '#', activities: ['Island Hopping', 'Water Sports', 'Freediving / Cliff Diving', 'Parasailing', 'Zipline', 'Seafood Dining'], rating: 4.7, reviews: [], dateAdded: '2024-01-20' },
    { id: 7, name: 'Cagsawa Ruins', location: 'Daraga, Albay', category: 'Adventure', description: 'The Cagsawa Ruins in Daraga, Albay are the iconic, crumbling remnants of a 16th-century Franciscan church. Today, they stand as a haunting memorial to the devastating 1814 eruption of the Mayon Volcano and serve as a symbol of the resilience of the Bicolano people.', imageUrl: 'https://www.rvasia.org/sites/default/files/2024-01/cagsawaruins.jpg', gallery: ['https://mediaim.expedia.com/localexpert/1019042/f9131d29-8cd2-4f19-a952-fca9a8eb25c8.jpg?impolicy=resizecrop&rw=1005&rh=565', 'https://ameramor.wordpress.com/wp-content/uploads/2012/03/bicol11.jpg', 'https://coinventmediastorage.blob.core.windows.net/media-storage-container/gphoto_ChIJ_0o8--oBoTMRHR4GPxovjPY_0.jpg'], mapLink: '#', activities: ['Scenic Photography / Photowalk', 'Trail Trekking', 'ATV', 'Zipline', 'Cave Spelunking', 'Black Lava Wall'], rating: 4.9, reviews: [], dateAdded: '2024-01-22' },
    { id: 8, name: 'Halea Nature Park', location: 'Ticao Island, Masbate', category: 'Nature', description: 'Halea Nature Park is a secluded, privately owned sanctuary located on San Miguel Island in Monreal, Ticao Island, Masbate. Famed for its pristine white-sand coves, towering rock formations, and crystal-clear waters, it is a popular destination for snorkeling, diving, and spotting diverse marine life, including harmless juvenile sharks.', imageUrl: 'https://d3fphkxyf5o5bm.cloudfront.net/image-resize/format=webp,w=720/QwRY54Li1HMwD7oNfojYV9U1xyb2NjGsA0PtKdy3ZN', gallery: ['https://d3fphkxyf5o5bm.cloudfront.net/image-resize/format=webp,w=720/QwRY54Li1HMwD7oNfpIHs9N2dOXG1OSpsekJK5X1Xh', 'https://shoestringdiary.wordpress.com/wp-content/uploads/2019/05/guinhadap07shoestring.jpg?w=736', 'https://shoestringdiary.wordpress.com/wp-content/uploads/2019/05/guinhadap05shoestring.jpg?w=736'], mapLink: '#', activities: ['Snorkeling & Fish Feeding', 'Water Sports', 'Freediving / Cliff Diving', 'Overnight Camping', 'Underwater Sanctuary', 'Seafood Dining'], rating: 4.6, reviews: [], dateAdded: '2024-01-24' },
    { id: 9, name: 'Maribina Falls', location: 'Bato, Catanduanes', category: 'Nature', description: 'Maribina Falls is situated in the town of Bato, it is one of the most famous and most available waterfalls in the island. The falls is about 5-6 meters high with radiant spouting rapids of perfectly clear waters.', imageUrl: 'https://bicoltravelguides.com/wp-content/uploads/2025/09/Bicol-Travel-Guides-Blog-Images-23.jpg', gallery: ['https://bicoltravelguides.com/wp-content/uploads/2025/09/Bicol-Travel-Guides-Blog-Images-25.jpg', 'https://gocatanduanes.com/storage/2020/04/MaribinaFalls3-2-600x600.png', 'https://thumbs.dreamstime.com/b/beautiful-maribiina-waterfalls-bato-catanduanes-philippines-273017166.jpg'], mapLink: '#', activities: ['Swimming', 'Mountain / Rock Climbing', 'Cliff Diving', 'Tent Pitching / Camping', 'Cave Exploration', 'Fishing'], rating: 4.8, reviews: [], dateAdded: '2024-01-26' },
    { id: 10, name: 'Ligñon Hill Nature Park', location: 'Legazpi, Albay', category: 'Adventure', description: 'Ligñon Hill is a prominent hill in the city of Legazpi, Albay, Philippines. Ligñon Hill in Legazpi City, Philippines, is best known for offering breathtaking, unobstructed 360-degree views of the iconic Mayon Volcano, Legazpi City, and the Albay Gulf. Rising 156 meters (512 feet), the site functions as both an extreme adventure park and a vital scientific hub.', imageUrl: 'https://gttp.images.tshiftcdn.com/375966/x/0/lignon-hill-nature-park.jpg?crop=1.91%3A1&fit=crop&width=1200', gallery: ['https://i.redd.it/s54abzf9g6o31.jpg', 'https://i.ytimg.com/vi/j7ydiYQwG3Y/maxresdefault.jpg', 'https://lp-cms-production.imgix.net/2023-06/shutterstockeditorial1010449780.jpg?auto=format,compress&q=72&w=1920&fit=crop&crop=faces,edges'], mapLink: '#', activities: ['Zipline Ride', 'Rappelling', 'Bike Rental', 'Trail Trekking', 'Japanese Tunnel', 'Hilltop Picnic'], rating: 4.6, reviews: [], dateAdded: '2024-01-28' },
    { id: 11, name: 'Albay Park & Wildlife', location: 'Legazpi, Albay', category: 'Nature', description: 'Located at the foot of Ligñon Hill in Legazpi City, is a 5-hectare sanctuary serving as both a zoo and a botanical garden. It houses rescued endemic and endangered species, and offers family-friendly recreation including a lagoon, picnic cottages, and panoramic views of Mayon Volcano.', imageUrl: 'https://wowlegazpi.com/wp-content/uploads/2020/10/albay-park-wildlife3.jpg', gallery: ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjXM6synIU0wwaMgIvqXVq9cHRzQcXUo4NJc7w4asGylc2sEerwg8XpisKmk3Xl4uMrr6-HvhngC1m0c4FvPpPaMwuv5qGoUKjQLzimK2Z9UME4RjSt67uUr6juRr8qoEtZmIWmnRAVouja/s1600/DSC_1918.jpg', 'https://legazpi.bluelineph.com/wp-content/uploads/sites/44/2023/05/Albay-7.jpg', 'https://wowlegazpi.com/wp-content/uploads/2015/01/apw-4.jpg'], mapLink: '#', activities: ['Bike Rental', 'Animal Photowalk', 'Horseback Riding', 'Picnic', 'Paddle Boating', 'Fishing'], rating: 4.9, reviews: [], dateAdded: '2024-02-01' },
    { id: 12, name: 'Donsol Visitor Center', location: 'Donsol, Sorsogon', category: 'Adventure', description: 'The Donsol Visitor Center (officially managed by the Donsol Municipal Tourism Office) is the primary eco-tourism hub for the "Whale Shark Capital of the World." Located in Sorsogon, it serves as the registration, briefing, and boat-rental facility for ethical butanding (whale shark) interactions.', imageUrl: 'https://imgcdn.bokun.tools/fc58728d-b9bb-4519-bfb4-b5acc0245a4f.jpeg?w=660&h=660', gallery: ['https://thedailyroar.com/wp-content/uploads/2014/03/whaleshark.jpg', 'https://visaliv.s3.ap-south-1.amazonaws.com/Donsol-Sorsogon-Whale-Shark-Watching-in-PH.jpg', 'https://ik.imagekit.io/tvlk/xpe-asset/AyJ40ZAo1DOyPyKLZ9c3RGQHTP2oT4ZXW+QmPVVkFQiXFSv42UaHGzSmaSzQ8DO5QIbWPZuF+VkYVRk6gh-Vg4ECbfuQRQ4pHjWJ5Rmbtkk=/2001312305107/Donsol%252C%2520Sorsogon%2520Whale%2520Shark%2520Interaction%2520-%2520Day%2520Tour%2520from%2520Legazpi%2509-d966f3a1-c571-4636-ad23-cf35d75e226c.jpeg?tr=q-60,c-at_max,w-1280,h-720&_src=imagekit'], mapLink: '#', activities: ['Whale Shark Interaction & Snorkeling', 'Firefly Watching', 'Manta Bowl & Scuba Diving', 'River Kayaking', 'Island Hopping', 'Seafood Dining'], rating: 4.8, reviews: [], dateAdded: '2024-02-03' },
    { id: 13, name: 'CamSur Watersports Complex', location: 'Pili, Camarines Sur', category: 'Adventure', description: 'The CamSur Watersports Complex (CWC) is the first world-class cable ski and watersports park in the Philippines and Asia, located inside the Provincial Capitol Complex in Cadlan, Pili, Camarines Sur. Opened in 2006, this 6-hectare complex features a 6-point cable ski system designed for wakeboarding, water skiing, wake skating, and kneeboarding for both beginners and pros. Beyond the cable park, CWC offers a full resort experience with swimming pools, ziplines, a clubhouse restaurant and bar, a skate park, sports courts, and diverse accommodation options from tiki huts to cabanas — making it the ultimate adventure and leisure destination in Bicol.', imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/a0/b3/1c/cwc.jpg?w=900&h=-1&s=1', gallery: ['https://7641islands.ph/wp-content/uploads/2022/07/PLYGRND-308366-scaled.jpg', 'https://media-cdn.tripadvisor.com/media/photo-s/11/17/ba/cc/cwc.jpg', 'https://bicoltravelguides.com/wp-content/uploads/2025/10/Bicol-Travel-Guides-Blog-Images-56.jpg'], mapLink: '#', activities: ['Cable Wakeboarding', 'Water Skiing & Wake Skating', 'Kneeboarding', 'Kayaking & Stand-Up Paddleboarding', 'Zipline', 'Swimming & Pool Recreation'], rating: 0, reviews: [], dateAdded: '2024-02-05' },
    { id: 14, name: 'Bulusan Lake', location: 'Bulusan, Sorsogon', category: 'Nature', description: 'Bulusan Lake is a serene, emerald-green crater lake nestled within the 3,673-hectare Bulusan Volcano Natural Park in Sorsogon Province. Elevated at 360 meters above sea level and believed to occupy a former crater of the still-active Mt. Bulusan — the fourth most active volcano in the Philippines — the lake is cradled by dense rainforest teeming with rare bird species, endemic plants, and freshwater fish. Its misty forest atmosphere, cool mountain air, and tranquil dark-green waters make it one of the most peaceful eco-tourism escapes in the entire Bicol region.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Bulusan_Lake.jpg/1280px-Bulusan_Lake.jpg', gallery: ['https://outoftownblog.com/wp-content/uploads/2019/10/Bulusan-Lake-Sorsogon-1.jpg', 'https://www.thebackpackadventures.com/wp-content/uploads/2020/01/bulusan-lake-2.jpg', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80'], mapLink: '#', activities: ['Kayaking & Canoeing', 'Stand-Up Paddleboarding', 'Nature Trekking', 'Birdwatching', 'Wildlife & Nature Photography', 'Lakeside Picnicking'], rating: 0, reviews: [], dateAdded: '2024-02-08' },
    { id: 15, name: 'Bagasbas Beach', location: 'Daet, Camarines Norte', category: 'Adventure', description: 'Bagasbas Beach in Daet, Camarines Norte, is Bicol\'s premier surfing destination and one of the best beginner surf spots in the Philippines. Its consistent, long-rolling waves break along a wide shoreline backed by swaying palms and laid-back surf schools and resorts. Unlike crowded surf hubs elsewhere in the country, Bagasbas retains a relaxed, authentic local vibe, making it equally welcoming to first-timers learning to stand on a board and seasoned surfers chasing bigger swells during typhoon season. Surf lessons are readily available at around ₱400 per hour.', imageUrl: 'https://bicoltravelguides.com/wp-content/uploads/2025/09/Bicol-Travel-Guides-Blog-Images-40.jpg', gallery: ['https://7641islands.ph/wp-content/uploads/2022/07/BAGASBAS-scaled.jpg', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80', 'https://images.unsplash.com/photo-1455264745730-cb3b76250de8?w=600&q=80'], mapLink: '#', activities: ['Surfing & Surf Lessons', 'Bodyboarding', 'Swimming', 'Beach Volleyball', 'Sunset Photography', 'Overnight Beach Stays'], rating: 0, reviews: [], dateAdded: '2024-02-12' },
    { id: 16, name: 'Binurong Point', location: 'Baras, Catanduanes', category: 'Nature', description: 'Binurong Point is Catanduanes\'s most iconic natural attraction — a dramatic clifftop headland perched above the Pacific Ocean in Barangay Guinsaanan, Baras. Often compared to Batanes for its rolling emerald hills, steep sea cliffs, and vast open fields swept by howling Pacific winds, it has earned the nickname the "Irish Coast of the Philippines." The name comes from the old local practice of "binuro" — sun-drying and salt-curing fish — which fishermen once did on these very cliffs. Today it draws hikers, sunrise chasers, and photographers with its raw, uncrowded coastal beauty.', imageUrl: 'https://bicoltravelguides.com/wp-content/uploads/2025/09/Bicol-Travel-Guides-Blog-Images-23.jpg', gallery: ['https://lakbaypinas.com/wp-content/uploads/2024/01/Binurong-Point-Catanduanes-1.jpg', 'https://catanduanesnow.com/wp-content/uploads/2023/07/Binurong-Point-Sunrise.jpg', 'https://transitpinas.com/wp-content/uploads/2021/07/Binurong-Point-3.jpg'], mapLink: '#', activities: ['Sunrise Trekking & Hiking', 'Cliff & Coastal Photography', 'Pacific Ocean Viewpoint', 'Birdwatching & Flora Spotting', 'Guided Nature Walks', 'Nearby Puraran Surf Beach Visit'], rating: 0, reviews: [], dateAdded: '2024-02-16' },
    { id: 17, name: 'Buntod Sandbar & Reef Marine Sanctuary', location: 'Masbate City, Masbate', category: 'Island', description: 'The Buntod Reef Marine Sanctuary and Sandbar is a stunning 250-hectare protected eco-tourism site located just a 15-to-20-minute boat ride off the coast of Masbate City. During low tide, a pristine white sandbar emerges like a ribbon of white carpet stretching across the clear turquoise sea, flanked by vibrant coral reefs teeming with giant clams, colorful fish, and living corals. The sanctuary is managed by a local fisherfolk association (SAMAPUSI) and stands as a celebrated model of community-driven marine conservation, ranked among the Philippines\'s most resilient coral reef areas.', imageUrl: 'https://outoftownblog.com/wp-content/uploads/2016/01/Buntod-Reef-Marine-Sanctuary-Masbate.jpg', gallery: ['https://www.pinoyadventurista.com/wp-content/uploads/2017/08/Buntod-Reef-Marine-Sanctuary-Sandbar-Masbate-Tourist-Spots-2.jpg', 'https://www.traveling-up.com/wp-content/uploads/2019/01/buntod-reef-marine-sanctuary-sandbar-masbate-city-6.jpg', 'https://paradiseprovince.com/wp-content/uploads/2025/01/Buntod-Reef-Marine-Sanctuary-Sandbar-snorkeling.jpg'], mapLink: '#', activities: ['Snorkeling & Reef Exploration', 'Scuba Diving', 'Sandbar Swimming & Sunbathing', 'Kayaking', 'Mangrove Forest Trekking', 'Sunset & Sunrise Watching'], rating: 0, reviews: [], dateAdded: '2024-02-19' },
    { id: 18, name: 'Daraga Church', location: 'Daraga, Albay', category: 'Heritage', description: 'The Church of Nuestra Señora de la Porteria, commonly known as Daraga Church, is a magnificent 18th-century Baroque stone church perched atop Sta. Maria Hill in the town of Daraga, Albay. Built by Franciscan missionaries in 1773 from black volcanic rocks of Mayon Volcano, it was declared a National Cultural Treasure by the National Museum in 2007. Its striking Churrigueresque Baroque facade — adorned with four twisted Salomónica columns, carved foliage, and niched saints — frames a breathtaking backdrop of the iconic Mayon Volcano, making it one of the most photographed and historically significant churches in the Philippines.', imageUrl: 'https://www.lakwatsero.com/wp-content/uploads/2019/01/Daraga-Church-Albay.jpg', gallery: ['https://mediaim.expedia.com/localexpert/1019042/f9131d29-8cd2-4f19-a952-fca9a8eb25c8.jpg?impolicy=resizecrop&rw=1005&rh=565', 'https://ameramor.wordpress.com/wp-content/uploads/2012/03/bicol11.jpg', 'https://coinventmediastorage.blob.core.windows.net/media-storage-container/gphoto_ChIJP9zHVN8BoTMRsHp5d_v1bMQ_0.jpg'], mapLink: '#', activities: ['Historical Architecture Tour', 'Mayon Volcano Viewpoint', 'Religious Pilgrimage & Mass', 'Photography Walk', 'Heritage Trail Visit', 'Nearby Cagsawa Ruins Trip'], rating: 0, reviews: [], dateAdded: '2024-02-22' },
    { id: 19, name: 'Basilica of Our Lady of Peñafrancia', location: 'Naga City, Camarines Sur', category: 'Heritage', description: 'The Minor Basilica and National Shrine of Our Lady of Peñafrancia in Naga City is one of the largest and most visited Marian pilgrimage sites in Asia. The basilica enshrines the venerated image of "Ina" (Mother) — Our Lady of Peñafrancia — a devotion brought to Bicol in 1710 by Fr. Miguel Robles de Covarrubias. Every third Sunday of September, Naga City hosts the Peñafrancia Festival, dubbed the biggest Marian celebration in Asia, drawing millions of devotees for the grand Traslacion procession and the spectacular Fluvial Parade along the Naga River, where pilgrims chant "Viva La Virgen!" as Ina\'s flower-adorned pagoda glides through candlelit waters.', imageUrl: 'https://catholicshrinebasilica.com/wp-content/uploads/2023/09/Our-Lady-of-Penafrancia-Basilica-Naga.jpg', gallery: ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Pe%C3%B1afrancia_Basilica_Naga.jpg/1280px-Pe%C3%B1afrancia_Basilica_Naga.jpg', 'https://www.pilgrim-info.com/wp-content/uploads/2017/07/penafrancia-fluvial-procession.jpg', 'https://dateline-ibalon.com/wp-content/uploads/2025/09/Penafrancia-Festival-2025-Traslacion.jpg'], mapLink: '#', activities: ['Marian Pilgrimage & Prayer', 'Basilica Interior Tour', 'Peñafrancia Festival (September)', 'Fluvial Procession Watching', 'Novena Mass Attendance', 'Naga City Heritage Walk'], rating: 0, reviews: [], dateAdded: '2024-02-25' },
  ];

const SEED_USERS = [
  { id:1, firstName:'Demo',  lastName:'User',  email:'user@demo.com',  password:'password123', role:'user',  profilePhoto:null, dateCreated:'2024-01-15' },
  { id:2, firstName:'Admin', lastName:'User',  email:'admin@demo.com', password:'admin123',    role:'admin', profilePhoto:null, dateCreated:'2024-01-01' }
];

const SEED_REVIEWS = [
  { id:1, userId:1, destinationId:1, rating:5, comment:'Absolutely magical! The sunsets in Oia are unlike anything I\'ve ever seen. The food, the views, the warmth of the locals — Santorini exceeded every expectation.',                  reviewDate:'2024-02-10', userName:'Demo User'  },
  { id:2, userId:1, destinationId:2, rating:5, comment:'Kyoto is a living museum. The bamboo groves, the temples at dawn, the precision of the tea ceremony — it\'s a destination that genuinely changes your perspective.',                    reviewDate:'2024-02-15', userName:'Demo User'  },
  { id:3, userId:2, destinationId:3, rating:4, comment:'Patagonia is raw, wild, and humbling. Torres del Paine is one of the most dramatic landscapes on Earth. Pack layers — the weather is wildly unpredictable!',                          reviewDate:'2024-02-18', userName:'Admin User' },
  { id:4, userId:2, destinationId:7, rating:5, comment:'Standing at Machu Picchu as the clouds part and reveal the citadel is a once-in-a-lifetime moment. The Inca Trail is challenging but absolutely worth it.',                          reviewDate:'2024-02-20', userName:'Admin User' }
];

/* ── low-level LS helpers ─────────────────────────────── */
function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {
    console.warn('localStorage write failed:', e);
  }
}

/* ── bootstrap on first visit ────────────────────────── */
function bootstrapStorage() {
  // Only seed if keys are completely absent (first ever visit)
  if (!localStorage.getItem(LS.USERS))        lsSet(LS.USERS,        SEED_USERS);
  if (!localStorage.getItem(LS.REVIEWS))      lsSet(LS.REVIEWS,      SEED_REVIEWS);
  if (!localStorage.getItem(LS.FAVORITES))    lsSet(LS.FAVORITES,    []);
  if (!localStorage.getItem(LS.TRIPS))        lsSet(LS.TRIPS,        []);
  if (!localStorage.getItem(LS.DESTINATIONS)) lsSet(LS.DESTINATIONS, SEED_DESTINATIONS);
  if (!localStorage.getItem(LS.COUNTERS))     lsSet(LS.COUNTERS,     { nextUserId:3, nextReviewId:5, nextTripId:1 });
  // SESSION is intentionally NOT seeded — absence means logged-out
}

/* ── DB proxy: always reads from / writes to LS ──────── */
const DB = {
  get users()        { return lsGet(LS.USERS,        []); },
  set users(v)       { lsSet(LS.USERS, v); },

  get reviews()      { return lsGet(LS.REVIEWS,      []); },
  set reviews(v)     { lsSet(LS.REVIEWS, v); },

  get favorites()    { return lsGet(LS.FAVORITES,    []); },
  set favorites(v)   { lsSet(LS.FAVORITES, v); },

  get plannedTrips() { return lsGet(LS.TRIPS,        []); },
  set plannedTrips(v){ lsSet(LS.TRIPS, v); },

  get destinations() { return lsGet(LS.DESTINATIONS, []); },
  set destinations(v){ lsSet(LS.DESTINATIONS, v); },

  /* counters sub-object */
  get nextUserId()   { return lsGet(LS.COUNTERS, {}).nextUserId  || 3; },
  set nextUserId(v)  { const c = lsGet(LS.COUNTERS,{}); c.nextUserId  = v; lsSet(LS.COUNTERS, c); },

  get nextReviewId() { return lsGet(LS.COUNTERS, {}).nextReviewId || 5; },
  set nextReviewId(v){ const c = lsGet(LS.COUNTERS,{}); c.nextReviewId = v; lsSet(LS.COUNTERS, c); },

  get nextTripId()   { return lsGet(LS.COUNTERS, {}).nextTripId  || 1; },
  set nextTripId(v)  { const c = lsGet(LS.COUNTERS,{}); c.nextTripId  = v; lsSet(LS.COUNTERS, c); },

  /* helpers that mutate a collection and persist in one call */
  pushUser(u)        { const a = this.users;        a.push(u); this.users        = a; },
  pushReview(r)      { const a = this.reviews;      a.push(r); this.reviews      = a; },
  pushFavorite(f)    { const a = this.favorites;    a.push(f); this.favorites    = a; },
  pushTrip(t)        { const a = this.plannedTrips; a.push(t); this.plannedTrips = t ? [...a] : a; },
  pushDestination(d) { const a = this.destinations; a.push(d); this.destinations = a; },

  updateUser(id, patch) {
    const a = this.users;
    const i = a.findIndex(u => u.id === id);
    if (i !== -1) { Object.assign(a[i], patch); this.users = a; }
  },
  updateDestination(id, patch) {
    const a = this.destinations;
    const i = a.findIndex(d => d.id === id);
    if (i !== -1) { Object.assign(a[i], patch); this.destinations = a; }
  },
};

/* ══════════════════════════════════════════════════════
   SESSION PERSISTENCE
   currentUser is stored in LS so the user stays logged
   in after refresh. We store only the user id; the full
   record is always fetched fresh from DB.users so that
   profile edits are reflected immediately.
══════════════════════════════════════════════════════ */
let currentUser = null;

function sessionSave(user) {
  lsSet(LS.SESSION, user ? { id: user.id } : null);
}
function sessionRestore() {
  const s = lsGet(LS.SESSION, null);
  if (!s) return;
  const u = DB.users.find(x => x.id === s.id);
  if (u) { currentUser = u; }
}
function sessionClear() {
  localStorage.removeItem(LS.SESSION);
  currentUser = null;
}

/* ══════════════════ MISC STATE ══════════════════ */
let editingDestId   = null;
let currentDetailId = null;
let currentView     = 'grid';

/* ══════════════════ PAGE ROUTING ══════════════════ */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navLinks = document.querySelectorAll('.nav-link');
  if (page === 'home'         && navLinks[0]) navLinks[0].classList.add('active');
  if (page === 'destinations' && navLinks[1]) navLinks[1].classList.add('active');

  if (page === 'home')         renderFeatured();
  if (page === 'destinations') renderDestinations();
  if (page === 'profile') {
    if (!currentUser) { showPage('login'); return; }
    renderProfile();
  }
  if (page === 'admin') {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin access required.', 'error');
      showPage('home');
      return;
    }
    renderAdmin();
  }
}

/* ══════════════════ NAVBAR ══════════════════ */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
function updateNavAuth() {
  const guestAuth  = document.getElementById('guestAuth');
  const userAuth   = document.getElementById('userAuth');
  const profileLink= document.getElementById('profileNavLink');
  const adminLink  = document.getElementById('adminNavLink');
  if (currentUser) {
    guestAuth.style.display  = 'none';
    userAuth.style.display   = 'flex';
    document.getElementById('userGreeting').textContent = `Hi, ${currentUser.firstName}`;
    profileLink.style.display = 'inline';
    adminLink.style.display   = currentUser.role === 'admin' ? 'inline' : 'none';
  } else {
    guestAuth.style.display  = 'flex';
    userAuth.style.display   = 'none';
    profileLink.style.display = 'none';
    adminLink.style.display   = 'none';
  }
}

/* ══════════════════ AUTH ══════════════════ */
function handleLogin(e) {
  e.preventDefault();
  clearAuthErrors('login');
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('loginPass').value;
  let valid = true;

  if (!email)               { showFieldError('loginEmailErr', 'Email is required.');        valid = false; }
  else if (!isValidEmail(email)) { showFieldError('loginEmailErr', 'Enter a valid email.'); valid = false; }
  if (!pass)                { showFieldError('loginPassErr',  'Password is required.');     valid = false; }
  if (!valid) return;

  const user = DB.users.find(u => u.email.toLowerCase() === email && u.password === pass);
  if (!user) { showFormError('loginFormErr', 'Invalid email or password. Please try again.'); return; }

  currentUser = user;
  sessionSave(user);          // ← persist session
  updateNavAuth();
  showToast(`Welcome back, ${user.firstName}! ✦`, 'success');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value  = '';
  showPage('home');
}

function handleRegister(e) {
  e.preventDefault();
  clearAuthErrors('reg');
  const first   = document.getElementById('regFirst').value.trim();
  const last    = document.getElementById('regLast').value.trim();
  const email   = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass    = document.getElementById('regPass').value;
  const confirm = document.getElementById('regConfirm').value;
  let valid = true;

  if (!first)  { showFieldError('regFirstErr',   'First name is required.');               valid = false; }
  if (!last)   { showFieldError('regLastErr',    'Last name is required.');                valid = false; }
  if (!email)  { showFieldError('regEmailErr',   'Email is required.');                    valid = false; }
  else if (!isValidEmail(email))                 { showFieldError('regEmailErr',   'Enter a valid email address.'); valid = false; }
  else if (DB.users.find(u => u.email.toLowerCase() === email)) {
                  showFieldError('regEmailErr',   'This email is already registered.');    valid = false; }
  if (!pass)   { showFieldError('regPassErr',    'Password is required.');                 valid = false; }
  else if (pass.length < 8) { showFieldError('regPassErr', 'Password must be at least 8 characters.'); valid = false; }
  if (pass !== confirm)     { showFieldError('regConfirmErr', 'Passwords do not match.');  valid = false; }
  if (!valid) return;

  const id = DB.nextUserId;
  DB.nextUserId = id + 1;
  const newUser = {
    id, firstName: first, lastName: last, email,
    password: pass, role: 'user', profilePhoto: null,
    dateCreated: new Date().toISOString().split('T')[0]
  };
  DB.pushUser(newUser);       // ← saved to LS immediately

  document.getElementById('regFormOk').textContent = 'Account created! Redirecting to login…';
  document.getElementById('regFormOk').classList.add('show');
  setTimeout(() => {
    document.getElementById('regFormOk').classList.remove('show');
    ['regFirst','regLast','regEmail','regPass','regConfirm'].forEach(id => { document.getElementById(id).value = ''; });
    showPage('login');
  }, 1800);
}

function logout() {
  sessionClear();             // ← remove persisted session
  updateNavAuth();
  showToast('You have been signed out.', 'success');
  showPage('home');
}

/* ══════════════════ HOME ══════════════════ */
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = DB.destinations.slice(0, 6);
  grid.innerHTML = featured.map(d => destCardHTML(d)).join('');
  grid.querySelectorAll('.dest-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.08}s`;
    card.classList.add('fade-in');
  });
}

function doHomeSearch() {
  const q   = document.getElementById('homeSearchInput').value.trim();
  const cat = document.getElementById('homeSearchCat').value;
  showPage('destinations');
  setTimeout(() => {
    if (q)   document.getElementById('destSearch').value = q;
    if (cat) {
      document.querySelectorAll('#catFilters input[type=checkbox]')
        .forEach(cb => { if (cb.value === cat) cb.checked = true; });
    }
    filterDestinations();
  }, 100);
}

/* ══════════════════ DESTINATIONS ══════════════════ */
function renderDestinations() { filterDestinations(); }

function filterDestinations() {
  const q           = (document.getElementById('destSearch')?.value || '').toLowerCase();
  const checkedCats = [...document.querySelectorAll('#catFilters input:checked')].map(cb => cb.value);
  const sort        = document.getElementById('sortBy')?.value || 'name';

  let results = DB.destinations.filter(d => {
    const matchQ   = !q || d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q);
    const matchCat = checkedCats.length === 0 || checkedCats.includes(d.category);
    return matchQ && matchCat;
  });

  if (sort === 'name')   results.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'rating')  results.sort((a,b) => b.rating - a.rating);
  else if (sort === 'newest')  results.sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded));

  const grid  = document.getElementById('destGrid');
  const count = document.getElementById('resultsCount');
  if (!grid) return;
  count.textContent = `${results.length} destination${results.length !== 1 ? 's' : ''} found`;

  if (!results.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">🔍</div><h3>No destinations found</h3><p>Try adjusting your filters or search term.</p></div>`;
    return;
  }
  grid.innerHTML  = results.map(d => destCardHTML(d)).join('');
  grid.className  = `dest-grid${currentView === 'list' ? ' list-view' : ''}`;
}

function setView(view, btn) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterDestinations();
}

function resetFilters() {
  document.getElementById('destSearch').value = '';
  document.querySelectorAll('#catFilters input').forEach(cb => cb.checked = false);
  document.getElementById('sortBy').value = 'name';
  filterDestinations();
}

/* ══════════════════ DESTINATION CARD HTML ══════════════════ */
function destCardHTML(d) {
  const isFav    = currentUser && DB.favorites.some(f => f.userId === currentUser.id && f.destinationId === d.id);
  const reviews  = DB.reviews.filter(r => r.destinationId === d.id);
  const avgRating= reviews.length
    ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : d.rating.toFixed(1);
  return `
    <div class="dest-card" onclick="showDetail(${d.id})">
      <div class="dest-card-img">
        ${d.imageUrl ? `<img src="${d.imageUrl}" alt="${d.name}" onerror="this.parentElement.innerHTML='🌍'"/>` : '🌍'}
      </div>
      <div class="dest-card-actions">
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(event,${d.id})"
          title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="dest-card-body">
        <span class="dest-card-cat">${d.category}</span>
        <div class="dest-card-name">${d.name}</div>
        <div class="dest-card-loc">📍 ${d.location}</div>
        <div class="dest-card-rating">
          <span class="stars">${starsHTML(parseFloat(avgRating))}</span>
          <span class="rating-val">${avgRating}</span>
          <span style="font-size:.8rem;color:var(--text-light)">(${reviews.length} review${reviews.length !== 1 ? 's' : ''})</span>
        </div>
      </div>
    </div>`;
}

function starsHTML(rating) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += i <= Math.floor(rating) ? '★' : (i - rating < 1 && i - rating > 0 ? '½' : '☆');
  }
  return s;
}

/* ══════════════════ DESTINATION DETAIL ══════════════════ */
function showDetail(id) {
  currentDetailId = id;
  const d = DB.destinations.find(x => x.id === id);
  if (!d) return;
  const reviews  = DB.reviews.filter(r => r.destinationId === id);
  const avgRating= reviews.length
    ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : d.rating.toFixed(1);
  const isFav    = currentUser && DB.favorites.some(f => f.userId === currentUser.id && f.destinationId === id);

  const activitiesHTML = (d.activities || []).map((a, i) => `
    <li class="activity-item">
      <div class="activity-check" id="act-${i}" onclick="toggleActivity(this)"></div>
      <span>${a}</span>
    </li>`).join('');

  const reviewsHTML = reviews.length
    ? reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <span class="review-user">✦ ${r.userName}</span>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="stars" style="font-size:.9rem">${starsHTML(r.rating)}</span>
            <span class="review-date">${r.reviewDate}</span>
          </div>
        </div>
        <p class="review-comment">${r.comment}</p>
      </div>`).join('')
    : `<div class="empty-state"><div class="es-icon">💬</div><h3>No reviews yet</h3><p>Be the first to share your experience!</p></div>`;

  const galleryHTML = (d.gallery || []).map(img => `
  <div class="gallery-item">
    <img src="${img}" alt="${d.name}">
  </div>
`).join('');

  document.getElementById('detailContainer').innerHTML = `
    <div>
      <a href="#" class="detail-back" onclick="goBack()">← Back to Destinations</a>
      <div class="detail-hero">
        ${d.imageUrl ? `<img class="detail-hero-img" src="${d.imageUrl}" alt="${d.name}" onerror="this.remove()"/>` : ''}
        <div class="detail-hero-overlay">
          <div class="detail-cat">${d.category}</div>
          <h1 class="detail-title">${d.name}</h1>
          <p class="detail-loc">📍 ${d.location}</p>
          <div class="detail-rating">
            <span class="stars">${starsHTML(parseFloat(avgRating))}</span>
            <strong>${avgRating}</strong>
            <span style="opacity:.6;font-size:.9rem">(${reviews.length} reviews)</span>
          </div>
        </div>
      </div>
      <div class="detail-body">
        <div class="detail-main">
          <div class="detail-section">
            <h3>About ${d.name}</h3>
            <p class="detail-desc">${d.description}</p>
          </div>
          <div class="detail-section">
            <h3>Gallery</h3>
            <div class="gallery-grid">${galleryHTML}</div>
          </div>
          <div class="detail-section">
            <h3>Activity Checklist</h3>
            <ul class="activity-list">${activitiesHTML}</ul>
          </div>
          <div class="detail-section">
            <h3>Location Map</h3>
            <div class="map-placeholder"><span>🗺</span><span>${d.name}, ${d.location}</span></div>
          </div>
          <div class="detail-section">
            <h3>Reviews (${reviews.length})</h3>
            <div class="review-list">${reviewsHTML}</div>
            ${currentUser
              ? `<button class="btn-outline" style="margin-top:20px" onclick="openReviewModal(${id})">+ Write a Review</button>`
              : `<p style="margin-top:16px;font-size:.9rem;color:var(--text-light)"><a href="#" onclick="showPage('login')">Sign in</a> to write a review.</p>`}
          </div>
        </div>
        <div class="detail-sidebar">
          <div class="detail-actions-sidebar">
            <h4>Plan Your Visit</h4>
            <button class="detail-action-btn dab-primary" onclick="handleFavFromDetail(${id})" id="detailFavBtn">
              ${isFav ? '♥ Saved to Favorites' : '♡ Save to Favorites'}
            </button>
            <button class="detail-action-btn dab-secondary" onclick="openTripModal(${id})">✈ Plan a Trip</button>
          </div>
        </div>
      </div>
    </div>`;
  showPage('detail');
}

function goBack() { showPage('destinations'); }

function toggleActivity(el) {
  el.classList.toggle('done');
  el.textContent = el.classList.contains('done') ? '✓' : '';
}

/* ══════════════════ FAVORITES ══════════════════ */
function toggleFavorite(e, destId) {
  e.stopPropagation();
  if (!currentUser) { showToast('Sign in to save favorites.', 'error'); showPage('login'); return; }

  const favs = DB.favorites;
  const idx  = favs.findIndex(f => f.userId === currentUser.id && f.destinationId === destId);
  if (idx === -1) {
    const updated = [...favs, { userId: currentUser.id, destinationId: destId, dateSaved: new Date().toISOString().split('T')[0] }];
    DB.favorites  = updated;                                // ← persisted
    showToast('Added to favorites ♥', 'success');
  } else {
    const updated = favs.filter((_, i) => i !== idx);
    DB.favorites  = updated;                                // ← persisted
    showToast('Removed from favorites', 'success');
  }

  const active = document.querySelector('.page.active');
  if (active?.id === 'page-destinations') filterDestinations();
  if (active?.id === 'page-home')         renderFeatured();
  if (active?.id === 'page-profile')      renderFavoritesTab();
}

function handleFavFromDetail(destId) {
  if (!currentUser) { showToast('Sign in to save favorites.', 'error'); showPage('login'); return; }
  const favs = DB.favorites;
  const idx  = favs.findIndex(f => f.userId === currentUser.id && f.destinationId === destId);
  if (idx === -1) {
    DB.favorites = [...favs, { userId: currentUser.id, destinationId: destId, dateSaved: new Date().toISOString().split('T')[0] }];
    document.getElementById('detailFavBtn').textContent = '♥ Saved to Favorites';
    showToast('Added to favorites ♥', 'success');
  } else {
    DB.favorites = favs.filter((_,i) => i !== idx);
    document.getElementById('detailFavBtn').textContent = '♡ Save to Favorites';
    showToast('Removed from favorites', 'success');
  }
}

/* ══════════════════ REVIEW MODAL ══════════════════ */
let pickedStar = 0;

function openReviewModal(destId) {
  document.getElementById('reviewDestId').value = destId;
  pickedStar = 0;
  document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
  document.getElementById('reviewRating').value  = 0;
  document.getElementById('reviewComment').value = '';
  document.getElementById('reviewModal').classList.add('open');
}
function closeReviewModal(e)  { if (e.target === document.getElementById('reviewModal'))  closeReviewModalDirect(); }
function closeReviewModalDirect() { document.getElementById('reviewModal').classList.remove('open'); }

function pickStar(val) {
  pickedStar = val;
  document.getElementById('reviewRating').value = val;
  document.querySelectorAll('.star').forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= val));
}

function submitReview(e) {
  e.preventDefault();
  if (!currentUser) { showToast('Please sign in first.', 'error'); return; }
  const rating  = parseInt(document.getElementById('reviewRating').value);
  const comment = document.getElementById('reviewComment').value.trim();
  const destId  = parseInt(document.getElementById('reviewDestId').value);
  if (rating === 0) { showToast('Please select a star rating.', 'error'); return; }
  if (!comment)     { showToast('Please write a review comment.', 'error'); return; }
  if (DB.reviews.find(r => r.userId === currentUser.id && r.destinationId === destId)) {
    showToast('You have already reviewed this destination.', 'error'); return;
  }

  const id = DB.nextReviewId;
  DB.nextReviewId = id + 1;
  DB.pushReview({
    id, userId: currentUser.id, destinationId: destId, rating, comment,
    reviewDate: new Date().toISOString().split('T')[0],
    userName: `${currentUser.firstName} ${currentUser.lastName}`
  });                                                       // ← persisted

  closeReviewModalDirect();
  showToast('Review submitted! Thank you ★', 'success');
  showDetail(destId);
}

/* ══════════════════ TRIP MODAL ══════════════════ */
function openTripModal(destId) {
  if (!currentUser) { showToast('Sign in to plan a trip.', 'error'); showPage('login'); return; }
  document.getElementById('tm-destId').value = destId;
  ['tm-name','tm-start','tm-end','tm-notes'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('tripModal').classList.add('open');
}
function closeTripModal(e)  { if (e.target === document.getElementById('tripModal'))  closeTripModalDirect(); }
function closeTripModalDirect() { document.getElementById('tripModal').classList.remove('open'); }

function savePlannedTrip(e) {
  e.preventDefault();
  const destId = parseInt(document.getElementById('tm-destId').value);
  const name   = document.getElementById('tm-name').value.trim();
  const start  = document.getElementById('tm-start').value;
  const end    = document.getElementById('tm-end').value;
  const notes  = document.getElementById('tm-notes').value.trim();
  if (new Date(end) < new Date(start)) { showToast('End date must be after start date.', 'error'); return; }

  const id = DB.nextTripId;
  DB.nextTripId = id + 1;
  const trips = DB.plannedTrips;
  DB.plannedTrips = [...trips, { id, userId: currentUser.id, destinationId: destId, tripName: name, startDate: start, endDate: end, notes }]; // ← persisted

  closeTripModalDirect();
  showToast('Trip planned! ✈', 'success');
}

/* ══════════════════ PROFILE ══════════════════ */
function renderProfile() {
  if (!currentUser) return;
  // Always read fresh from DB so profile edits are reflected
  const fresh = DB.users.find(u => u.id === currentUser.id);
  if (fresh) currentUser = fresh;

  document.getElementById('profileName').textContent  = `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById('profileEmail').textContent = currentUser.email;

  const av = document.getElementById('profileAvatar');
  if (currentUser.profilePhoto) {
    av.innerHTML = `<img src="${currentUser.profilePhoto}" alt="Avatar"/>`;
  } else {
    av.textContent = currentUser.firstName[0].toUpperCase();
  }
  document.getElementById('pfFirst').value = currentUser.firstName;
  document.getElementById('pfLast').value  = currentUser.lastName;
  document.getElementById('pfEmail').value = currentUser.email;

  renderFavoritesTab();
  renderTripsTab();
  renderMyReviewsTab();
}

function switchProfileTab(tab, btn) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
}

function saveProfile(e) {
  e.preventDefault();
  const firstName = document.getElementById('pfFirst').value.trim();
  const lastName  = document.getElementById('pfLast').value.trim();
  const email     = document.getElementById('pfEmail').value.trim().toLowerCase();
  if (!firstName || !lastName || !email) { showToast('All fields are required.', 'error'); return; }
  if (!isValidEmail(email)) { showToast('Enter a valid email address.', 'error'); return; }

  // Check email isn't taken by another user
  const conflict = DB.users.find(u => u.email.toLowerCase() === email && u.id !== currentUser.id);
  if (conflict) { showToast('That email is already in use.', 'error'); return; }

  DB.updateUser(currentUser.id, { firstName, lastName, email }); // ← persisted
  currentUser = DB.users.find(u => u.id === currentUser.id);     // refresh reference
  sessionSave(currentUser);                                        // keep session fresh

  document.getElementById('profileName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById('userGreeting').textContent = `Hi, ${currentUser.firstName}`;

  const ok = document.getElementById('profileSaveOk');
  ok.textContent = 'Profile updated successfully!';
  ok.classList.add('show');
  setTimeout(() => ok.classList.remove('show'), 3000);
  showToast('Profile saved!', 'success');
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('Image too large. Max 2MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const photo = ev.target.result;
    DB.updateUser(currentUser.id, { profilePhoto: photo }); // ← persisted
    currentUser.profilePhoto = photo;
    const av = document.getElementById('profileAvatar');
    av.innerHTML = `<img src="${photo}" alt="Avatar"/>`;
    showToast('Profile photo updated!', 'success');
  };
  reader.readAsDataURL(file);
}

function renderFavoritesTab() {
  const grid    = document.getElementById('favoritesGrid');
  const userFavs= DB.favorites.filter(f => f.userId === currentUser.id);
  if (!userFavs.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">♡</div><h3>No favorites yet</h3><p>Browse destinations and save your favorites.</p></div>`;
    return;
  }
  grid.innerHTML = userFavs.map(f => {
    const d = DB.destinations.find(x => x.id === f.destinationId);
    return d ? destCardHTML(d) : '';
  }).join('');
}

function renderTripsTab() {
  const container = document.getElementById('tripsContainer');
  const trips     = DB.plannedTrips.filter(t => t.userId === currentUser.id);
  if (!trips.length) {
    container.innerHTML = `<div class="empty-state"><div class="es-icon">✈</div><h3>No trips planned</h3><p>Visit a destination page to plan your trip.</p></div>`;
    return;
  }
  container.innerHTML = trips.map(t => {
    const d = DB.destinations.find(x => x.id === t.destinationId);
    return `
      <div class="trip-card">
        <div class="trip-card-info">
          <h4>${t.tripName}</h4>
          <p>📍 ${d ? d.name : 'Destination'} — ${t.startDate} to ${t.endDate}</p>
          ${t.notes ? `<p style="margin-top:4px;font-size:.82rem;color:var(--text-light)">${t.notes}</p>` : ''}
        </div>
        <button class="trip-card-del" onclick="deleteTrip(${t.id})" title="Delete trip">🗑</button>
      </div>`;
  }).join('');
}

function deleteTrip(id) {
  DB.plannedTrips = DB.plannedTrips.filter(t => t.id !== id); // ← persisted
  renderTripsTab();
  showToast('Trip removed.', 'success');
}

function renderMyReviewsTab() {
  const container = document.getElementById('myReviewsContainer');
  const reviews   = DB.reviews.filter(r => r.userId === currentUser.id);
  if (!reviews.length) {
    container.innerHTML = `<div class="empty-state"><div class="es-icon">★</div><h3>No reviews yet</h3><p>Visit destination pages to write reviews.</p></div>`;
    return;
  }
  container.innerHTML = `<div class="review-list">${reviews.map(r => {
    const d = DB.destinations.find(x => x.id === r.destinationId);
    return `
      <div class="review-card">
        <div class="review-header">
          <span class="review-user">${d ? d.name : 'Destination'}</span>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="stars" style="font-size:.9rem">${starsHTML(r.rating)}</span>
            <span class="review-date">${r.reviewDate}</span>
          </div>
        </div>
        <p class="review-comment">${r.comment}</p>
      </div>`;
  }).join('')}</div>`;
}

/* ══════════════════ ADMIN ══════════════════ */
function renderAdmin() {
  document.getElementById('asc-dest').textContent    = DB.destinations.length;
  document.getElementById('asc-users').textContent   = DB.users.filter(u => u.role === 'user').length;
  document.getElementById('asc-reviews').textContent = DB.reviews.length;
  document.getElementById('asc-favs').textContent    = DB.favorites.length;

  const logs = [
    { msg:`${DB.destinations.length} destinations on platform`, time:'now' },
    { msg:`${DB.users.length} registered accounts`, time:'now' },
    { msg:`${DB.reviews.length} user reviews submitted`, time:'now' },
    { msg:`${DB.favorites.length} favorites saved`, time:'now' },
    { msg:`${DB.plannedTrips.length} trips planned`, time:'now' },
  ];
  document.getElementById('recentActivity').innerHTML = logs.map(l =>
    `<div class="activity-log"><span>${l.msg}</span><time>${l.time}</time></div>`
  ).join('');

  renderAdminDestinations();
  renderAdminUsers();
  renderAdminReviews();
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.anav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('atab-' + tab).classList.add('active');
  btn.classList.add('active');
}

function renderAdminDestinations() {
  const tbody = document.getElementById('adminDestBody');
  if (!tbody) return;
  tbody.innerHTML = DB.destinations.map(d => {
    const reviews = DB.reviews.filter(r => r.destinationId === d.id);
    const avg = reviews.length
      ? (reviews.reduce((s,r) => s+r.rating,0)/reviews.length).toFixed(1)
      : d.rating.toFixed(1);
    return `
      <tr>
        <td><strong>${d.name}</strong></td>
        <td>${d.location}</td>
        <td>${d.category}</td>
        <td><span class="stars" style="font-size:.85rem">${starsHTML(parseFloat(avg))}</span> ${avg}</td>
        <td>
          <button class="tbl-btn tbl-edit" onclick="openDestModal(${d.id})">Edit</button>
          <button class="tbl-btn tbl-del"  onclick="deleteDestination(${d.id})">Delete</button>
        </td>
      </tr>`;
  }).join('');
}

function renderAdminUsers() {
  const tbody = document.getElementById('adminUsersBody');
  if (!tbody) return;
  tbody.innerHTML = DB.users.map(u => `
    <tr>
      <td>${u.firstName} ${u.lastName}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-${u.role}">${u.role}</span></td>
      <td>${u.dateCreated}</td>
      <td>
        <button class="tbl-btn tbl-del" onclick="deleteUser(${u.id})"
          ${u.id === currentUser?.id ? 'disabled title="Cannot delete yourself"' : ''}>Remove</button>
      </td>
    </tr>`).join('');
}

function renderAdminReviews() {
  const container = document.getElementById('adminReviewsContainer');
  if (!container) return;
  if (!DB.reviews.length) {
    container.innerHTML = `<div class="empty-state"><div class="es-icon">★</div><h3>No reviews yet</h3></div>`;
    return;
  }
  container.innerHTML = DB.reviews.map(r => {
    const d = DB.destinations.find(x => x.id === r.destinationId);
    return `
      <div class="admin-review-card">
        <div>
          <div style="font-weight:600;color:var(--brown-deep);margin-bottom:4px">${r.userName} → ${d ? d.name : '?'}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span class="stars" style="font-size:.85rem">${starsHTML(r.rating)}</span>
            <span style="font-size:.8rem;color:var(--text-light)">${r.reviewDate}</span>
          </div>
          <p style="font-size:.88rem;color:var(--text-mid)">${r.comment}</p>
        </div>
        <button class="tbl-btn tbl-del" onclick="deleteReview(${r.id})">Remove</button>
      </div>`;
  }).join('');
}

/* ── Admin destination CRUD ── */
function openDestModal(id) {
  editingDestId = id || null;
  document.getElementById('dm-editId').value = id || '';
  const title = document.getElementById('destModalTitle');
  const btn   = document.getElementById('destModalBtn');

  if (id) {
    const d = DB.destinations.find(x => x.id === id);
    if (!d) return;
    title.textContent = 'Edit Destination';
    btn.textContent   = 'Save Changes';
    document.getElementById('dm-name').value       = d.name;
    document.getElementById('dm-location').value   = d.location;
    document.getElementById('dm-category').value   = d.category;
    document.getElementById('dm-desc').value       = d.description;
    document.getElementById('dm-image').value      = d.imageUrl || '';
    document.getElementById('dm-activities').value = (d.activities || []).join(', ');
  } else {
    title.textContent = 'Add Destination';
    btn.textContent   = 'Add Destination';
    ['dm-name','dm-location','dm-category','dm-desc','dm-image','dm-activities'].forEach(i => document.getElementById(i).value = '');
  }
  document.getElementById('destModal').classList.add('open');
}
function closeDestModal(e) { if (e.target === document.getElementById('destModal')) closeDestModalDirect(); }
function closeDestModalDirect() { document.getElementById('destModal').classList.remove('open'); }

function saveDestination(e) {
  e.preventDefault();
  const name       = document.getElementById('dm-name').value.trim();
  const location   = document.getElementById('dm-location').value.trim();
  const category   = document.getElementById('dm-category').value;
  const desc       = document.getElementById('dm-desc').value.trim();
  const imageUrl   = document.getElementById('dm-image').value.trim();
  const activities = document.getElementById('dm-activities').value.split(',').map(a => a.trim()).filter(Boolean);
  const editId     = document.getElementById('dm-editId').value;

  if (editId) {
    DB.updateDestination(parseInt(editId), { name, location, category, description: desc, imageUrl, activities }); // ← persisted
    showToast('Destination updated!', 'success');
  } else {
    DB.pushDestination({ id: Date.now(), name, location, category, description: desc, imageUrl, mapLink:'#', activities, rating: 4.5, dateAdded: new Date().toISOString().split('T')[0] }); // ← persisted
    showToast('Destination added!', 'success');
  }
  closeDestModalDirect();
  renderAdminDestinations();
  document.getElementById('asc-dest').textContent = DB.destinations.length;
}

function deleteDestination(id) {
  if (!confirm('Delete this destination?')) return;
  DB.destinations = DB.destinations.filter(d => d.id !== id);   // ← persisted
  DB.reviews      = DB.reviews.filter(r => r.destinationId !== id);
  DB.favorites    = DB.favorites.filter(f => f.destinationId !== id);
  renderAdminDestinations();
  document.getElementById('asc-dest').textContent = DB.destinations.length;
  showToast('Destination deleted.', 'success');
}

function deleteUser(id) {
  if (id === currentUser?.id) return;
  if (!confirm('Remove this user?')) return;
  DB.users = DB.users.filter(u => u.id !== id);                  // ← persisted
  renderAdminUsers();
  document.getElementById('asc-users').textContent = DB.users.filter(u => u.role === 'user').length;
  showToast('User removed.', 'success');
}

function deleteReview(id) {
  if (!confirm('Remove this review?')) return;
  DB.reviews = DB.reviews.filter(r => r.id !== id);              // ← persisted
  renderAdminReviews();
  document.getElementById('asc-reviews').textContent = DB.reviews.length;
  showToast('Review removed.', 'success');
}

/* ══════════════════ UTILITIES ══════════════════ */
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function showFieldError(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
function showFormError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 5000); }
}
function clearAuthErrors(prefix) {
  ['EmailErr','PassErr','FirstErr','LastErr','ConfirmErr'].forEach(s => {
    const el = document.getElementById(prefix + s); if (el) el.textContent = '';
  });
  const fe = document.getElementById(prefix + 'FormErr');
  if (fe) fe.classList.remove('show');
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁'; }
}

let toastTimeout;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast show ${type}`;
  clearTimeout(toastTimeout);
  toastTimeout  = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ══════════════════ PASSWORD STRENGTH ══════════════════ */
function initPasswordStrength() {
  const passInput = document.getElementById('regPass');
  if (!passInput) return;
  passInput.addEventListener('input', function () {
    const bar = document.getElementById('passStrength');
    const v   = this.value;
    bar.className = 'password-strength';
    if (!v.length) return;
    if (v.length < 6) bar.classList.add('weak');
    else if (v.length < 10 || !/[A-Z]/.test(v) || !/[0-9]/.test(v)) bar.classList.add('medium');
    else bar.classList.add('strong');
  });
}

/* ══════════════════ INIT ══════════════════ */
function init() {
  bootstrapStorage();   // seed LS on first visit
  sessionRestore();     // re-hydrate currentUser from LS
  updateNavAuth();
  renderFeatured();
  initPasswordStrength();
}

document.addEventListener('DOMContentLoaded', init);

// Close modals on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['destModal','reviewModal','tripModal'].forEach(id => {
      document.getElementById(id)?.classList.remove('open');
    });
  }
});
window.showPage = showPage;
window.toggleMenu = toggleMenu;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
