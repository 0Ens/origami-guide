package dev.origamiguide.api.catalog;

import jakarta.validation.constraints.Pattern;
import java.util.List;
import java.util.Locale;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only endpoints for the origami catalog.
 *
 * <p>The {@link Locale} parameter is resolved by Spring from the request's
 * {@code Accept-Language} header, e.g. {@code Accept-Language: tr}.
 */
@RestController
@RequestMapping("/api/models")
class CatalogController {

    private final CatalogService catalogService;

    CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    List<ModelSummaryResponse> listModels(Locale locale) {
        return catalogService.listModels(locale);
    }

    @GetMapping("/{slug}")
    ModelDetailResponse getModel(
            @PathVariable @Pattern(regexp = "[a-z0-9-]{1,64}") String slug,
            Locale locale) {
        return catalogService.getModel(slug, locale);
    }
}
