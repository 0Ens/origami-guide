package dev.origamiguide.api.catalog;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads models and turns entities into API responses in the caller's language.
 *
 * <p>Entities never leave this class: the web layer only sees response records, so the
 * database structure can change without breaking the API contract.
 */
@Service
@Transactional(readOnly = true)
public class CatalogService {

    static final String FALLBACK_LANGUAGE = "en";

    private final OrigamiModelRepository repository;

    // Constructor injection: dependencies are explicit, final and easy to mock in tests.
    public CatalogService(OrigamiModelRepository repository) {
        this.repository = repository;
    }

    public List<ModelSummaryResponse> listModels(Locale locale) {
        return repository.findAllByOrderBySortOrderAscSlugAsc().stream()
                .map(model -> toSummary(model, locale))
                .toList();
    }

    public ModelDetailResponse getModel(String slug, Locale locale) {
        OrigamiModel model = repository.findBySlug(slug)
                .orElseThrow(() -> new ModelNotFoundException(slug));
        ModelText text = localized(model.getTranslations(), locale);
        List<StepResponse> steps = model.getSteps().stream()
                .map(step -> new StepResponse(
                        step.getStepNumber(),
                        localized(step.getInstructions(), locale),
                        step.getFold()))
                .toList();
        return new ModelDetailResponse(model.getSlug(), text.title(), text.summary(),
                model.getDifficulty(), PaperResponse.of(model.getPaper(), text.paperNote()), steps);
    }

    private static ModelSummaryResponse toSummary(OrigamiModel model, Locale locale) {
        ModelText text = localized(model.getTranslations(), locale);
        return new ModelSummaryResponse(model.getSlug(), text.title(), text.summary(),
                model.getDifficulty(), model.getStepCount(),
                PaperResponse.of(model.getPaper(), text.paperNote()));
    }

    /**
     * Picks the text for the requested language, falling back to English and then to
     * any available language, so a missing translation never breaks the page.
     */
    static <T> T localized(Map<String, T> texts, Locale locale) {
        T text = texts.get(locale.getLanguage());
        if (text == null) {
            text = texts.get(FALLBACK_LANGUAGE);
        }
        if (text == null) {
            text = texts.values().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No translations available"));
        }
        return text;
    }
}
