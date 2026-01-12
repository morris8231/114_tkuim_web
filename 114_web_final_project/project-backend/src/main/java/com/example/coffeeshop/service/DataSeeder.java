package com.example.coffeeshop.service;

import com.example.coffeeshop.model.Cafe;
import com.example.coffeeshop.repository.CafeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Automatically seeds the database with public data from OpenStreetMap
 * if the database is empty on startup.
 */
@Service
public class DataSeeder implements CommandLineRunner {

    private final CafeRepository cafeRepository;
    private final ObjectMapper objectMapper;

    // Bounding Box for Taipei: S,W,N,E
    private static final String TAIPEI_BBOX = "25.00,121.45,25.10,121.60";

    public DataSeeder(CafeRepository cafeRepository, ObjectMapper objectMapper) {
        this.cafeRepository = cafeRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        if (cafeRepository.count() > 0) {
            System.out.println("✅ Database already has data. Skipping import.");
            return;
        }

        System.out.println("🌍 Database empty. Fetching cafes from OpenStreetMap (Overpass API)...");
        try {
            importFromOSM();
        } catch (Exception e) {
            System.err.println("❌ Failed to import data: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void importFromOSM() throws Exception {
        String query = "[out:json][timeout:25];" +
                "(" +
                "  node[\"amenity\"=\"cafe\"](" + TAIPEI_BBOX + ");" +
                "  way[\"amenity\"=\"cafe\"](" + TAIPEI_BBOX + ");" +
                ");" +
                "out body;" +
                ">;" +
                "out skel qt;";

        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String urlString = "https://overpass-api.de/api/interpreter?data=" + encodedQuery;

        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "FindYourCoffeeApp/1.0");

        if (conn.getResponseCode() != 200) {
            throw new RuntimeException("Overpass API returned " + conn.getResponseCode());
        }

        InputStream inputStream = conn.getInputStream();
        JsonNode root = objectMapper.readTree(inputStream);
        JsonNode elements = root.path("elements");

        int count = 0;
        for (JsonNode node : elements) {
            if (node.has("tags") && node.get("tags").has("name")) {
                JsonNode tags = node.get("tags");
                String name = tags.get("name").asText();

                // Skip basic duplicates or bad data
                if (name.isEmpty())
                    continue;

                // Extract lat/lon. For ways, center logic is complex, so we skip exact center
                // calculation for now or just take what we have.
                // Overpass "out skel qt" for ways gives nodes but not center. "out center" is
                // better for ways.
                // Let's just use "node" type for simplicity, or if type is "node".
                // If it's a way, without center in output, we don't have lat/lon on the element
                // itself usually in this querying mode.
                // We'll filter for type="node" OR elements that have lat/lon.
                if (!node.has("lat") || !node.has("lon"))
                    continue;

                double lat = node.get("lat").asDouble();
                double lon = node.get("lon").asDouble();

                Cafe cafe = new Cafe();
                cafe.setName(name);
                cafe.setLatitude(lat);
                cafe.setLongitude(lon);

                String desc = "Experience the local vibe.";
                if (tags.has("description"))
                    desc = tags.get("description").asText();
                else if (tags.has("name:en"))
                    desc = tags.get("name:en").asText();
                cafe.setDescription(desc);

                String address = "Taipei";
                if (tags.has("addr:street")) {
                    address = tags.get("addr:street").asText();
                    if (tags.has("addr:housenumber")) {
                        address += " " + tags.get("addr:housenumber").asText();
                    }
                }
                cafe.setAddress(address);

                cafe.setTags(generateTags(tags, name));

                // Set default images based on cafe type
                cafe.setImageUrls(generateImageUrls(cafe.getTags()));

                cafeRepository.save(cafe);
                count++;
            }
        }
        System.out.println("🎉 Successfully imported " + count + " cafes!");
    }

    private List<String> generateTags(JsonNode osmTags, String name) {
        Set<String> tags = new HashSet<>();

        // Keywords
        if (name.contains("Starbucks") || name.contains("Louisa") || name.contains("Cama")) {
            tags.add("work_friendly");
            tags.add("quiet");
        }

        if (osmTags.has("internet_access") &&
                (osmTags.get("internet_access").asText().equals("wlan")
                        || osmTags.get("internet_access").asText().equals("yes"))) {
            tags.add("work_friendly");
        }

        if (osmTags.has("cuisine") && osmTags.get("cuisine").asText().contains("cake")) {
            tags.add("dessert");
        }

        if (name.contains("Cat") || name.contains("Dog") || name.contains("Pet")) {
            tags.add("pet_friendly");
        }

        if (osmTags.has("website") || osmTags.has("contact:instagram")) {
            tags.add("aesthetic");
        }

        if (name.contains("Roast") || name.contains("Specialty") || name.contains("Lab")) {
            tags.add("specialty_coffee");
        }

        if (osmTags.has("opening_hours") && osmTags.get("opening_hours").asText().contains("24/7")) {
            tags.add("late_night");
        }

        if (tags.isEmpty()) {
            tags.add("social");
        }

        return new ArrayList<>(tags);
    }

    private List<String> generateImageUrls(List<String> cafeTags) {
        List<String> images = new ArrayList<>();

        // Use Unsplash Source API for high-quality cafe images
        // Different image styles based on cafe tags
        String baseUrl = "https://images.unsplash.com/";

        if (cafeTags.contains("specialty_coffee")) {
            images.add(baseUrl + "photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop");
            images.add(baseUrl + "photo-1514432324607-a09d9b4aefdd?w=800&h=600&fit=crop");
        } else if (cafeTags.contains("aesthetic")) {
            images.add(baseUrl + "photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop");
            images.add(baseUrl + "photo-1559925393-8be0ec4767c8?w=800&h=600&fit=crop");
        } else if (cafeTags.contains("work_friendly")) {
            images.add(baseUrl + "photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop");
            images.add(baseUrl + "photo-1600093463592-8e36ae95ef56?w=800&h=600&fit=crop");
        } else if (cafeTags.contains("dessert")) {
            images.add(baseUrl + "photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop");
            images.add(baseUrl + "photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop");
        } else {
            // Default cafe images
            images.add(baseUrl + "photo-1453614512568-c4024d13c247?w=800&h=600&fit=crop");
            images.add(baseUrl + "photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop");
        }

        return images;
    }
}
