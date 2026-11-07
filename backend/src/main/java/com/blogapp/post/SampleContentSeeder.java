package com.blogapp.post;

import com.blogapp.user.AppUser;
import com.blogapp.user.UserRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SampleContentSeeder implements ApplicationRunner {
    private final PostRepository posts;
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final boolean enabled;

    public SampleContentSeeder(PostRepository posts, UserRepository users, PasswordEncoder passwords,
                               @Value("${app.seed-sample-data:false}") boolean enabled) {
        this.posts=posts; this.users=users; this.passwords=passwords; this.enabled=enabled;
    }

    @Override @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled || !posts.findLatest(org.springframework.data.domain.PageRequest.of(0,1)).isEmpty()) return;
        AppUser author=users.findByUsernameIgnoreCase("ink_editorial").orElseGet(() -> {
            AppUser created=new AppUser("ink_editorial","editorial@ink-and-ideas.local",passwords.encode(UUID.randomUUID().toString()));
            created.setBio("The Ink & Ideas editorial desk shares thoughtful notes on creativity, culture, design, and everyday life.");
            created.setWebsiteUrl("https://example.com");
            return users.save(created);
        });
        if (!posts.findDetailedByAuthorId(author.getId()).isEmpty()) return;

        posts.saveAll(List.of(
            post(author,"The Art of Noticing Small Things","Ideas","photo-1455390582262-044cdead277a",true,
                "noticing, creativity, reflection", """
                ## Attention is a kind of generosity

                The best ideas often begin with a detail we almost walked past: a sentence overheard on the bus, the shape of late afternoon light, or the way a friend pauses before answering. Paying attention does not make ordinary life louder. It lets us hear what was already there.

                Try choosing one familiar part of your day and meeting it as if it were new. Take a different route. Leave your phone in your bag for ten minutes. Write down three things you would usually forget by dinner.

                Creativity is not always a lightning strike. Sometimes it is simply the habit of looking twice.
                """),
            post(author,"A Desk That Helps You Think","Design","photo-1497366754035-f200968a6e72",false,
                "design, workspace, focus", """
                ## Make the room easier to begin in

                A useful workspace is not a photograph of perfect productivity. It is a place where the next good action feels obvious. Keep the tools you reach for close, move the objects that pull your attention away, and leave a little open space for work that has not arrived yet.

                Light matters more than matching accessories. A comfortable chair matters more than a complicated system. Put a notebook where you can see it, keep water nearby, and let the room support the kind of thinking you want to do.

                Design becomes practical when it helps you return to your work with less friction.
                """),
            post(author,"Why Slow Travel Stays With Us","Travel","photo-1500530855697-b586d89ba3ee",false,
                "travel, place, culture", """
                ## Stay long enough to notice a rhythm

                A place reveals itself gradually. The bakery opens before the street gets busy. Neighbors greet one another by name. The evening walk follows the same few blocks, but never quite the same light.

                Slow travel makes room for these small patterns. Instead of collecting landmarks, choose one neighborhood and learn its ordinary routes. Eat where the menu is short. Ask what is in season. Leave an afternoon unscheduled.

                You may bring home fewer photographs, but more memories that feel like yours.
                """),
            post(author,"Make Room for a Daily Writing Practice","Writing","photo-1455390582262-044cdead277a",false,
                "writing, habits, creativity", """
                ## Start smaller than your ambition

                A writing practice becomes easier to keep when it is small enough to survive a busy day. Ten quiet minutes can be enough. Write one paragraph, collect a question, or describe something you saw on the way home.

                Choose a cue you already have: the first cup of tea, a lunch break, or the moment you close your laptop. Keep one document for rough notes so that beginning never depends on finding the perfect subject.

                The point is not to produce something impressive every day. It is to stay in conversation with your own ideas.
                """),
            post(author,"Rest Is Part of the Work","Life","photo-1470252649378-9c29740c9fa8",false,
                "wellbeing, balance, life", """
                ## Give your attention somewhere to recover

                Rest is not a reward we earn after doing everything. It is one of the conditions that lets us keep caring about what we do. A short walk, an unhurried meal, or an evening without notifications can return a little space to the mind.

                Recovery does not need to look impressive. It can be quiet and ordinary. The helpful question is not “Did I do enough to deserve a break?” but “What would help me meet tomorrow with a little more steadiness?”

                Make room for that answer before the day fills itself.
                """)
        ));
    }

    private BlogPost post(AppUser author,String title,String category,String photo,boolean featured,String tags,String content) {
        Set<String> normalized=new LinkedHashSet<>(List.of(tags.split(", ")));
        return new BlogPost(author,title,content.trim(),category,
                "https://images.unsplash.com/"+photo+"?auto=format&fit=crop&w=1400&q=85",normalized,
                "PUBLISHED","PUBLIC",featured,null);
    }
}
