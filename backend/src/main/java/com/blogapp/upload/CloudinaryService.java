package com.blogapp.upload;

import com.blogapp.common.ApiException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryService {
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryService(@Value("${app.cloudinary.cloud-name}") String cloudName,
                             @Value("${app.cloudinary.api-key}") String apiKey,
                             @Value("${app.cloudinary.api-secret}") String apiSecret) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public String uploadImage(MultipartFile file) {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Image uploads need Cloudinary credentials in the environment");
        }
        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw ApiException.badRequest("Choose an image file");
        }
        if (file.getSize() > 10 * 1024 * 1024) throw ApiException.badRequest("Images must be 10 MB or smaller");
        try {
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName, "api_key", apiKey, "api_secret", apiSecret, "secure", true));
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "blogapp/posts", "resource_type", "image"));
            return result.get("secure_url").toString();
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloudinary could not store this image");
        }
    }
}
