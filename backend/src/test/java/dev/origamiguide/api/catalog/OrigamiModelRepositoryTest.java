package dev.origamiguide.api.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import dev.origamiguide.api.TestcontainersConfiguration;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;

/**
 * Slice test: only JPA beans are started, against a real PostgreSQL container with
 * the Flyway migrations applied. Each test runs in a transaction that is rolled back.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
class OrigamiModelRepositoryTest {

    @Autowired
    private OrigamiModelRepository repository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findsModelBySlugWithTranslationsAndOrderedSteps() {
        OrigamiModel model = newModel("dog-face", 1);
        model.addStep("{\"kind\": \"fold\", \"direction\": \"valley\"}", Map.of("en", "Fold in half."));
        model.addStep("{\"kind\": \"flip\"}", Map.of("en", "Turn over.", "tr", "Ters cevir."));
        repository.save(model);
        // Write to the DB and empty the persistence context so the next read
        // really goes to PostgreSQL instead of returning cached objects.
        entityManager.flush();
        entityManager.clear();

        OrigamiModel found = repository.findBySlug("dog-face").orElseThrow();

        assertThat(found.getTranslations()).containsOnlyKeys("en", "tr");
        assertThat(found.getPaper().sizeCm()).isEqualByComparingTo("15.0");
        assertThat(found.getStepCount()).isEqualTo(2);
        assertThat(found.getSteps()).extracting(FoldStep::getStepNumber).containsExactly(1, 2);
        assertThat(found.getSteps().get(1).getInstructions()).containsEntry("tr", "Ters cevir.");
    }

    @Test
    void storesFoldDefinitionAsJsonb() {
        OrigamiModel model = newModel("cup", 1);
        model.addStep("{\"kind\":\"fold\",\"line\":[[0,0],[1,1]]}", Map.of("en", "Fold."));
        repository.save(model);
        entityManager.flush();
        entityManager.clear();

        String fold = repository.findBySlug("cup").orElseThrow().getSteps().getFirst().getFold();

        // PostgreSQL normalizes JSONB, which proves it was parsed and not stored as text.
        assertThat(fold).isEqualTo("{\"kind\": \"fold\", \"line\": [[0, 0], [1, 1]]}");
    }

    @Test
    void listsModelsInSortOrder() {
        repository.save(newModel("second", 2));
        repository.save(newModel("first", 1));

        assertThat(repository.findAllByOrderBySortOrderAscSlugAsc())
                .extracting(OrigamiModel::getSlug)
                .containsExactly("first", "second");
    }

    @Test
    void returnsEmptyForUnknownSlug() {
        assertThat(repository.findBySlug("does-not-exist")).isEmpty();
    }

    private static OrigamiModel newModel(String slug, int sortOrder) {
        PaperSpec paper = new PaperSpec(new BigDecimal("15.0"), PaperType.KAMI, "#e5533d", "#ffffff");
        OrigamiModel model = new OrigamiModel(slug, Difficulty.BEGINNER, paper, sortOrder);
        model.putTranslation("en", new ModelText("Title " + slug, "Summary", null));
        model.putTranslation("tr", new ModelText("Baslik " + slug, "Ozet", null));
        return model;
    }
}
