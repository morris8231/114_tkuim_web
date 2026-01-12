package com.example.coffeeshop.security;

import com.example.coffeeshop.model.User;
import com.example.coffeeshop.repository.UserRepository;
import com.example.coffeeshop.service.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                try {
                    Claims claims = authService.parseToken(token);
                    String userId = claims.getSubject();
                    String role = (String) claims.get("role");

                    if (userId != null) {
                        User user = userRepository.findById(userId)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                        java.util.List<org.springframework.security.core.GrantedAuthority> authorities = java.util.List
                                .of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                        "ROLE_" + role));

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                user, null, authorities);

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (Exception e) {
                    System.out.println("JWT Verification Failed: " + e.getMessage());
                    // Do not throw; let the request proceed as anonymous
                }
            }
        } catch (Exception e) {
            System.err.println("Could not set user authentication in security context: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}