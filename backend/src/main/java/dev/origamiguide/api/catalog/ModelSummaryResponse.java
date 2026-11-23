package dev.origamiguide.api.catalog;

/** One entry of the model list: everything a card on the home page needs, no steps. */
public record ModelSummaryResponse(
        String slug,
        String title,
        String summary,
        Difficulty difficulty,
        int stepCount,
        PaperResponse paper) {
}
