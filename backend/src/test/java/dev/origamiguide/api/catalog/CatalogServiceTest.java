package dev.origamiguide.api.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Plain unit test: no Spring context, the repository is a Mockito mock. */
class CatalogServiceTest {

    private final OrigamiModelRepository repository = mock(OrigamiModelRepository.class);
    private final CatalogService service = new CatalogService(repository);

    private OrigamiModel dogFace;

    @BeforeEach
    void setUp() {
        PaperSpec paper = new PaperSpec(new BigDecimal("15.0"), PaperType.KAMI, "#e5533d", "#ffffff");
        dogFace = new OrigamiModel("dog-face", Difficulty.BEGINNER, paper, 1);
        dogFace.putTranslation("en", new ModelText("Dog face", "A cute dog.", "Any square works."));
        dogFace.putTranslation("tr", new ModelText("Kopek yuzu", "Sevimli bir kopek.", null));
        dogFace.addStep("{\"kind\":\"fold\"}", Map.of("en", "Fold in half.", "tr", "Ikiye katla."));
        dogFace.addStep("{\"kind\":\"flip\"}", Map.of("en", "Turn over."));
    }

    @Test
    void returnsDetailInRequestedLanguage() {
        when(repository.findBySlug("dog-face")).thenReturn(Optional.of(dogFace));

        ModelDetailResponse detail = service.getModel("dog-face", Locale.forLanguageTag("tr-TR"));

        assertThat(detail.title()).isEqualTo("Kopek yuzu");
        assertThat(detail.steps()).extracting(StepResponse::instruction)
                .containsExactly("Ikiye katla.", "Turn over.");
    }

    @Test
    void fallsBackToEnglishForUnknownLanguage() {
        when(repository.findBySlug("dog-face")).thenReturn(Optional.of(dogFace));

        ModelDetailResponse detail = service.getModel("dog-face", Locale.JAPANESE);

        assertThat(detail.title()).isEqualTo("Dog face");
        assertThat(detail.paper().note()).isEqualTo("Any square works.");
    }

    @Test
    void throwsWhenModelDoesNotExist() {
        when(repository.findBySlug("crane")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getModel("crane", Locale.ENGLISH))
                .isInstanceOf(ModelNotFoundException.class)
                .hasMessageContaining("crane");
    }

    @Test
    void listsSummaries() {
        when(repository.findAllByOrderBySortOrderAscSlugAsc()).thenReturn(List.of(dogFace));

        assertThat(service.listModels(Locale.ENGLISH))
                .singleElement()
                .satisfies(summary -> {
                    assertThat(summary.slug()).isEqualTo("dog-face");
                    assertThat(summary.paper().sizeCm()).isEqualByComparingTo("15");
                });
    }

    @Test
    void localizedUsesAnyLanguageWhenEnglishIsMissing() {
        assertThat(CatalogService.localized(Map.of("tr", "Merhaba"), Locale.GERMAN)).isEqualTo("Merhaba");
    }
}
