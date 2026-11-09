package com.blogapp.contact;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    private final ContactMessageRepository messages;
    public ContactController(ContactMessageRepository messages) { this.messages = messages; }

    @PostMapping
    public Response submit(@Valid @RequestBody Request request) {
        ContactMessage saved = messages.save(new ContactMessage(request.name().trim(), request.email().trim().toLowerCase(), request.message().trim()));
        return new Response(saved.getId(), "Your message has been sent. Thank you for reaching out.");
    }

    public record Request(@NotBlank @Size(max = 80) String name,
                          @NotBlank @Email @Size(max = 150) String email,
                          @NotBlank @Size(max = 3000) String message) {}
    public record Response(Long id, String message) {}
}
