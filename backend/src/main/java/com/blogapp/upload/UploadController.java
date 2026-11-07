package com.blogapp.upload;

import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {
    private final CloudinaryService cloudinary;
    public UploadController(CloudinaryService cloudinary) { this.cloudinary = cloudinary; }

    @PostMapping("/images")
    @SecurityRequirement(name = "bearerAuth")
    public Map<String, String> uploadImage(@RequestPart("file") MultipartFile file) {
        return Map.of("url", cloudinary.uploadImage(file));
    }
}
