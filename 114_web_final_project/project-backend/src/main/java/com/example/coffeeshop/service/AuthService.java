package com.example.coffeeshop.service;

import com.example.coffeeshop.model.User;
import com.example.coffeeshop.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

/**
 * Handles authentication and user management.  
 * Uses a BCrypt password encoder to store secure password hashes and JSON Web Tokens
 * to issue stateless session tokens.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String jwtSecret;
    private final long jwtExpirationMs;

    public AuthService(UserRepository userRepository,
                       @Value("${jwt.secret}") String jwtSecret,
                       @Value("${jwt.expiration}") long jwtExpirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtSecret = jwtSecret;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * Registers a new user with the MEMBER role by default.  
     * Throws IllegalArgumentException if the email is already taken.
     */
    public User register(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(User.Role.MEMBER);
        return userRepository.save(user);
    }

    /**
     * Authenticates a user and returns a JWT token if successful.  
     * Throws BadCredentialsException when the email or password is invalid.
     */
    public String login(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new BadCredentialsException("Invalid email or password");
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return generateToken(user);
    }

    /**
     * Generates a JWT token containing the user's id and role.  
     * The token is signed with the configured secret and expires after the configured period.
     */
    private String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(user.getId())
                .claim("role", user.getRole().name())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS256, jwtSecret)
                .compact();
    }

    /**
     * Parses a JWT token and returns the claims.  
     * Throws an exception if the token is invalid or expired.
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
    }
}