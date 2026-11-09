package com.blogapp.contact;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "contact_messages", indexes = @Index(name = "idx_contact_created", columnList = "created_at"))
public class ContactMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String name;
    @Column(nullable = false, length = 150) private String email;
    @Column(nullable = false, length = 3000) private String message;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(nullable = false) private boolean read;

    protected ContactMessage() {}
    public ContactMessage(String name, String email, String message) { this.name = name; this.email = email; this.message = message; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isRead() { return read; }
    public void markRead() { this.read = true; }
}
