package dev.origamiguide.api.catalog;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.hibernate.annotations.Formula;

@Entity
@Table(name = "origami_models")
public class OrigamiModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Embedded
    private PaperSpec paper;

    /** Locale code ("en", "tr") to texts. Stored in origami_model_translations. */
    @ElementCollection
    @CollectionTable(name = "origami_model_translations", joinColumns = @JoinColumn(name = "model_id"))
    @MapKeyColumn(name = "locale", length = 5)
    private Map<String, ModelText> translations = new HashMap<>();

    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    private List<FoldStep> steps = new ArrayList<>();

    /** Computed by the database, so listing models does not load every step. */
    @Formula("(select count(*) from fold_steps s where s.model_id = id)")
    private int stepCount;

    /** Required by JPA; not meant for application code. */
    protected OrigamiModel() {
    }

    public OrigamiModel(String slug, Difficulty difficulty, PaperSpec paper, int sortOrder) {
        this.slug = slug;
        this.difficulty = difficulty;
        this.paper = paper;
        this.sortOrder = sortOrder;
    }

    public void putTranslation(String locale, ModelText text) {
        translations.put(locale, text);
    }

    /** Appends a step. Step numbers are assigned in order, starting at 1. */
    public FoldStep addStep(String foldJson, Map<String, String> instructions) {
        FoldStep step = new FoldStep(this, steps.size() + 1, foldJson, instructions);
        steps.add(step);
        return step;
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public PaperSpec getPaper() {
        return paper;
    }

    public Map<String, ModelText> getTranslations() {
        return Collections.unmodifiableMap(translations);
    }

    public List<FoldStep> getSteps() {
        return Collections.unmodifiableList(steps);
    }

    public int getStepCount() {
        return stepCount;
    }
}
