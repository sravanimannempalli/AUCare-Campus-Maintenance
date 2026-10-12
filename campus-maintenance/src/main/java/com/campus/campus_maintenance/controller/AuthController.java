
package com.campus.campus_maintenance.controller;

import com.campus.campus_maintenance.entity.AppUser;
import com.campus.campus_maintenance.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            SecurityContextRepository securityContextRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser user) {

        if (user.getName() == null || user.getName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null
                || user.getPassword().length() < 8) {

            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "Enter your name, email, and a password of at least 8 characters."));
        }

        String email = user.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("message", "Email is already registered."));
        }

        AppUser newUser = new AppUser();
        newUser.setName(user.getName().trim());
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));

        // Public registration always creates a Student account.
        newUser.setRole("STUDENT");

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("message", "Registration successful. Please log in."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> details,
            HttpServletRequest request,
            HttpServletResponse response) {

        String email = details.get("email");
        String password = details.get("password");

        if (email == null || password == null
                || email.isBlank() || password.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required."));
        }

        AppUser user = userRepository
                .findByEmail(email.trim().toLowerCase())
                .orElse(null);

        if (user == null
                || !passwordEncoder.matches(password, user.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password."));
        }

        HttpSession session = request.getSession(true);

        var authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole()))
                );

        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // Persist the authenticated SecurityContext in the session.
        securityContextRepository.saveContext(
                context, request, response);

        
        session.setAttribute("userId", user.getId());
        session.setAttribute("userRole", user.getRole());

        return ResponseEntity.ok(Map.of(
                "message", "Login successful.",
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Please log in."));
        }

        Long userId = (Long) session.getAttribute("userId");

        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )))
                .orElseGet(() -> ResponseEntity.status(
                        HttpStatus.UNAUTHORIZED).body(
                        Map.of("message", "User not found.")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                Map.of("message", "Logged out successfully."));
    }
}
