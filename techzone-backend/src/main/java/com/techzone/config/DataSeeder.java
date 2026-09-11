package com.techzone.config;

import com.techzone.entity.*;
import com.techzone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE categories ALTER COLUMN icon NVARCHAR(MAX)");
        } catch (Exception ex) {}

        try {
            jdbcTemplate.execute("ALTER TABLE brands ALTER COLUMN logo_url NVARCHAR(MAX)");
        } catch (Exception ex) {}

        try {
            jdbcTemplate.execute("ALTER TABLE brands ADD slug NVARCHAR(255) NULL");
        } catch (Exception ex) {}

        try {
            jdbcTemplate.execute("ALTER TABLE brands ADD website_url NVARCHAR(255) NULL");
        } catch (Exception ex) {}

        try {
            jdbcTemplate.execute("ALTER TABLE brands ADD is_active BIT NULL");
        } catch (Exception ex) {}

        try {
            jdbcTemplate.execute("ALTER TABLE brands ADD is_featured BIT NULL");
        } catch (Exception ex) {}

        try {
            jdbcTemplate.execute("ALTER TABLE brands ADD priority INT NULL");
        } catch (Exception ex) {}

        // Populate defaults for existing brands if null
        try {
            jdbcTemplate.execute("UPDATE brands SET is_active = 1 WHERE is_active IS NULL");
            jdbcTemplate.execute("UPDATE brands SET is_featured = 1 WHERE is_featured IS NULL");
            jdbcTemplate.execute("UPDATE brands SET priority = id WHERE priority IS NULL");
            jdbcTemplate.execute("UPDATE brands SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '/', '-')) WHERE slug IS NULL");
        } catch (Exception ex) {}

        seedUsers();
        if (categoryRepository.count() == 0) {
            seedCategoriesAndBrandsAndProducts();
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("superadmin@techzone.vn")) {
            User superAdmin = User.builder()
                    .fullName("Super Admin TechZone")
                    .email("superadmin@techzone.vn")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0999999999")
                    .address("TP. Hồ Chí Minh")
                    .role(User.Role.ROLE_SUPER_ADMIN)
                    .build();
            userRepository.save(superAdmin);
        }

        if (!userRepository.existsByEmail("admin@techzone.vn")) {
            User admin = User.builder()
                    .fullName("Quản trị viên TechZone")
                    .email("admin@techzone.vn")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0988888888")
                    .address("TP. Hồ Chí Minh")
                    .role(User.Role.ROLE_ADMIN)
                    .build();
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("user@techzone.vn")) {
            User user = User.builder()
                    .fullName("Nguyễn Văn Gamer")
                    .email("user@techzone.vn")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0977777777")
                    .address("Hà Nội")
                    .role(User.Role.ROLE_USER)
                    .build();
            userRepository.save(user);
        }
    }

    private void seedCategoriesAndBrandsAndProducts() {
        // Categories
        Category catLaptop = categoryRepository.save(Category.builder().name("Laptop Gaming").slug("laptop-gaming").icon("pi pi-desktop").priority(1).build());
        Category catPc = categoryRepository.save(Category.builder().name("PC TechZone Build").slug("pc-build").icon("pi pi-server").priority(2).build());
        Category catComponent = categoryRepository.save(Category.builder().name("Linh kiện PC").slug("linh-kien-pc").icon("pi pi-cog").priority(3).build());
        Category catMonitor = categoryRepository.save(Category.builder().name("Màn hình Gaming").slug("man-hinh-gaming").icon("pi pi-desktop").priority(4).build());
        Category catGear = categoryRepository.save(Category.builder().name("Bàn phím & Chuột").slug("gear-ban-phim-chuot").icon("pi pi-tablet").priority(5).build());

        // Brands
        Brand brandAsus = brandRepository.save(Brand.builder().name("ASUS ROG").logoUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe").description("Republic of Gamers").build());
        Brand brandMsi = brandRepository.save(Brand.builder().name("MSI").logoUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f").description("True Gaming").build());
        Brand brandGigabyte = brandRepository.save(Brand.builder().name("GIGABYTE AORUS").logoUrl("https://images.unsplash.com/photo-1587202372775-e229f172b9d7").description("Team Up Fight On").build());
        Brand brandLogitech = brandRepository.save(Brand.builder().name("Logitech G").logoUrl("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7").description("Advanced Gaming Gear").build());
        Brand brandRazer = brandRepository.save(Brand.builder().name("Razer").logoUrl("https://images.unsplash.com/photo-1563089145-599997674d42").description("For Gamers By Gamers").build());

        // Products
        Product p1 = Product.builder()
                .name("Laptop Gaming ASUS ROG Strix G16 G614JVR (Core i9 14900HX / RTX 4060 8GB / 16GB / 1TB SSD / 16 inch 240Hz)")
                .slug("laptop-gaming-asus-rog-strix-g16-g614jvr")
                .sku("ROG-G614JVR-001")
                .category(catLaptop)
                .brand(brandAsus)
                .originalPrice(new BigDecimal("44990000"))
                .promotionPrice(new BigDecimal("39990000"))
                .thumbnail("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop")
                .description("Laptop Gaming ASUS ROG Strix G16 sức mạnh vượt trội trang bị CPU Intel Core i9 Gen 14th cùng card đồ họa NVIDIA RTX 4060 8GB GDDR6 cực mạnh mẽ.")
                .specsJson("{\"CPU\": \"Intel Core i9 14900HX\", \"RAM\": \"16GB DDR5 5600MHz\", \"VGA\": \"NVIDIA GeForce RTX 4060 8GB\", \"Màn hình\": \"16 inch ROG Nebula QHD+ 240Hz\", \"SSD\": \"1TB PCIe 4.0 NVMe\"}")
                .stockQuantity(15)
                .isFeatured(true)
                .isFlashSale(true)
                .flashSaleEndTime(java.time.LocalDateTime.now().plusDays(2))
                .build();

        Product p2 = Product.builder()
                .name("Laptop Gaming MSI Raider GE78 HX 14VGG (Core i9 14900HX / RTX 4070 8GB / 32GB / 2TB SSD / 240Hz)")
                .slug("laptop-gaming-msi-raider-ge78-hx-14vgg")
                .sku("MSI-GE78-002")
                .category(catLaptop)
                .brand(brandMsi)
                .originalPrice(new BigDecimal("69990000"))
                .promotionPrice(new BigDecimal("62990000"))
                .thumbnail("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop")
                .description("MSI Raider GE78 HX được thiết kế dành riêng cho giới game thủ chuyên nghiệp và các streamer đỉnh cao.")
                .specsJson("{\"CPU\": \"Intel Core i9 14900HX\", \"RAM\": \"32GB DDR5\", \"VGA\": \"NVIDIA GeForce RTX 4070 8GB\", \"Màn hình\": \"17.3 inch QHD+ 240Hz OLED\", \"SSD\": \"2TB PCIe Gen4\"}")
                .stockQuantity(8)
                .isFeatured(true)
                .isFlashSale(true)
                .flashSaleEndTime(java.time.LocalDateTime.now().plusDays(2))
                .build();

        Product p3 = Product.builder()
                .name("PC TechZone Gaming Ultimate i7 14700F / RTX 4070 Ti Super 16GB / 32GB RAM / 1TB SSD NVMe")
                .slug("pc-techzone-gaming-ultimate-rtx4070ti")
                .sku("PC-TZ-ULT-03")
                .category(catPc)
                .brand(brandAsus)
                .originalPrice(new BigDecimal("52990000"))
                .promotionPrice(new BigDecimal("46990000"))
                .thumbnail("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop")
                .description("Cấu hình PC Gaming dựng sẵn tối ưu hiệu năng chiến mượt mà mọi tựa game AAA ở độ phân giải 4K 144FPS.")
                .specsJson("{\"CPU\": \"Intel Core i7 14700F\", \"VGA\": \"ASUS TUF Gaming RTX 4070 Ti SUPER 16GB\", \"Mainboard\": \"ASUS ROG STRIX B760-F\", \"RAM\": \"Corsair Vengeance RGB 32GB DDR5\", \"Power\": \"850W 80 Plus Gold\"}")
                .stockQuantity(10)
                .isFeatured(true)
                .isFlashSale(false)
                .build();

        Product p4 = Product.builder()
                .name("Card đồ họa GIGABYTE GeForce RTX 4090 GAMING OC 24G")
                .slug("card-do-hoa-gigabyte-rtx-4090-gaming-oc-24g")
                .sku("VGA-GIGA-4090-04")
                .category(catComponent)
                .brand(brandGigabyte)
                .originalPrice(new BigDecimal("54990000"))
                .promotionPrice(new BigDecimal("49990000"))
                .thumbnail("https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop")
                .description("Card đồ họa khủng nhất thế giới tản nhiệt WINDFORCE 3X cùng hệ thống RGB Fusion sắc màu.")
                .specsJson("{\"GPU\": \"GeForce RTX 4090\", \"Bộ nhớ\": \"24GB GDDR6X\", \"Bus bộ nhớ\": \"384-bit\", \"Cổng kết nối\": \"3x DisplayPort 1.4a, 1x HDMI 2.1a\"}")
                .stockQuantity(5)
                .isFeatured(true)
                .isFlashSale(true)
                .flashSaleEndTime(java.time.LocalDateTime.now().plusDays(2))
                .build();

        Product p5 = Product.builder()
                .name("Màn hình Gaming ASUS ROG Swift OLED PG27AQDM (27 inch / 2K QHD / OLED 240Hz / 0.03ms)")
                .slug("man-hinh-gaming-asus-rog-swift-oled-pg27aqdm")
                .sku("MON-ROG-PG27-05")
                .category(catMonitor)
                .brand(brandAsus)
                .originalPrice(new BigDecimal("28990000"))
                .promotionPrice(new BigDecimal("24990000"))
                .thumbnail("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop")
                .description("Màn hình OLED 240Hz siêu phản hồi 0.03ms cực nhanh mang lại màu sắc chân thực sắc nét ấn tượng.")
                .specsJson("{\"Kích thước\": \"26.5 inch OLED\", \"Độ phân giải\": \"2560 x 1440 QHD\", \"Tần số quét\": \"240Hz\", \"Thời gian phản hồi\": \"0.03ms GTG\"}")
                .stockQuantity(12)
                .isFeatured(true)
                .isFlashSale(true)
                .build();

        Product p6 = Product.builder()
                .name("Bàn phím cơ Không dây Logitech G Pro X 60 LIGHTSPEED Tactile RGB")
                .slug("ban-phim-co-logitech-g-pro-x-60-lightspeed")
                .sku("KB-LOGI-GPRO60-06")
                .category(catGear)
                .brand(brandLogitech)
                .originalPrice(new BigDecimal("4890000"))
                .promotionPrice(new BigDecimal("4290000"))
                .thumbnail("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop")
                .description("Bàn phím cơ form factor 60% nhỏ gọn siêu mượt mà không dây LIGHTSPEED dành cho game thủ Esports chuyên nghiệp.")
                .specsJson("{\"Kết nối\": \"LIGHTSPEED Wireless, Bluetooth, USB-C\", \"Switch\": \"GX Optical Tactile\", \"Keycap\": \"Dual-shot PBT\", \"LED\": \"LIGHTSYNC RGB\"}")
                .stockQuantity(25)
                .isFeatured(false)
                .isFlashSale(false)
                .build();

        Product p7 = Product.builder()
                .name("Chuột Gaming Không dây Razer Viper V3 Pro Ultra-lightweight (54g / Focus Pro 35K Gen-2)")
                .slug("chuot-gaming-razer-viper-v3-pro")
                .sku("MOUSE-RAZER-V3P-07")
                .category(catGear)
                .brand(brandRazer)
                .originalPrice(new BigDecimal("4190000"))
                .promotionPrice(new BigDecimal("3790000"))
                .thumbnail("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop")
                .description("Chuột siêu nhẹ 54g trang bị mắt đọc cảm biến Focus Pro 35K cùng Polling rate 8000Hz đỉnh cao.")
                .specsJson("{\"Trọng lượng\": \"54 grams\", \"Mắt đọc\": \"Focus Pro 35K Optical Sensor\", \"Polling Rate\": \"Up to 8000Hz\", \"Pin\": \"Lên tới 95 giờ\"}")
                .stockQuantity(20)
                .isFeatured(true)
                .isFlashSale(true)
                .build();

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7));
    }
}
