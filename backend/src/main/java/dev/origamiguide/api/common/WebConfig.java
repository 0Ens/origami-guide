package dev.origamiguide.api.common;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS: browsers block JavaScript from calling an API on another origin
 * (scheme + host + port) unless the API explicitly allows it. The frontend dev
 * server runs on :5173 and the API on :8080, so the API must allow that origin.
 */
@Configuration
@EnableConfigurationProperties(CorsProperties.class)
class WebConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;

    WebConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(corsProperties.allowedOrigins().toArray(String[]::new))
                .allowedMethods("GET")
                .maxAge(3600);
    }
}
