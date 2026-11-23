package dev.origamiguide.api.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** Language-specific texts of an {@link OrigamiModel}. */
@Embeddable
public record ModelText(
        @Column(name = "title", nullable = false, length = 100)
        String title,

        @Column(name = "summary", nullable = false, length = 500)
        String summary,

        @Column(name = "paper_note", length = 300)
        String paperNote) {
}
