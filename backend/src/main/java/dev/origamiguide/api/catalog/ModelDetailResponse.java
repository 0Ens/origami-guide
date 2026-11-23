package dev.origamiguide.api.catalog;

import java.util.List;

public record ModelDetailResponse(
        String slug,
        String title,
        String summary,
        Difficulty difficulty,
        PaperResponse paper,
        List<StepResponse> steps) {
}
