package dev.origamiguide.api.catalog;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.hibernate.annotations.ColumnTransformer;

@Entity
@Table(name = "fold_steps")
public class FoldStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "model_id", nullable = false)
    private OrigamiModel model;

    @Column(name = "step_number", nullable = false)
    private int stepNumber;

    /**
     * Fold definition as raw JSON. The backend does not interpret it; it is passed
     * through to the fold engine on the client (ADR-0002). The cast tells PostgreSQL
     * to store the bound text parameter as JSONB.
     */
    @Column(name = "fold", nullable = false, columnDefinition = "jsonb")
    @ColumnTransformer(write = "?::jsonb")
    private String fold;

    @ElementCollection
    @CollectionTable(name = "fold_step_translations", joinColumns = @JoinColumn(name = "step_id"))
    @MapKeyColumn(name = "locale", length = 5)
    @Column(name = "instruction", nullable = false, length = 500)
    private Map<String, String> instructions = new HashMap<>();

    protected FoldStep() {
    }

    FoldStep(OrigamiModel model, int stepNumber, String fold, Map<String, String> instructions) {
        this.model = model;
        this.stepNumber = stepNumber;
        this.fold = fold;
        this.instructions.putAll(instructions);
    }

    public Long getId() {
        return id;
    }

    public OrigamiModel getModel() {
        return model;
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public String getFold() {
        return fold;
    }

    public Map<String, String> getInstructions() {
        return Collections.unmodifiableMap(instructions);
    }
}
