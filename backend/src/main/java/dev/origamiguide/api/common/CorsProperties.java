package dev.origamiguide.api.common;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Type-safe binding of the {@code app.cors.*} settings from application.yaml.
 * In production the value can be overridden with the APP_CORS_ALLOWED_ORIGINS
 * environment variable, without rebuilding the app.
 */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins) {

    public CorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
    }
}
