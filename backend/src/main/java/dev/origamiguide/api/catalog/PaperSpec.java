package dev.origamiguide.api.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.math.BigDecimal;

/**
 * The recommended square sheet for a model.
 *
 * <p>Embeddable: its columns live in the {@code origami_models} table and it has no
 * identity of its own. This is a "value object" - two PaperSpecs with the same values
 * are interchangeable.
 */
@Embeddable
public record PaperSpec(
        @Column(name = "paper_size_cm", nullable = false, precision = 4, scale = 1)
        BigDecimal sizeCm,

        @Enumerated(EnumType.STRING)
        @Column(name = "paper_type", nullable = false, length = 20)
        PaperType type,

        @Column(name = "front_color", nullable = false, length = 7)
        String frontColor,

        @Column(name = "back_color", nullable = false, length = 7)
        String backColor) {
}
