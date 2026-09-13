package com.techzone.service;

import com.techzone.dto.ProductRequest;
import com.techzone.entity.Brand;
import com.techzone.entity.Category;
import com.techzone.entity.Product;
import com.techzone.entity.ProductImage;
import com.techzone.repository.BrandRepository;
import com.techzone.repository.CategoryRepository;
import com.techzone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PushbackInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final CloudinaryService cloudinaryService;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final String FALLBACK_PLACEHOLDER_URL = "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500";

    public List<Product> getFlashSaleProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> active = productRepository.findActiveFlashSaleProducts(java.time.LocalDateTime.now(), pageable);
        if (active.isEmpty()) {
            return productRepository.findByIsFlashSaleTrue();
        }
        return active;
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue();
    }

    public Product getProductBySlug(String slug) {
        Product p = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + slug));
        if (Boolean.FALSE.equals(p.getIsActive())) {
            throw new RuntimeException("Sản phẩm này hiện đã ngưng kinh doanh hoặc đang tạm ẩn!");
        }
        return p;
    }

    public Page<Product> filterProducts(List<Long> categoryIds, List<Long> brandIds, BigDecimal minPrice, BigDecimal maxPrice,
                                         String search, String sortBy, int page, int size) {
        Sort sort = Sort.by("id").descending();
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("promotionPrice").ascending();
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("promotionPrice").descending();
        } else if ("newest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("createdAt").descending();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.unsorted());
        return productRepository.findAll((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.or(cb.isNull(root.get("isActive")), cb.isTrue(root.get("isActive"))));
            if (categoryIds != null && !categoryIds.isEmpty()) predicates.add(root.get("category").get("id").in(categoryIds));
            if (brandIds != null && !brandIds.isEmpty()) predicates.add(root.get("brand").get("id").in(brandIds));
            var price = cb.<BigDecimal>coalesce(root.get("promotionPrice"), root.get("originalPrice"));
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                if ("best_seller".equalsIgnoreCase(sortBy)) {
                    var sold = query.subquery(Long.class);
                    var item = sold.from(com.techzone.entity.OrderItem.class);
                    sold.select(cb.sumAsLong(item.get("quantity")));
                    sold.where(cb.equal(item.get("product").get("id"), root.get("id")),
                            cb.equal(item.get("order").get("orderStatus"), "DELIVERED"));
                    query.orderBy(cb.desc(cb.coalesce(sold, 0L)), cb.desc(root.get("id")));
                } else if ("discount".equalsIgnoreCase(sortBy) || "biggest_discount".equalsIgnoreCase(sortBy)) {
                    var percentage = cb.<Number>selectCase()
                            .when(cb.gt(root.get("originalPrice"), BigDecimal.ZERO),
                                    cb.quot(cb.diff(root.get("originalPrice"), price), root.get("originalPrice")))
                            .otherwise(0);
                    query.orderBy(cb.desc(percentage), cb.desc(root.get("id")));
                } else if ("price_asc".equalsIgnoreCase(sortBy)) {
                    query.orderBy(cb.asc(price), cb.desc(root.get("id")));
                } else if ("price_desc".equalsIgnoreCase(sortBy)) {
                    query.orderBy(cb.desc(price), cb.desc(root.get("id")));
                } else {
                    query.orderBy(cb.desc(root.get("createdAt")), cb.desc(root.get("id")));
                }
            }
            if (minPrice != null) predicates.add(cb.greaterThanOrEqualTo(price, minPrice));
            if (maxPrice != null) predicates.add(cb.lessThanOrEqualTo(price, maxPrice));
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("specsJson")), pattern)));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pageable);
    }

    public Page<Product> filterAdminProducts(Long categoryId, Long brandId, String status, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return productRepository.filterAdminProducts(categoryId, brandId, status, search, pageable);
    }

    public List<Product> quickSearch(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return productRepository.findTop8ByNameContainingIgnoreCase(query);
    }

    @Transactional
    public Product createProduct(ProductRequest req) {
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục id: " + req.getCategoryId()));
        Brand brand = brandRepository.findById(req.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu id: " + req.getBrandId()));

        String slug = toSlug(req.getName());
        String sku = req.getSku() != null && !req.getSku().trim().isEmpty() ? req.getSku() : "SKU-" + System.currentTimeMillis();

        Product product = Product.builder()
                .name(req.getName())
                .slug(slug)
                .sku(sku)
                .category(category)
                .brand(brand)
                .originalPrice(req.getOriginalPrice())
                .promotionPrice(req.getPromotionPrice())
                .thumbnail(req.getThumbnail())
                .description(req.getDescription())
                .specsJson(req.getSpecsJson())
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 10)
                .isFeatured(req.getIsFeatured() != null ? req.getIsFeatured() : false)
                .isFlashSale(req.getIsFlashSale() != null ? req.getIsFlashSale() : false)
                .flashSaleEndTime(req.getFlashSaleEndTime())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .images(new ArrayList<>())
                .build();

        if (req.getSubImages() != null) {
            List<ProductImage> pImages = req.getSubImages().stream()
                    .filter(url -> url != null && !url.trim().isEmpty())
                    .map(url -> ProductImage.builder().imageUrl(url.trim()).product(product).build())
                    .collect(Collectors.toList());
            product.getImages().addAll(pImages);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + id));

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục id: " + req.getCategoryId()));
        Brand brand = brandRepository.findById(req.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu id: " + req.getBrandId()));

        product.setName(req.getName());
        product.setCategory(category);
        product.setBrand(brand);
        product.setOriginalPrice(req.getOriginalPrice());
        product.setPromotionPrice(req.getPromotionPrice());
        product.setThumbnail(req.getThumbnail());
        product.setDescription(req.getDescription());
        product.setSpecsJson(req.getSpecsJson());

        if (req.getSku() != null && !req.getSku().trim().isEmpty()) {
            product.setSku(req.getSku());
        }
        if (req.getStockQuantity() != null) {
            product.setStockQuantity(req.getStockQuantity());
        }
        if (req.getIsFeatured() != null) {
            product.setIsFeatured(req.getIsFeatured());
        }
        if (req.getIsFlashSale() != null) {
            product.setIsFlashSale(req.getIsFlashSale());
        }
        if (req.getFlashSaleEndTime() != null) {
            product.setFlashSaleEndTime(req.getFlashSaleEndTime());
        }
        if (req.getIsActive() != null) {
            product.setIsActive(req.getIsActive());
        }

        // Update sub-images cleanly (orphanRemoval = true will delete the old ones)
        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        } else {
            product.getImages().clear();
        }

        if (req.getSubImages() != null) {
            for (String url : req.getSubImages()) {
                if (url != null && !url.trim().isEmpty()) {
                    product.getImages().add(
                        ProductImage.builder()
                            .imageUrl(url.trim())
                            .product(product)
                            .build()
                    );
                }
            }
        }

        return productRepository.save(product);
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH) + "-" + (System.currentTimeMillis() % 10000);
    }

    private String getRecordValue(CSVRecord record, String headerName) {
        if (record.isMapped(headerName)) {
            return record.get(headerName);
        }
        // Try case-insensitive matching, ignoring potential BOM or whitespace
        for (String key : record.getParser().getHeaderMap().keySet()) {
            String cleanKey = key.replace("\uFEFF", "").trim();
            if (cleanKey.equalsIgnoreCase(headerName)) {
                return record.get(key);
            }
        }
        return null;
    }

    /**
     * Fault-Tolerant Remote URL Sync to Cloudinary.
     * Catches broken 404 links gracefully and falls back to a default high-quality placeholder image.
     */
    private String syncUrlToCloudinary(String originalUrl, String subFolder) {
        if (originalUrl == null || originalUrl.trim().isEmpty()) {
            return FALLBACK_PLACEHOLDER_URL;
        }

        String url = originalUrl.trim();
        // If it's already a Cloudinary URL from our cloud (lseyhus0), preserve it
        if (url.contains("res.cloudinary.com/lseyhus0")) {
            return url;
        }

        try {
            @SuppressWarnings("rawtypes")
            Map uploadResult = cloudinaryService.uploadUrl(url, subFolder);
            if (uploadResult != null && uploadResult.containsKey("secure_url")) {
                return (String) uploadResult.get("secure_url");
            }
        } catch (Exception e) {
            System.err.println("Warning: Cloudinary upload failed for URL: [" + url + "]. Reason: " + e.getMessage() + ". Using fallback placeholder.");
        }

        return FALLBACK_PLACEHOLDER_URL;
    }

    @Transactional(rollbackFor = Exception.class)
    public List<Product> importProductsFromCsv(MultipartFile file) throws Exception {
        List<Product> products = new ArrayList<>();
        
        PushbackInputStream pushbackInputStream = new PushbackInputStream(file.getInputStream(), 8192);
        
        // 1. Detect and skip UTF-8 BOM if present
        byte[] bom = new byte[3];
        int read = pushbackInputStream.read(bom, 0, 3);
        if (read == 3 && (bom[0] & 0xFF) == 0xEF && (bom[1] & 0xFF) == 0xBB && (bom[2] & 0xFF) == 0xBF) {
            // BOM skipped
        } else if (read > 0) {
            pushbackInputStream.unread(bom, 0, read);
        }
        
        // 2. Read first line to detect delimiter (comma vs semicolon)
        byte[] buffer = new byte[4096];
        int bytesRead = pushbackInputStream.read(buffer, 0, 4096);
        char delimiter = ',';
        if (bytesRead > 0) {
            String firstBlock = new String(buffer, 0, bytesRead, StandardCharsets.UTF_8);
            String firstLine = firstBlock.split("\n")[0];
            long commaCount = firstLine.chars().filter(ch -> ch == ',').count();
            long semicolonCount = firstLine.chars().filter(ch -> ch == ';').count();
            if (semicolonCount > commaCount) {
                delimiter = ';';
            }
            pushbackInputStream.unread(buffer, 0, bytesRead);
        }
        
        CSVFormat csvFormat = CSVFormat.DEFAULT
                .withDelimiter(delimiter)
                .withFirstRecordAsHeader()
                .withIgnoreHeaderCase()
                .withTrim();
        
        try (BufferedReader fileReader = new BufferedReader(
                new InputStreamReader(pushbackInputStream, StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, csvFormat)) {
            
            Iterable<CSVRecord> csvRecords = csvParser.getRecords();
            long lineNumber = 1;
            
            for (CSVRecord csvRecord : csvRecords) {
                lineNumber = csvRecord.getRecordNumber() + 1;
                
                // Get name (required)
                String name = getRecordValue(csvRecord, "Name");
                if (name == null || name.trim().isEmpty()) {
                    throw new RuntimeException("Lỗi dòng " + lineNumber + ": Tên sản phẩm ('Name') là bắt buộc và không được để trống!");
                }
                name = name.trim();
                
                // Get SKU
                String sku = getRecordValue(csvRecord, "SKU");
                sku = sku != null ? sku.trim() : "";
                if (!sku.isEmpty()) {
                    if (productRepository.findBySku(sku).isPresent()) {
                        throw new RuntimeException("Lỗi dòng " + lineNumber + ": Mã SKU '" + sku + "' đã tồn tại trong hệ thống!");
                    }
                    // Check if sku is duplicated in the current CSV file list
                    for (Product loaded : products) {
                        if (sku.equalsIgnoreCase(loaded.getSku())) {
                            throw new RuntimeException("Lỗi dòng " + lineNumber + ": Mã SKU '" + sku + "' bị trùng lặp ngay trong tệp tải lên!");
                        }
                    }
                } else {
                    sku = "SKU-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
                }
                
                // Get Category (required)
                String categoryName = getRecordValue(csvRecord, "Category");
                if (categoryName == null || categoryName.trim().isEmpty()) {
                    throw new RuntimeException("Lỗi dòng " + lineNumber + ": Danh mục ('Category') là bắt buộc và không được để trống!");
                }
                categoryName = categoryName.trim();
                
                // Get Brand (required)
                String brandName = getRecordValue(csvRecord, "Brand");
                if (brandName == null || brandName.trim().isEmpty()) {
                    throw new RuntimeException("Lỗi dòng " + lineNumber + ": Thương hiệu ('Brand') là bắt buộc và không được để trống!");
                }
                brandName = brandName.trim();
                
                // Get OriginalPrice (required)
                String originalPriceStr = getRecordValue(csvRecord, "OriginalPrice");
                if (originalPriceStr == null || originalPriceStr.trim().isEmpty()) {
                    throw new RuntimeException("Lỗi dòng " + lineNumber + ": Giá niêm yết ('OriginalPrice') là bắt buộc!");
                }
                BigDecimal originalPrice;
                try {
                    originalPrice = new BigDecimal(originalPriceStr.trim());
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi dòng " + lineNumber + ": Giá niêm yết '" + originalPriceStr + "' không hợp lệ!");
                }
                
                // Get PromotionPrice
                BigDecimal promotionPrice = null;
                String promotionPriceStr = getRecordValue(csvRecord, "PromotionPrice");
                if (promotionPriceStr != null && !promotionPriceStr.trim().isEmpty()) {
                    try {
                        promotionPrice = new BigDecimal(promotionPriceStr.trim());
                    } catch (Exception e) {
                        throw new RuntimeException("Lỗi dòng " + lineNumber + ": Giá khuyến mãi '" + promotionPriceStr + "' không hợp lệ!");
                    }
                }
                
                // Get StockQuantity
                Integer stockQuantity = 10;
                String stockQuantityStr = getRecordValue(csvRecord, "StockQuantity");
                if (stockQuantityStr != null && !stockQuantityStr.trim().isEmpty()) {
                    try {
                        stockQuantity = Integer.parseInt(stockQuantityStr.trim());
                    } catch (Exception e) {
                        throw new RuntimeException("Lỗi dòng " + lineNumber + ": Số lượng tồn kho '" + stockQuantityStr + "' không hợp lệ!");
                    }
                }
                
                // Get Thumbnail (required)
                String thumbnail = getRecordValue(csvRecord, "Thumbnail");
                if (thumbnail == null || thumbnail.trim().isEmpty()) {
                    throw new RuntimeException("Lỗi dòng " + lineNumber + ": URL ảnh đại diện ('Thumbnail') là bắt buộc!");
                }
                thumbnail = thumbnail.trim();
                
                // Get Description & Specs
                String descriptionValue = getRecordValue(csvRecord, "Description");
                String description = descriptionValue != null ? descriptionValue.trim() : "";
                
                String specsJsonValue = getRecordValue(csvRecord, "SpecsJson");
                String specsJson = specsJsonValue != null ? specsJsonValue.trim() : "{}";
                
                String subImagesStrValue = getRecordValue(csvRecord, "SubImages");
                String subImagesStr = subImagesStrValue != null ? subImagesStrValue.trim() : "";
                
                // Category & Brand resolution (normalized case-insensitive)
                String finalCategoryName = categoryName;
                Category category = categoryRepository.findByNameIgnoreCase(finalCategoryName)
                        .orElseGet(() -> {
                            Category newCat = new Category();
                            newCat.setName(finalCategoryName);
                            newCat.setSlug(toSlug(finalCategoryName));
                            return categoryRepository.save(newCat);
                        });

                String finalBrandName = brandName;
                Brand brand = brandRepository.findByNameIgnoreCase(finalBrandName)
                        .orElseGet(() -> {
                            Brand newBrand = new Brand();
                            newBrand.setName(finalBrandName);
                            return brandRepository.save(newBrand);
                        });

                Product product = Product.builder()
                        .name(name)
                        .sku(sku)
                        .slug(toSlug(name))
                        .category(category)
                        .brand(brand)
                        .originalPrice(originalPrice)
                        .promotionPrice(promotionPrice)
                        .stockQuantity(stockQuantity)
                        .thumbnail(thumbnail)
                        .description(description)
                        .specsJson(specsJson)
                        .isFeatured(false)
                        .isFlashSale(false)
                        .isActive(true)
                        .images(new ArrayList<>())
                        .build();

                if (!subImagesStr.isEmpty()) {
                    String[] urls = subImagesStr.split(";");
                    for (String url : urls) {
                        if (!url.trim().isEmpty()) {
                            product.getImages().add(
                                    ProductImage.builder().imageUrl(url.trim()).product(product).build()
                            );
                        }
                    }
                }

                products.add(productRepository.save(product));
            }
        }

        // 3. PARALLEL CLOUDINARY REMOTE UPLOAD VIA CompletableFuture.supplyAsync() (3 - 5 Seconds Super Fast!)
        if (!products.isEmpty()) {
            List<CompletableFuture<Void>> futures = new ArrayList<>();

            for (Product p : products) {
                String subFolder = "sp-" + p.getId() + "-" + p.getSlug();

                // Async Thumbnail Sync Task
                if (p.getThumbnail() != null && !p.getThumbnail().trim().isEmpty()) {
                    CompletableFuture<Void> thumbFuture = CompletableFuture.runAsync(() -> {
                        String cloudinaryUrl = syncUrlToCloudinary(p.getThumbnail(), subFolder);
                        p.setThumbnail(cloudinaryUrl);
                    });
                    futures.add(thumbFuture);
                }

                // Async Sub-Images Sync Tasks
                if (p.getImages() != null && !p.getImages().isEmpty()) {
                    for (ProductImage img : p.getImages()) {
                        CompletableFuture<Void> subFuture = CompletableFuture.runAsync(() -> {
                            String cloudinaryUrl = syncUrlToCloudinary(img.getImageUrl(), subFolder);
                            img.setImageUrl(cloudinaryUrl);
                        });
                        futures.add(subFuture);
                    }
                }
            }

            // Wait for all parallel upload tasks to finish concurrently
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            // Save all products with official Cloudinary WebP URLs
            products = productRepository.saveAll(products);
        }

        return products;
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class BulkDeleteResult {
        private int deletedCount;
        private int skippedCount;
    }

    @Transactional(rollbackFor = Exception.class)
    public BulkDeleteResult deleteProducts(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new BulkDeleteResult(0, 0);
        }
        
        List<Long> orderedIds = productRepository.findProductIdsInOrderItems(ids);
        List<Long> safeIds = new ArrayList<>(ids);
        safeIds.removeAll(orderedIds);
        
        if (!safeIds.isEmpty()) {
            productRepository.deleteCartItemsByProductIds(safeIds);
            productRepository.deleteProductImagesByProductIds(safeIds);
            productRepository.deleteAllByIdInBatch(safeIds);
        }
        
        return new BulkDeleteResult(safeIds.size(), orderedIds.size());
    }
}
