

package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        // Autorise le navigateur à envoyer le cookie de session
                        // (JSESSIONID) avec les appels authentifiés : sans ça,
                        // l'utilisateur serait déconnecté à chaque requête.
                        // Possible uniquement parce que allowedOrigins est une
                        // origine précise et non "*".
                        .allowCredentials(true);
            }
        };
    }
}